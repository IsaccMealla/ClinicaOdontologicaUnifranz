<?php

namespace App\Http\Controllers;

use App\Models\AlertaBajoDesempeno;
use App\Models\AsignaturaCupoRequisito;
use App\Models\AuditoriaLog;
use App\Models\HistoriaClinica;
use App\Models\Paciente;
use App\Models\PlanTratamiento;
use App\Models\SeguimientoAcademico;
use App\Models\Sillon;
use App\Models\SupervisionProgramacion;
use App\Models\SupervisionSolicitud;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupervisionController extends Controller
{
    /**
     * Módulo 6: Módulo de Formación y Supervisión Clínica
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userRole = $user->rol ? $user->rol->slug : 'estudiante';

        // 1. Catálogo de Cupos y Requisitos por Asignatura
        $requisitosCupos = AsignaturaCupoRequisito::where('activo', true)
            ->orderBy('asignatura')
            ->get();

        // 2. Solicitudes de Supervisión (Flujo de Aprobación Obligatoria)
        $solicitudesQuery = SupervisionSolicitud::with([
            'estudiante:id,name,email,codigo_institucional',
            'docente:id,name,email',
            'paciente:id,nombres,apellido_paterno,apellido_materno,ci,iup',
            'sillon:id,codigo,nombre',
        ]);

        if ($userRole === 'estudiante') {
            $solicitudesQuery->where('estudiante_id', $user->id);
        } elseif ($userRole === 'docente') {
            $solicitudesQuery->where('docente_id', $user->id);
        }

        $solicitudes = $solicitudesQuery->latest('solicitado_at')->limit(50)->get();

        // 3. Alertas Tempranas de Bajo Desempeño
        $alertasQuery = AlertaBajoDesempeno::with([
            'estudiante:id,name,email,codigo_institucional',
            'docente:id,name',
        ]);

        if ($userRole === 'estudiante') {
            $alertasQuery->where('estudiante_id', $user->id);
        }

        $alertasDesempeno = $alertasQuery->latest()->get();

        // 4. Programación de Supervisión Docente
        $programacionesDocentes = SupervisionProgramacion::with('docente:id,name,email')
            ->where('activo', true)
            ->orderBy('dia_semana')
            ->get();

        // 5. Informe Automatizado de Avance de Cupos y Alumnos Retrasados
        $estudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })
        ->where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'name', 'email', 'codigo_institucional']);

        $avanceCuposEstudiantes = $estudiantes->map(function ($est) use ($requisitosCupos) {
            $cuposTotalesRequeridos = $requisitosCupos->sum('cupos_minimos') ?: 1;

            // Procedimientos completados y aprobados por docente con hito de alta técnica
            $procedimientosAprobados = SupervisionSolicitud::where('estudiante_id', $est->id)
                ->where('tipo_hito', 'cierre_alta_tecnica')
                ->where('estado', 'aprobado')
                ->count();

            $porcentajeAvance = min(100, round(($procedimientosAprobados / $cuposTotalesRequeridos) * 100));
            $estaRetrasado = $porcentajeAvance < 40;

            // Alertas de desempeño acumuladas
            $alertasActivas = AlertaBajoDesempeno::where('estudiante_id', $est->id)
                ->where('estado', 'activa')
                ->count();

            return [
                'estudiante_id' => $est->id,
                'nombre' => $est->name,
                'codigo' => $est->codigo_institucional ?? 'EST-' . $est->id,
                'email' => $est->email,
                'procedimientos_aprobados' => $procedimientosAprobados,
                'cupos_requeridos' => $cuposTotalesRequeridos,
                'porcentaje_avance' => $porcentajeAvance,
                'esta_retrasado' => $estaRetrasado,
                'alertas_activas' => $alertasActivas,
            ];
        });

        // 6. Listas auxiliares para la creación de solicitudes
        $docentes = User::whereHas('rol', function ($q) {
            $q->whereIn('slug', ['docente', 'director_clinica']);
        })->where('is_active', true)->orderBy('name')->get(['id', 'name', 'email']);

        $pacientes = Paciente::where('activo', true)
            ->orderBy('apellido_paterno')
            ->limit(100)
            ->get(['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'iup', 'estudiante_asignado_id']);

        $sillones = Sillon::where('activo', true)->orderBy('codigo')->get(['id', 'codigo', 'nombre', 'sala_clinica']);

        // 7. Estadísticas y Métricas Generales
        $metricas = [
            'solicitudes_pendientes' => $solicitudes->where('estado', 'pendiente')->count(),
            'solicitudes_aprobadas' => $solicitudes->where('estado', 'aprobado')->count(),
            'alumnos_retrasados' => $avanceCuposEstudiantes->where('esta_retrasado', true)->count(),
            'alertas_activas_total' => $alertasDesempeno->where('estado', 'activa')->count(),
        ];

        return Inertia::render('Supervision/Index', [
            'solicitudes' => $solicitudes,
            'requisitosCupos' => $requisitosCupos,
            'alertasDesempeno' => $alertasDesempeno,
            'programacionesDocentes' => $programacionesDocentes,
            'avanceCuposEstudiantes' => $avanceCuposEstudiantes,
            'docentes' => $docentes,
            'estudiantes' => $estudiantes,
            'pacientes' => $pacientes,
            'sillones' => $sillones,
            'metricas' => $metricas,
            'userRole' => $userRole,
        ]);
    }

    /**
     * El estudiante genera una Solicitud Digital de Aprobación para hitos clave
     */
    public function storeSolicitud(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'docente_id' => 'required|exists:users,id',
            'sillon_id' => 'nullable|exists:sillones,id',
            'asignatura' => 'required|string|max:150',
            'tipo_hito' => 'required|string|in:diagnostico_pdt,inicio_procedimiento_critico,cierre_alta_tecnica',
            'procedimiento' => 'required|string|max:255',
            'pieza_dental' => 'nullable|string|max:30',
            'comentarios_estudiante' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $paciente = Paciente::findOrFail($validated['paciente_id']);
        $historia = HistoriaClinica::where('paciente_id', $paciente->id)->latest()->first();
        $plan = PlanTratamiento::where('paciente_id', $paciente->id)->latest()->first();

        $solicitud = SupervisionSolicitud::create([
            'estudiante_id' => $user->id,
            'docente_id' => $validated['docente_id'],
            'paciente_id' => $paciente->id,
            'historia_clinica_id' => $historia ? $historia->id : null,
            'plan_tratamiento_id' => $plan ? $plan->id : null,
            'sillon_id' => $validated['sillon_id'] ?? null,
            'asignatura' => $validated['asignatura'],
            'tipo_hito' => $validated['tipo_hito'],
            'procedimiento' => $validated['procedimiento'],
            'pieza_dental' => $validated['pieza_dental'] ?? null,
            'estado' => 'pendiente',
            'comentarios_estudiante' => $validated['comentarios_estudiante'] ?? null,
            'solicitado_at' => now(),
        ]);

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'solicitud_supervision_creada',
            'tabla' => 'supervision_solicitudes',
            'registro_id' => $solicitud->id,
            'payload_diff' => ['hito' => $solicitud->tipo_hito, 'procedimiento' => $solicitud->procedimiento],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Solicitud de supervisión para '{$solicitud->procedimiento}' enviada al docente.");
    }

    /**
     * El Docente Supervisor aprueba o rechaza con firma electrónica de responsabilidad clínica y rúbrica.
     */
    public function responderSolicitud(Request $request, $id)
    {
        $validated = $request->validate([
            'estado' => 'required|string|in:aprobado,rechazado',
            'comentarios_docente' => 'required|string|max:1000',
            'rubrica_bioseguridad' => 'nullable|integer|min:1|max:5',
            'rubrica_destreza' => 'nullable|integer|min:1|max:5',
            'rubrica_criterio' => 'nullable|integer|min:1|max:5',
            'rubrica_trato_paciente' => 'nullable|integer|min:1|max:5',
            'nota_final' => 'nullable|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $solicitud = SupervisionSolicitud::with(['estudiante', 'paciente'])->findOrFail($id);

        $rubrica = [
            'bioseguridad' => $validated['rubrica_bioseguridad'] ?? 5,
            'destreza' => $validated['rubrica_destreza'] ?? 5,
            'criterio' => $validated['rubrica_criterio'] ?? 5,
            'trato_paciente' => $validated['rubrica_trato_paciente'] ?? 5,
            'nota_final' => $validated['nota_final'] ?? 100,
        ];

        // Firma electrónica de responsabilidad clínica
        $hashFirma = hash('sha256', "{$user->id}-{$user->name}-{$solicitud->id}-" . now()->timestamp);
        $firmaDigital = [
            'docente_nombre' => $user->name,
            'docente_email' => $user->email,
            'fecha_hora' => now()->toIso8601String(),
            'hash_seguridad' => $hashFirma,
            'estatus' => $validated['estado'] === 'aprobado' ? 'FIRMA_DIGITAL_VALIDA' : 'RECHAZADO_CON_OBSERVACIONES',
        ];

        $solicitud->update([
            'estado' => $validated['estado'],
            'comentarios_docente' => $validated['comentarios_docente'],
            'firma_digital' => $firmaDigital,
            'evaluacion_rubrica' => $rubrica,
            'respondido_at' => now(),
        ]);

        // Si se aprobó el cierre técnico, actualizar o registrar cupos completados
        if ($validated['estado'] === 'aprobado' && $solicitud->tipo_hito === 'cierre_alta_tecnica') {
            $seguimiento = SeguimientoAcademico::firstOrCreate(
                [
                    'estudiante_id' => $solicitud->estudiante_id,
                    'asignatura' => $solicitud->asignatura,
                    'periodo_academico' => '2026-II',
                    'procedimiento_clave' => $solicitud->procedimiento,
                ],
                [
                    'docente_tutor_id' => $user->id,
                    'cupos_requeridos' => 2,
                    'cupos_completados' => 0,
                    'estado' => 'en_curso',
                ]
            );

            $seguimiento->increment('cupos_completados');
            if ($seguimiento->cupos_completados >= $seguimiento->cupos_requeridos) {
                $seguimiento->update(['estado' => 'completado']);
            }
        }

        $mensaje = $validated['estado'] === 'aprobado'
            ? "Solicitud aprobada y firmada electrónicamente con código {$hashFirma}."
            : 'Solicitud rechazada con observaciones para corrección del estudiante.';

        return back()->with('success', $mensaje);
    }

    /**
     * Lanzar Alerta Temprana de Bajo Desempeño
     */
    public function lanzarAlertaDesempeno(Request $request)
    {
        $validated = $request->validate([
            'estudiante_id' => 'required|exists:users,id',
            'asignatura' => 'required|string|max:150',
            'motivo_categoria' => 'required|string|in:bioseguridad,destreza_manual,rendimiento_teorico,manejo_paciente,otro',
            'motivo_detallado' => 'required|string|max:1000',
            'medidas_sugeridas' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $estudiante = User::findOrFail($validated['estudiante_id']);

        $alerta = AlertaBajoDesempeno::create([
            'estudiante_id' => $estudiante->id,
            'docente_id' => $user->id,
            'asignatura' => $validated['asignatura'],
            'motivo_categoria' => $validated['motivo_categoria'],
            'motivo_detallado' => $validated['motivo_detallado'],
            'medidas_sugeridas' => $validated['medidas_sugeridas'] ?? 'Tutoría de refuerzo y práctica en laboratorio/simulador.',
            'estado' => 'activa',
        ]);

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'alerta_bajo_desempeno_emitida',
            'tabla' => 'alertas_bajo_desempeno',
            'registro_id' => $alerta->id,
            'payload_diff' => ['estudiante' => $estudiante->name, 'motivo' => $alerta->motivo_categoria],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', "Alerta Temprana registrada para el estudiante {$estudiante->name}. Se notificó a Coordinación Clínica.");
    }

    /**
     * Resolver Alerta de Bajo Desempeño por Coordinación
     */
    public function resolverAlertaDesempeno(Request $request, $id)
    {
        $validated = $request->validate([
            'resolucion_coordinacion' => 'required|string|max:1000',
        ]);

        $alerta = AlertaBajoDesempeno::findOrFail($id);
        $alerta->update([
            'estado' => 'resuelta',
            'resolucion_coordinacion' => $validated['resolucion_coordinacion'],
        ]);

        return back()->with('success', 'Alerta resuelta con plan de acción coordinado.');
    }

    /**
     * Configuración Central de Cupos Obligatorios por Asignatura
     */
    public function guardarRequisitoCupo(Request $request)
    {
        $validated = $request->validate([
            'asignatura' => 'required|string|max:150',
            'semestre' => 'nullable|string|max:30',
            'procedimiento_clave' => 'required|string|max:200',
            'cupos_minimos' => 'required|integer|min:1|max:50',
            'descripcion' => 'nullable|string|max:500',
        ]);

        AsignaturaCupoRequisito::updateOrCreate(
            [
                'asignatura' => $validated['asignatura'],
                'procedimiento_clave' => $validated['procedimiento_clave'],
            ],
            [
                'semestre' => $validated['semestre'] ?? 'Semestre Clínico',
                'cupos_minimos' => $validated['cupos_minimos'],
                'descripcion' => $validated['descripcion'] ?? null,
                'activo' => true,
            ]
        );

        return back()->with('success', 'Requisito de cupo por asignatura actualizado correctamente.');
    }

    /**
     * Programación de Supervisión Docente
     */
    public function guardarProgramacionDocente(Request $request)
    {
        $validated = $request->validate([
            'docente_id' => 'required|exists:users,id',
            'asignatura' => 'required|string|max:150',
            'dia_semana' => 'required|string|max:30',
            'turno' => 'required|string|max:50',
            'sala_clinica' => 'nullable|string|max:100',
            'gabinetes_asignados' => 'nullable|string|max:100',
        ]);

        SupervisionProgramacion::create([
            'docente_id' => $validated['docente_id'],
            'asignatura' => $validated['asignatura'],
            'dia_semana' => $validated['dia_semana'],
            'turno' => $validated['turno'],
            'sala_clinica' => $validated['sala_clinica'] ?? 'Clínica Odontológica Integral',
            'gabinetes_asignados' => $validated['gabinetes_asignados'] ?? 'Todos los gabinetes',
            'activo' => true,
        ]);

        return back()->with('success', 'Programación horaria de supervisión guardada.');
    }
}
