<?php

namespace App\Http\Controllers;

use App\Models\AuditoriaLog;
use App\Models\HistoriaClinica;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HistoriaClinicaController extends Controller
{
    /**
     * Listado general de historias clínicas (HC-001) con filtros.
     */
    public function index(Request $request): Response
    {
        $buscar = $request->input('buscar');
        $estado = $request->input('estado');

        $user = Auth::user();
        $query = HistoriaClinica::query()
            ->with(['paciente:id,ci,nombres,apellido_paterno,apellido_materno', 'estudiante:id,name', 'docenteSupervisor:id,name'])
            ->latest('id');

        // Si es estudiante, muestra preferentemente las asignadas a él
        if ($user && $user->rol && $user->rol->slug === 'estudiante') {
            $query->where('estudiante_id', $user->id);
        }

        if ($buscar) {
            $query->where(function ($q) use ($buscar) {
                $q->where('numero_expediente', 'ilike', "%{$buscar}%")
                    ->orWhere('motivo_consulta', 'ilike', "%{$buscar}%")
                    ->orWhere('diagnostico_definitivo', 'ilike', "%{$buscar}%")
                    ->orWhereHas('paciente', function ($qp) use ($buscar) {
                        $qp->where('ci', 'ilike', "%{$buscar}%")
                            ->orWhere('nombres', 'ilike', "%{$buscar}%")
                            ->orWhere('apellido_paterno', 'ilike', "%{$buscar}%");
                    });
            });
        }

        if ($estado) {
            $query->where('estado', $estado);
        }

        $historias = $query->paginate(12)->withQueryString();

        return Inertia::render('HistoriasClinicas/Index', [
            'historias' => $historias,
            'filtros' => [
                'buscar' => $buscar,
                'estado' => $estado,
            ],
        ]);
    }

    /**
     * Formulario interactivo (Wizard por pasos) para crear una nueva Historia Clínica HC-001.
     */
    public function create(Request $request): Response
    {
        $pacienteId = $request->query('paciente_id');
        $paciente = $pacienteId ? Paciente::with('antecedentesMedicos')->findOrFail($pacienteId) : null;

        $docentes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'docente');
        })->where('is_active', true)->select('id', 'name')->get();

        $pacientes = Paciente::select('id', 'ci', 'nombres', 'apellido_paterno', 'apellido_materno')->get();

        return Inertia::render('HistoriasClinicas/Create', [
            'pacienteSeleccionado' => $paciente,
            'pacientes' => $pacientes,
            'docentes' => $docentes,
        ]);
    }

    /**
     * Almacena una nueva historia clínica en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'docente_supervisor_id' => 'nullable|exists:users,id',
            'motivo_consulta' => 'required|string',
            'enfermedad_actual' => 'nullable|string',
            'signos_vitales' => 'nullable|array',
            'examen_estomatologico' => 'nullable|array',
            'diagnostico_presuntivo' => 'nullable|string',
            'diagnostico_definitivo' => 'nullable|string',
            'pronostico' => 'nullable|string',
            'plan_tratamiento' => 'nullable|string',
            'estado' => 'nullable|string|in:borrador,en_revision,aprobada,rechazada',
            'enviar_a_revision' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $historia = new HistoriaClinica();
        $historia->paciente_id = $validated['paciente_id'];
        $historia->estudiante_id = $user ? $user->id : User::whereHas('rol', fn($q) => $q->where('slug', 'estudiante'))->value('id');
        $historia->docente_supervisor_id = $validated['docente_supervisor_id'] ?? null;
        $historia->motivo_consulta = $validated['motivo_consulta'];
        $historia->enfermedad_actual = $validated['enfermedad_actual'] ?? null;
        $historia->signos_vitales = $validated['signos_vitales'] ?? [];
        $historia->examen_estomatologico = $validated['examen_estomatologico'] ?? [];
        $historia->diagnostico_presuntivo = $validated['diagnostico_presuntivo'] ?? null;
        $historia->diagnostico_definitivo = $validated['diagnostico_definitivo'] ?? null;
        $historia->pronostico = $validated['pronostico'] ?? null;
        $historia->plan_tratamiento = $validated['plan_tratamiento'] ?? null;
        $historia->estado = $validated['estado'] ?? (!empty($validated['enviar_a_revision']) ? 'en_revision' : 'borrador');
        $historia->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'historia_clinica_creada',
            'tabla' => 'historias_clinicas',
            'registro_id' => $historia->id,
            'payload_diff' => ['nuevo' => $historia->toArray()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return redirect()->route('historias-clinicas.show', $historia->id)
            ->with('success', 'Historia Clínica HC-001 registrada exitosamente.');
    }

    /**
     * Muestra en detalle una historia clínica existente.
     */
    public function show(int $id): Response
    {
        $historia = HistoriaClinica::with([
            'paciente.antecedentesMedicos',
            'estudiante:id,name,codigo_institucional,email',
            'docenteSupervisor:id,name,email',
            'odontogramas' => fn($q) => $q->latest('version'),
            'periodontogramas' => fn($q) => $q->latest('version'),
            'planesTratamiento.fases',
        ])->findOrFail($id);

        return Inertia::render('HistoriasClinicas/Show', [
            'historia' => $historia,
        ]);
    }

    /**
     * Actualiza el contenido clínico de una HC-001 (si está en borrador o rechazada).
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $historia = HistoriaClinica::findOrFail($id);

        $validated = $request->validate([
            'motivo_consulta' => 'required|string',
            'enfermedad_actual' => 'nullable|string',
            'signos_vitales' => 'nullable|array',
            'examen_estomatologico' => 'nullable|array',
            'diagnostico_presuntivo' => 'nullable|string',
            'diagnostico_definitivo' => 'nullable|string',
            'pronostico' => 'nullable|string',
            'plan_tratamiento' => 'nullable|string',
            'docente_supervisor_id' => 'nullable|exists:users,id',
        ]);

        $historia->update($validated);

        return back()->with('success', 'Historia Clínica actualizada.');
    }

    /**
     * Transición de estados del workflow académico (Borrador -> En Revisión -> Aprobado / Rechazado).
     */
    public function cambiarEstado(Request $request, int $id): RedirectResponse
    {
        $historia = HistoriaClinica::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|string|in:borrador,en_revision,aprobada,aprobado,rechazada,rechazado',
            'observaciones_docente' => 'nullable|string',
        ]);

        $user = Auth::user();
        $nuevoEstado = in_array($validated['estado'], ['aprobada', 'aprobado']) ? 'aprobada' : (
            in_array($validated['estado'], ['rechazada', 'rechazado']) ? 'rechazada' : $validated['estado']
        );

        $historia->estado = $nuevoEstado;

        if (isset($validated['observaciones_docente'])) {
            $historia->observaciones_docente = $validated['observaciones_docente'];
        }

        if ($nuevoEstado === 'aprobada') {
            $historia->fecha_aprobacion = now();
            if ($user && $user->rol && in_array($user->rol->slug, ['docente', 'admin', 'director_clinica'])) {
                $historia->docente_supervisor_id = $user->id;
            }
        }

        $historia->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'cambio_estado_hc',
            'tabla' => 'historias_clinicas',
            'registro_id' => $historia->id,
            'payload_diff' => ['estado' => $historia->estado, 'observaciones' => $historia->observaciones_docente],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Estado de la Historia Clínica actualizado a '{$nuevoEstado}'.");
    }
}
