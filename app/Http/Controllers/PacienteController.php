<?php

namespace App\Http\Controllers;

use App\Models\AntecedenteMedico;
use App\Models\Arancel;
use App\Models\AuditoriaLog;
use App\Models\Paciente;
use App\Models\Periodontograma;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PacienteController extends Controller
{
    /**
     * Muestra el listado de pacientes con buscador en tiempo real y filtros rápidos.
     */
    public function index(Request $request): Response
    {
        $buscar = $request->input('buscar');
        $filtroAlerta = $request->input('alerta'); // 'alergia', 'hipertension', 'coagulacion', 'diabetes'
        $filtroEstudiante = $request->input('estudiante_id'); // 'mis_pacientes', 'sin_asignar', o user_id
        $filtroEstado = $request->input('estado_paciente'); // 'activo', 'inactivo', 'referido', 'transferido'
        $filtroClinico = $request->input('estado_clinico'); // 'en_evaluacion', 'en_tratamiento', 'alta_clinica', 'abandono'

        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        $query = Paciente::query()
            ->with(['antecedentesMedicos', 'estudianteAsignado:id,name,codigo_institucional,email'])
            ->latest('id');

        if ($buscar) {
            $query->where(function ($q) use ($buscar) {
                $q->where('iup', 'ilike', "%{$buscar}%")
                    ->orWhere('ci', 'ilike', "%{$buscar}%")
                    ->orWhere('nombres', 'ilike', "%{$buscar}%")
                    ->orWhere('apellido_paterno', 'ilike', "%{$buscar}%")
                    ->orWhere('apellido_materno', 'ilike', "%{$buscar}%")
                    ->orWhere('email', 'ilike', "%{$buscar}%")
                    ->orWhere('celular', 'ilike', "%{$buscar}%")
                    ->orWhereRaw("CONCAT(nombres, ' ', apellido_paterno, ' ', apellido_materno) ilike ?", ["%{$buscar}%"]);
            });
        }

        if ($filtroEstado) {
            $query->where('estado_paciente', $filtroEstado);
        }

        if ($filtroClinico) {
            $query->where('estado_clinico', $filtroClinico);
        }

        if ($filtroAlerta) {
            $query->whereHas('antecedentesMedicos', function ($q) use ($filtroAlerta) {
                if ($filtroAlerta === 'alergia') $q->where('alerta_alergia', true);
                if ($filtroAlerta === 'hipertension') $q->where('alerta_hipertension', true);
                if ($filtroAlerta === 'coagulacion') $q->where('alerta_coagulacion', true);
                if ($filtroAlerta === 'diabetes') $q->where('alerta_diabetes', true);
            });
        }

        if ($rolSlug === 'estudiante') {
            $query->where('estudiante_asignado_id', $user->id);
        } elseif ($filtroEstudiante === 'mis_pacientes' && $user) {
            $query->where('estudiante_asignado_id', $user->id);
        } elseif ($filtroEstudiante === 'sin_asignar') {
            $query->whereNull('estudiante_asignado_id');
        } elseif (!empty($filtroEstudiante) && is_numeric($filtroEstudiante)) {
            $query->where('estudiante_asignado_id', (int) $filtroEstudiante);
        }

        $pacientes = $query->paginate(12)->withQueryString();

        $estudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })->where('is_active', true)->select('id', 'name', 'codigo_institucional')->orderBy('name')->get();

        return Inertia::render('Pacientes/Index', [
            'pacientes' => $pacientes,
            'estudiantes' => $estudiantes,
            'filtros' => [
                'buscar' => $buscar,
                'alerta' => $filtroAlerta,
                'estudiante_id' => $filtroEstudiante,
                'estado_paciente' => $filtroEstado,
                'estado_clinico' => $filtroClinico,
            ],
        ]);
    }

    /**
     * Búsqueda rápida instantánea para autocompletado y cabecera de navegación (IUP, CI, Nombres).
     */
    public function buscarRapido(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        $isPgsql = DB::getDriverName() === 'pgsql';
        $likeOp = $isPgsql ? 'ilike' : 'like';

        $query = Paciente::query()
            ->select([
                'id', 'iup', 'ci', 'ci_expedido', 'nombres', 'apellido_paterno', 'apellido_materno',
                'fecha_nacimiento', 'estado_paciente', 'estado_clinico', 'estudiante_asignado_id',
                'saldo_cuenta', 'fecha_ultima_consulta'
            ])
            ->with(['estudianteAsignado:id,name', 'antecedentesMedicos:id,paciente_id,alerta_alergia,alerta_hipertension,alerta_coagulacion,alerta_diabetes'])
            ->where(function ($sub) use ($q, $likeOp, $isPgsql) {
                $sub->where('iup', $likeOp, "%{$q}%")
                    ->orWhere('ci', $likeOp, "%{$q}%")
                    ->orWhere('nombres', $likeOp, "%{$q}%")
                    ->orWhere('apellido_paterno', $likeOp, "%{$q}%")
                    ->orWhere('apellido_materno', $likeOp, "%{$q}%");

                if ($isPgsql) {
                    $sub->orWhereRaw("CONCAT(nombres, ' ', apellido_paterno, ' ', COALESCE(apellido_materno, '')) ilike ?", ["%{$q}%"]);
                } else {
                    $sub->orWhereRaw("(nombres || ' ' || apellido_paterno || ' ' || COALESCE(apellido_materno, '')) like ?", ["%{$q}%"]);
                }
            });

        if ($rolSlug === 'estudiante') {
            $query->where('estudiante_asignado_id', $user->id);
        }

        $resultados = $query->limit(10)->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'iup' => $p->iup,
                'ci' => $p->ci . ($p->ci_expedido ? " {$p->ci_expedido}" : ''),
                'nombre_completo' => $p->nombre_completo,
                'edad' => $p->edad,
                'estado_paciente' => $p->estado_paciente,
                'estado_clinico' => $p->estado_clinico,
                'estudiante_nombre' => $p->estudianteAsignado?->name ?? 'Sin asignar',
                'saldo_cuenta' => $p->saldo_cuenta,
                'fecha_ultima_consulta' => $p->fecha_ultima_consulta?->format('d/m/Y') ?? 'Sin visitas previas',
                'alertas_medicas' => $p->alertas_medicas,
            ];
        });

        return response()->json($resultados);
    }

    /**
     * Formulario para dar de alta a un paciente con datos demográficos completos y consentimiento.
     */
    public function create(): Response
    {
        $estudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })->where('is_active', true)->select('id', 'name', 'codigo_institucional')->get();

        return Inertia::render('Pacientes/Create', [
            'estudiantes' => $estudiantes,
        ]);
    }

    /**
     * Almacena un nuevo paciente en la base de datos con IUP automático y consentimiento.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ci' => 'required|string|max:30|unique:pacientes,ci',
            'ci_expedido' => 'nullable|string|max:10',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'sexo' => 'required|string|in:M,F,Otro,Masculino,Femenino',
            'estado_civil' => 'nullable|string|max:50',
            'nacionalidad' => 'nullable|string|max:60',
            'ocupacion' => 'nullable|string|max:100',
            'nivel_instruccion' => 'nullable|string|max:60',
            'lugar_nacimiento' => 'nullable|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:30',
            'celular' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'fuente_referencia' => 'nullable|string|max:100',
            'seguro_convenio' => 'nullable|string|max:150',
            'numero_poliza' => 'nullable|string|max:60',
            'contacto_emergencia' => 'nullable|string|max:150',
            'telefono_emergencia' => 'nullable|string|max:30',
            'parentesco_emergencia' => 'nullable|string|max:50',
            'estado_paciente' => 'nullable|string|in:activo,inactivo,referido,transferido',
            'estado_clinico' => 'nullable|string|in:en_evaluacion,en_tratamiento,alta_clinica,abandono',
            'estudiante_asignado_id' => 'nullable|exists:users,id',
            'consentimiento_firmado' => 'nullable|boolean',
            'reglamento_aceptado' => 'nullable|boolean',
            'privacidad_aceptada' => 'nullable|boolean',
            'observaciones_consentimiento' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        if ($user && $user->rol && $user->rol->slug === 'estudiante' && empty($validated['estudiante_asignado_id'])) {
            $validated['estudiante_asignado_id'] = $user->id;
        }

        if (empty($validated['estado_paciente'])) {
            $validated['estado_paciente'] = 'activo';
        }
        if (empty($validated['estado_clinico'])) {
            $validated['estado_clinico'] = 'en_evaluacion';
        }
        if (empty($validated['nacionalidad'])) {
            $validated['nacionalidad'] = 'Boliviana';
        }

        // Si se aceptó el consentimiento inicial
        if (!empty($validated['consentimiento_firmado']) || !empty($validated['reglamento_aceptado'])) {
            $validated['consentimiento_inicial'] = [
                'firmado' => true,
                'fecha_hora' => now()->toDateTimeString(),
                'tipo' => 'digital_formulario',
                'reglamento_general_aceptado' => (bool)($validated['reglamento_aceptado'] ?? true),
                'politica_privacidad_aceptada' => (bool)($validated['privacidad_aceptada'] ?? true),
                'responsable_nombre' => $user?->name ?? 'Admisión',
                'responsable_id' => $user?->id,
                'observaciones' => $validated['observaciones_consentimiento'] ?? 'Consentimiento informado inicial aceptado en admisión.',
            ];
        }

        $paciente = Paciente::create($validated);

        // Crear contenedor vacío de antecedentes
        AntecedenteMedico::create([
            'paciente_id' => $paciente->id,
            'estudiante_registra_id' => $user?->id,
            'patologicos_personales' => [],
            'patologicos_familiares' => [],
            'no_patologicos' => [],
            'ginecologicos' => [],
            'motivo_consulta_paciente' => null,
            'antecedentes_odontologicos' => [],
            'diagnosticos_codificados' => [],
            'plan_tratamiento_secuencia' => [],
            'odontologia_legal_forense' => [],
        ]);

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'paciente_creado',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => $paciente->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return redirect()->route('pacientes.show', $paciente->id)
            ->with('success', "Paciente {$paciente->nombre_completo} registrado exitosamente con IUP: {$paciente->iup}.");
    }

    /**
     * Muestra el expediente clínico completo del paciente (4 antecedentes, HC-001, etc.).
     */
    public function show(int $id): Response
    {
        $paciente = Paciente::with([
            'estudianteAsignado:id,name,codigo_institucional,email',
            'antecedentesMedicos.docenteSupervisor:id,name',
            'historiasClinicas' => function ($q) {
                $q->with(['estudiante:id,name', 'docenteSupervisor:id,name'])->latest('id');
            },
            'planesTratamiento' => function ($q) {
                $q->with(['estudiante:id,name', 'docenteSupervisor:id,name', 'fases'])->latest('id');
            },
            'remisionesIntercatedra' => function ($q) {
                $q->with(['estudianteEmisor:id,name', 'docenteAutoriza:id,name', 'estudianteReceptor:id,name'])->latest('id');
            },
            'transferencias' => function ($q) {
                $q->with(['estudianteAnterior:id,name', 'estudianteNuevo:id,name', 'docenteAutoriza:id,name'])->latest('id');
            },
        ])->findOrFail($id);

        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        // Restricción estricta: estudiantes solo pueden acceder a sus pacientes asignados
        if ($rolSlug === 'estudiante' && $paciente->estudiante_asignado_id !== $user->id) {
            abort(403, 'Acceso restringido: Solo puedes consultar y atender a pacientes asignados formalmente a tu usuario.');
        }

        $periodontograma = Periodontograma::where('paciente_id', $id)->latest('id')->first();

        $docentes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'docente');
        })->select('id', 'name')->get();

        $estudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })->where('is_active', true)->select('id', 'name', 'codigo_institucional', 'email')->orderBy('name')->get();

        $aranceles = Arancel::where('activo', true)->orderBy('categoria')->orderBy('nombre')->get();

        return Inertia::render('Pacientes/Expediente', [
            'paciente' => $paciente,
            'antecedentes' => $paciente->antecedentesMedicos,
            'periodontograma' => $periodontograma,
            'historiasClinicas' => $paciente->historiasClinicas,
            'docentes' => $docentes,
            'estudiantes' => $estudiantes,
            'aranceles' => $aranceles,
        ]);
    }

    /**
     * Guarda o actualiza los antecedentes y módulos clínicos del paciente.
     */
    public function guardarAntecedentes(Request $request, int $id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        // Si es estudiante, verificar asignación formal
        if ($rolSlug === 'estudiante') {
            if ($paciente->estudiante_asignado_id && $paciente->estudiante_asignado_id !== $user->id) {
                return back()->with('error', 'No tienes permisos para modificar el expediente: este paciente está asignado a otro estudiante.');
            }
            if (empty($paciente->estudiante_asignado_id)) {
                $paciente->estudiante_asignado_id = $user->id;
                $paciente->save();
            }
        }

        $validated = $request->validate([
            'patologicos_personales' => 'nullable|array',
            'patologicos_familiares' => 'nullable|array',
            'no_patologicos' => 'nullable|array',
            'ginecologicos' => 'nullable|array',
            'examen_clinico_fisico' => 'nullable|array',
            'habitos' => 'nullable|array',
            'historia_odontopediatrica' => 'nullable|array',
            'antecedentes_periodontales' => 'nullable|array',
            'examen_periodontal' => 'nullable|array',
            'procedimientos_tratamientos' => 'nullable|array',
            'motivo_consulta_paciente' => 'nullable|string',
            'antecedentes_odontologicos' => 'nullable|array',
            'odontograma' => 'nullable|array',
            'diagnosticos_codificados' => 'nullable|array',
            'plan_tratamiento_secuencia' => 'nullable|array',
            'odontologia_legal_forense' => 'nullable|array',
            'estado_revision' => 'nullable|string|in:borrador,en_revision,aprobado,rechazado',
            'comentarios_docente' => 'nullable|string',
            'docente_supervisor_id' => 'nullable|exists:users,id',
        ]);

        $antecedente = AntecedenteMedico::firstOrNew(['paciente_id' => $paciente->id]);

        if ($user && $rolSlug === 'estudiante' && empty($antecedente->estudiante_registra_id)) {
            $antecedente->estudiante_registra_id = $user->id;
        }

        if (isset($validated['patologicos_personales'])) {
            $antecedente->patologicos_personales = $validated['patologicos_personales'];
        }
        if (isset($validated['patologicos_familiares'])) {
            $antecedente->patologicos_familiares = $validated['patologicos_familiares'];
        }
        if (isset($validated['no_patologicos'])) {
            $antecedente->no_patologicos = $validated['no_patologicos'];
        }
        if (isset($validated['ginecologicos'])) {
            $antecedente->ginecologicos = $validated['ginecologicos'];
        }
        if (isset($validated['examen_clinico_fisico'])) {
            $antecedente->examen_clinico_fisico = $validated['examen_clinico_fisico'];
        }
        if (isset($validated['habitos'])) {
            $antecedente->habitos = $validated['habitos'];
        }
        if (isset($validated['historia_odontopediatrica'])) {
            $antecedente->historia_odontopediatrica = $validated['historia_odontopediatrica'];
        }
        if (isset($validated['antecedentes_periodontales'])) {
            $antecedente->antecedentes_periodontales = $validated['antecedentes_periodontales'];
        }
        if (isset($validated['examen_periodontal'])) {
            $antecedente->examen_periodontal = $validated['examen_periodontal'];
        }
        if (isset($validated['procedimientos_tratamientos'])) {
            $antecedente->procedimientos_tratamientos = $validated['procedimientos_tratamientos'];
        }
        if (array_key_exists('motivo_consulta_paciente', $validated)) {
            $antecedente->motivo_consulta_paciente = $validated['motivo_consulta_paciente'];
        }
        if (isset($validated['antecedentes_odontologicos'])) {
            $antecedente->antecedentes_odontologicos = $validated['antecedentes_odontologicos'];
        }
        if (isset($validated['odontograma'])) {
            $antecedente->odontograma = $validated['odontograma'];
        }
        if (isset($validated['diagnosticos_codificados'])) {
            $antecedente->diagnosticos_codificados = $validated['diagnosticos_codificados'];
        }
        if (isset($validated['plan_tratamiento_secuencia'])) {
            $antecedente->plan_tratamiento_secuencia = $validated['plan_tratamiento_secuencia'];
        }
        if (isset($validated['odontologia_legal_forense'])) {
            $antecedente->odontologia_legal_forense = $validated['odontologia_legal_forense'];
        }
        if (isset($validated['estado_revision'])) {
            $antecedente->estado_revision = $validated['estado_revision'];
            if ($validated['estado_revision'] === 'aprobado') {
                $antecedente->fecha_aprobacion = now();
                $antecedente->docente_supervisor_id = $user->id;
            }
        }
        if (isset($validated['comentarios_docente'])) {
            $antecedente->comentarios_docente = $validated['comentarios_docente'];
        }
        if (isset($validated['docente_supervisor_id'])) {
            $antecedente->docente_supervisor_id = $validated['docente_supervisor_id'];
        }

        $antecedente->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'antecedentes_actualizados',
            'tabla' => 'antecedentes_medicos',
            'registro_id' => $antecedente->id,
            'payload_diff' => $antecedente->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Expediente clínico actualizado correctamente.');
    }

    /**
     * Guarda o actualiza el periodontograma gráfico 2D del paciente.
     */
    public function guardarPeriodontograma(Request $request, int $id): JsonResponse|RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if ($rolSlug === 'estudiante' && $paciente->estudiante_asignado_id !== $user->id) {
            abort(403, 'Acceso restringido: No puedes modificar el periodontograma de un paciente no asignado.');
        }

        $validated = $request->validate([
            'mediciones_periodontales' => 'required|array',
            'indice_placa_porcentaje' => 'nullable|numeric',
            'indice_sangrado_porcentaje' => 'nullable|numeric',
            'diagnostico_periodontal' => 'nullable|string',
            'pronostico_periodontal' => 'nullable|string',
            'estado_aprobacion' => 'nullable|string',
            'comentarios_docente' => 'nullable|string',
        ]);

        $periodontograma = Periodontograma::where('paciente_id', $paciente->id)->latest('id')->first();
        if (!$periodontograma) {
            $periodontograma = new Periodontograma();
            $periodontograma->paciente_id = $paciente->id;
            $periodontograma->estudiante_id = $user->id;
            $periodontograma->version = 1;
        }

        $periodontograma->mediciones_periodontales = $validated['mediciones_periodontales'];
        if (isset($validated['indice_placa_porcentaje'])) {
            $periodontograma->indice_placa_porcentaje = $validated['indice_placa_porcentaje'];
        }
        if (isset($validated['indice_sangrado_porcentaje'])) {
            $periodontograma->indice_sangrado_porcentaje = $validated['indice_sangrado_porcentaje'];
        }
        if (isset($validated['diagnostico_periodontal'])) {
            $periodontograma->diagnostico_periodontal = $validated['diagnostico_periodontal'];
        }
        if (isset($validated['pronostico_periodontal'])) {
            $periodontograma->pronostico_periodontal = $validated['pronostico_periodontal'];
        }
        if (isset($validated['estado_aprobacion'])) {
            $periodontograma->estado_aprobacion = $validated['estado_aprobacion'];
        }
        if (isset($validated['comentarios_docente'])) {
            $periodontograma->comentarios_docente = $validated['comentarios_docente'];
        }

        $periodontograma->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'periodontograma_guardado',
            'tabla' => 'periodontogramas',
            'registro_id' => $periodontograma->id,
            'payload_diff' => $periodontograma->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'periodontograma' => $periodontograma]);
        }

        return back()->with('success', 'Periodontograma guardado correctamente.');
    }

    /**
     * Obtiene el periodontograma más reciente del paciente.
     */
    public function obtenerPeriodontograma(int $id): JsonResponse
    {
        $periodontograma = Periodontograma::where('paciente_id', $id)->latest('id')->first();
        return response()->json($periodontograma);
    }

    /**
     * Actualiza los datos demográficos y de admisión del paciente.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if ($rolSlug === 'estudiante' && $paciente->estudiante_asignado_id !== $user->id) {
            abort(403, 'Acceso restringido: No puedes modificar los datos de un paciente no asignado a ti.');
        }

        $validated = $request->validate([
            'ci' => 'required|string|max:30|unique:pacientes,ci,' . $paciente->id,
            'ci_expedido' => 'nullable|string|max:10',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'sexo' => 'required|string',
            'estado_civil' => 'nullable|string|max:50',
            'nacionalidad' => 'nullable|string|max:60',
            'ocupacion' => 'nullable|string|max:100',
            'nivel_instruccion' => 'nullable|string|max:60',
            'lugar_nacimiento' => 'nullable|string|max:100',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:30',
            'celular' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'fuente_referencia' => 'nullable|string|max:100',
            'seguro_convenio' => 'nullable|string|max:150',
            'numero_poliza' => 'nullable|string|max:60',
            'contacto_emergencia' => 'nullable|string|max:150',
            'telefono_emergencia' => 'nullable|string|max:30',
            'parentesco_emergencia' => 'nullable|string|max:50',
            'estado_paciente' => 'nullable|string|in:activo,inactivo,referido,transferido',
            'estado_clinico' => 'nullable|string|in:en_evaluacion,en_tratamiento,alta_clinica,abandono',
            'saldo_cuenta' => 'nullable|numeric|min:0',
            'estudiante_asignado_id' => 'nullable|exists:users,id',
        ]);

        $paciente->update($validated);

        return back()->with('success', 'Datos demográficos y de admisión del paciente actualizados.');
    }

    /**
     * Guarda o actualiza el consentimiento informado inicial del paciente con firma/fecha/hora.
     */
    public function guardarConsentimiento(Request $request, int $id): JsonResponse|RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();

        $validated = $request->validate([
            'reglamento_general_aceptado' => 'required|boolean',
            'politica_privacidad_aceptada' => 'required|boolean',
            'tipo' => 'nullable|string|in:digital_formulario,digital_canvas,documento_escaneado',
            'firma_canvas' => 'nullable|string',
            'documento' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $tipo = $validated['tipo'] ?? 'digital_formulario';
        $prev = $paciente->consentimiento_inicial ?? [];
        $documentoUrl = $prev['documento_url'] ?? null;

        if ($request->hasFile('documento')) {
            $path = $request->file('documento')->store("consentimientos/{$paciente->id}", 'public');
            $documentoUrl = asset('storage/' . $path);
            $tipo = 'documento_escaneado';
        }

        $consentimiento = [
            'firmado' => true,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => $tipo,
            'reglamento_general_aceptado' => (bool)$validated['reglamento_general_aceptado'],
            'politica_privacidad_aceptada' => (bool)$validated['politica_privacidad_aceptada'],
            'responsable_nombre' => $user?->name ?? 'Personal Clínico',
            'responsable_id' => $user?->id,
            'firma_canvas' => $validated['firma_canvas'] ?? ($prev['firma_canvas'] ?? null),
            'documento_url' => $documentoUrl,
            'observaciones' => $validated['observaciones'] ?? 'Consentimiento informado registrado en el sistema.',
        ];

        $paciente->consentimiento_inicial = $consentimiento;
        $paciente->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'consentimiento_inicial_actualizado',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => $consentimiento,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'consentimiento' => $consentimiento]);
        }

        return back()->with('success', 'Consentimiento informado registrado correctamente.');
    }

    /**
     * Sube y asocia el escaneo digital de la Cédula de Identidad o documento legal.
     */
    public function subirDocumentoCi(Request $request, int $id): JsonResponse|RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();

        $request->validate([
            'documento' => 'required|file|mimes:pdf,jpeg,png,jpg,webp|max:10240',
        ]);

        $file = $request->file('documento');
        $path = $file->store("documentos_ci/{$paciente->id}", 'public');
        $url = asset('storage/' . $path);

        $paciente->ci_documento_url = $url;
        $paciente->save();

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'documento_ci_subido',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => ['url' => $url, 'nombre_original' => $file->getClientOriginalName()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'url' => $url]);
        }

        return back()->with('success', 'Documento de identidad adjuntado correctamente.');
    }

    /**
     * Asigna o reasigna un estudiante a un paciente (transferencia clínica universitaria).
     */
    public function asignarEstudiante(Request $request, int $id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if (!in_array($rolSlug, ['admin', 'docente', 'director_clinica', 'admision'])) {
            abort(403, 'No tienes permisos para reasignar o transferir pacientes.');
        }

        $validated = $request->validate([
            'estudiante_id' => 'nullable|exists:users,id',
            'motivo' => 'nullable|string|max:255',
        ]);

        $estudianteAnteriorId = $paciente->estudiante_asignado_id;
        $nuevoEstudianteId = !empty($validated['estudiante_id']) ? (int) $validated['estudiante_id'] : null;

        $paciente->estudiante_asignado_id = $nuevoEstudianteId;
        $paciente->save();

        $nuevoEstudiante = $nuevoEstudianteId ? User::find($nuevoEstudianteId) : null;

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'paciente_transferido',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => [
                'estudiante_anterior_id' => $estudianteAnteriorId,
                'nuevo_estudiante_id' => $nuevoEstudianteId,
                'nuevo_estudiante_nombre' => $nuevoEstudiante?->name,
                'motivo' => $validated['motivo'] ?? 'Reasignación clínica docente',
                'reasignado_por' => $user->name,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $mensaje = $nuevoEstudiante
            ? "Paciente asignado exitosamente al estudiante {$nuevoEstudiante->name}."
            : 'Se ha retirado la asignación del paciente.';

        return back()->with('success', $mensaje);
    }

    /**
     * Sube un archivo de evidencia clínica (fotografía, radiografía o documento PDF)
     * para asociarlo a un procedimiento o sesión de tratamiento.
     */
    public function subirEvidenciaTratamiento(Request $request, int $id): JsonResponse
    {
        $paciente = Paciente::findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        // Si es estudiante, verificar asignación formal
        if ($rolSlug === 'estudiante') {
            if ($paciente->estudiante_asignado_id && $paciente->estudiante_asignado_id !== $user->id) {
                return response()->json([
                    'error' => 'No tienes permisos para adjuntar evidencias: este paciente está asignado a otro estudiante.'
                ], 403);
            }
        }

        $request->validate([
            'archivo' => 'required|file|mimes:jpeg,png,jpg,webp,gif,pdf|max:15360',
            'tipo' => 'nullable|string|in:foto,radiografia,documento,otro',
            'titulo' => 'nullable|string|max:255',
        ]);

        $file = $request->file('archivo');
        $extension = strtolower($file->getClientOriginalExtension());
        $tipo = $request->input('tipo');
        if (!$tipo) {
            $tipo = ($extension === 'pdf') ? 'documento' : 'foto';
        }

        $originalName = $file->getClientOriginalName();
        $sizeInBytes = $file->getSize();
        $formattedSize = $sizeInBytes >= 1048576
            ? round($sizeInBytes / 1048576, 1) . ' MB'
            : round($sizeInBytes / 1024, 1) . ' KB';

        $dir = "evidencias_tratamientos/{$paciente->id}";
        $path = $file->store($dir, 'public');
        $url = asset('storage/' . $path);

        $evidencia = [
            'id' => 'evi-' . uniqid(),
            'tipo' => $tipo,
            'titulo' => $request->input('titulo') ?: pathinfo($originalName, PATHINFO_FILENAME),
            'url' => $url,
            'path' => $path,
            'nombre_archivo' => $originalName,
            'extension' => $extension,
            'tamano' => $formattedSize,
            'fecha' => now()->format('Y-m-d H:i'),
            'subido_por' => $user?->name ?? 'Usuario',
        ];

        AuditoriaLog::create([
            'user_id' => $user?->id,
            'accion' => 'evidencia_tratamiento_subida',
            'tabla' => 'pacientes',
            'registro_id' => $paciente->id,
            'payload_diff' => $evidencia,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'evidencia' => $evidencia,
        ]);
    }

    /**
     * Eliminación suave (Soft Delete) del paciente.
     */
    public function destroy(int $id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($id);
        $paciente->delete();

        return redirect()->route('pacientes.index')
            ->with('success', 'Paciente archivado en papelera.');
    }
}
