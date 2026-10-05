<?php

namespace App\Http\Controllers;

use App\Models\AuditoriaLog;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AsignacionController extends Controller
{
    /**
     * Módulo integral de asignación clínica: estudiantes a pacientes o viceversa.
     */
    public function index(Request $request): Response
    {
        $vista = $request->input('vista', 'estudiantes'); // 'estudiantes' o 'pacientes'
        $buscar = $request->input('buscar');
        $filtroEstado = $request->input('estado_asignacion'); // 'todos', 'sin_asignar', 'asignados'

        // 1. Cargar estudiantes activos con sus pacientes asignados y conteo
        $estudiantesQuery = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })->where('is_active', true)
        ->with(['pacientesAsignados' => function ($q) {
            $q->select('id', 'ci', 'nombres', 'apellido_paterno', 'apellido_materno', 'estudiante_asignado_id', 'fecha_nacimiento', 'sexo')
              ->latest('id');
        }])
        ->withCount('pacientesAsignados')
        ->orderBy('name');

        if ($buscar && $vista === 'estudiantes') {
            $estudiantesQuery->where(function ($q) use ($buscar) {
                $q->where('name', 'ilike', "%{$buscar}%")
                    ->orWhere('email', 'ilike', "%{$buscar}%")
                    ->orWhere('codigo_institucional', 'ilike', "%{$buscar}%");
            });
        }

        $estudiantes = $estudiantesQuery->get();

        // 2. Cargar pacientes con su estudiante asignado
        $pacientesQuery = Paciente::with(['estudianteAsignado:id,name,codigo_institucional', 'antecedentesMedicos:id,paciente_id,alerta_alergia,alerta_hipertension,alerta_coagulacion,alerta_diabetes'])
            ->latest('id');

        if ($buscar && $vista === 'pacientes') {
            $pacientesQuery->where(function ($q) use ($buscar) {
                $q->where('ci', 'ilike', "%{$buscar}%")
                    ->orWhere('nombres', 'ilike', "%{$buscar}%")
                    ->orWhere('apellido_paterno', 'ilike', "%{$buscar}%")
                    ->orWhere('apellido_materno', 'ilike', "%{$buscar}%");
            });
        }

        if ($filtroEstado === 'sin_asignar') {
            $pacientesQuery->whereNull('estudiante_asignado_id');
        } elseif ($filtroEstado === 'asignados') {
            $pacientesQuery->whereNotNull('estudiante_asignado_id');
        }

        $pacientes = $pacientesQuery->paginate(12)->withQueryString();

        // 3. Pacientes sin asignar listos para picker rápido
        $pacientesSinAsignar = Paciente::whereNull('estudiante_asignado_id')
            ->select('id', 'ci', 'nombres', 'apellido_paterno', 'apellido_materno')
            ->orderBy('apellido_paterno')
            ->get();

        // 4. Estadísticas del módulo
        $totalPacientes = Paciente::count();
        $totalAsignados = Paciente::whereNotNull('estudiante_asignado_id')->count();
        $totalSinAsignar = Paciente::whereNull('estudiante_asignado_id')->count();
        $totalEstudiantes = $estudiantes->count();

        return Inertia::render('Asignaciones/Index', [
            'estudiantes' => $estudiantes,
            'pacientes' => $pacientes,
            'pacientesSinAsignar' => $pacientesSinAsignar,
            'estadisticas' => [
                'total_pacientes' => $totalPacientes,
                'total_asignados' => $totalAsignados,
                'total_sin_asignar' => $totalSinAsignar,
                'total_estudiantes' => $totalEstudiantes,
            ],
            'filtros' => [
                'vista' => $vista,
                'buscar' => $buscar,
                'estado_asignacion' => $filtroEstado,
            ],
        ]);
    }

    /**
     * Asigna un paciente a un estudiante (o reasigna de uno a otro).
     */
    public function asignar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'estudiante_id' => 'required|exists:users,id',
            'motivo' => 'nullable|string|max:255',
        ]);

        $paciente = Paciente::findOrFail($validated['paciente_id']);
        $estudiante = User::findOrFail($validated['estudiante_id']);
        $anteriorEstudianteId = $paciente->estudiante_asignado_id;

        $paciente->estudiante_asignado_id = $estudiante->id;
        $paciente->save();

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'paciente_asignado_modulo',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => [
                'estudiante_anterior_id' => $anteriorEstudianteId,
                'estudiante_nuevo_id' => $estudiante->id,
                'estudiante_nombre' => $estudiante->name,
                'motivo' => $validated['motivo'] ?? 'Asignación desde módulo central',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Paciente {$paciente->nombre_completo} asignado a {$estudiante->name}.");
    }

    /**
     * Desasigna / libera un paciente de su estudiante.
     */
    public function desasignar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'motivo' => 'nullable|string|max:255',
        ]);

        $paciente = Paciente::findOrFail($validated['paciente_id']);
        $anteriorEstudianteId = $paciente->estudiante_asignado_id;
        $anteriorEstudiante = $anteriorEstudianteId ? User::find($anteriorEstudianteId) : null;

        $paciente->estudiante_asignado_id = null;
        $paciente->save();

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'paciente_desasignado_modulo',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => [
                'estudiante_anterior_id' => $anteriorEstudianteId,
                'motivo' => $validated['motivo'] ?? 'Desasignación clínica',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $nombre = $anteriorEstudiante ? "del estudiante {$anteriorEstudiante->name}" : "";
        return back()->with('success', "Paciente {$paciente->nombre_completo} liberado {$nombre}.");
    }

    /**
     * Asignación múltiple / por lote.
     */
    public function asignarMasivo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'paciente_ids' => 'required|array|min:1',
            'paciente_ids.*' => 'exists:pacientes,id',
            'estudiante_id' => 'required|exists:users,id',
            'motivo' => 'nullable|string|max:255',
        ]);

        $estudiante = User::findOrFail($validated['estudiante_id']);
        $afectados = Paciente::whereIn('id', $validated['paciente_ids'])
            ->update(['estudiante_asignado_id' => $estudiante->id]);

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'asignacion_masiva_modulo',
            'tabla' => 'pacientes',
            'registro_id' => $estudiante->id,
            'payload_diff' => [
                'paciente_ids' => $validated['paciente_ids'],
                'cantidad' => $afectados,
                'estudiante_id' => $estudiante->id,
                'motivo' => $validated['motivo'] ?? 'Asignación masiva',
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Se asignaron {$afectados} pacientes al estudiante {$estudiante->name}.");
    }
}
