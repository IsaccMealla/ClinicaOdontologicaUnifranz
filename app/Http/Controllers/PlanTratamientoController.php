<?php

namespace App\Http\Controllers;

use App\Models\Arancel;
use App\Models\AuditoriaLog;
use App\Models\Paciente;
use App\Models\PlanTratamiento;
use App\Models\RemisionIntercatedra;
use App\Models\TransferenciaPaciente;
use App\Models\TratamientoFase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlanTratamientoController extends Controller
{
    /**
     * Catálogo de aranceles activos para autocompletado en el PdT.
     */
    public function aranceles(Request $request): JsonResponse
    {
        $query = Arancel::where('activo', true);

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('nombre', 'ilike', "%{$q}%")
                    ->orWhere('codigo', 'ilike', "%{$q}%")
                    ->orWhere('categoria', 'ilike', "%{$q}%");
            });
        }

        return response()->json($query->orderBy('categoria')->orderBy('nombre')->get());
    }

    /**
     * Crea un nuevo Plan de Tratamiento (PdT) estructurado por fases o especialidades.
     */
    public function store(Request $request, int $paciente_id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($paciente_id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        // Validar permisos del estudiante
        if ($rolSlug === 'estudiante' && $paciente->estudiante_asignado_id && $paciente->estudiante_asignado_id !== $user->id) {
            abort(403, 'No tienes asignado a este paciente para formular su plan de tratamiento.');
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'docente_supervisor_id' => 'nullable|exists:users,id',
            'procedimientos' => 'required|array|min:1',
            'procedimientos.*.numero_fase' => 'required|integer',
            'procedimientos.*.fase_categoria' => 'required|string',
            'procedimientos.*.nombre_fase' => 'required|string',
            'procedimientos.*.especialidad' => 'required|string',
            'procedimientos.*.procedimiento' => 'required|string|max:255',
            'procedimientos.*.pieza_fdi' => 'nullable|integer',
            'procedimientos.*.diagnostico_codigo' => 'nullable|string',
            'procedimientos.*.arancel_codigo' => 'nullable|string',
            'procedimientos.*.costo_arancel' => 'required|numeric|min:0',
            'procedimientos.*.prioridad' => 'required|string|in:Urgente,Prioritario,Electivo',
            'procedimientos.*.tiempo_estimado_minutos' => 'nullable|integer|min:10',
        ]);

        return DB::transaction(function () use ($validated, $paciente, $user) {
            $costoTotal = 0;
            foreach ($validated['procedimientos'] as $proc) {
                $costoTotal += (float)$proc['costo_arancel'];
            }

            $plan = PlanTratamiento::create([
                'paciente_id' => $paciente->id,
                'estudiante_id' => $user->id,
                'docente_supervisor_id' => $validated['docente_supervisor_id'] ?? null,
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'] ?? 'Plan de tratamiento estructurado según diagnóstico clínico.',
                'fase_actual' => 'Fase I: Control de Infección',
                'costo_total_estimado' => $costoTotal,
                'porcentaje_avance' => 0,
                'estado' => 'propuesto',
                'requiere_validacion_docente' => true,
            ]);

            foreach ($validated['procedimientos'] as $pData) {
                TratamientoFase::create([
                    'plan_tratamiento_id' => $plan->id,
                    'numero_fase' => $pData['numero_fase'],
                    'fase_categoria' => $pData['fase_categoria'],
                    'nombre_fase' => $pData['nombre_fase'],
                    'especialidad' => $pData['especialidad'],
                    'procedimiento' => $pData['procedimiento'],
                    'pieza_fdi' => $pData['pieza_fdi'] ?? null,
                    'diagnostico_codigo' => $pData['diagnostico_codigo'] ?? null,
                    'arancel_codigo' => $pData['arancel_codigo'] ?? null,
                    'costo_arancel' => $pData['costo_arancel'],
                    'prioridad' => $pData['prioridad'],
                    'tiempo_estimado_minutos' => $pData['tiempo_estimado_minutos'] ?? 45,
                    'estado' => 'pendiente',
                    'materiales_consumidos' => [],
                    'sesiones_clinicas' => [],
                ]);
            }

            AuditoriaLog::create([
                'user_id' => $user->id,
                'accion' => 'plan_tratamiento_creado',
                'tabla' => 'planes_tratamiento',
                'registro_id' => $plan->id,
                'payload_diff' => ['plan_id' => $plan->id, 'procedimientos_count' => count($validated['procedimientos'])],
                'created_at' => now(),
            ]);

            return back()->with('success', "Plan de Tratamiento '{$plan->titulo}' formulado exitosamente por Bs. " . number_format($costoTotal, 2) . ". Pendiente de validación docente.");
        });
    }

    /**
     * Validación electrónica obligatoria por Docente Supervisor (Doble check).
     */
    public function validarDocente(Request $request, int $id): RedirectResponse
    {
        $plan = PlanTratamiento::with('fases')->findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if (!in_array($rolSlug, ['docente', 'admin', 'director_clinica'])) {
            abort(403, 'Solo un Docente Supervisor o Director puede validar y autorizar el inicio del Plan de Tratamiento.');
        }

        $validated = $request->validate([
            'aprobado' => 'required|boolean',
            'observaciones' => 'nullable|string|max:1000',
        ]);

        if ($validated['aprobado']) {
            $plan->estado = 'aprobado_docente';
            $plan->fecha_aprobacion_docente = now();
            $plan->observaciones_docente = $validated['observaciones'] ?? 'Plan de tratamiento verificado y aprobado académicamente para ejecución clínica.';
            $plan->docente_supervisor_id = $user->id;
            $plan->save();

            // Poner los procedimientos de Fase I listos para ejecución
            $plan->fases()->where('numero_fase', 1)->where('estado', 'pendiente')->update(['estado' => 'en_ejecucion']);

            $msg = "Plan de tratamiento aprobado electrónicamente por el Docente Supervisor {$user->name}. Procedimientos habilitados.";
        } else {
            $plan->estado = 'observado';
            $plan->observaciones_docente = $validated['observaciones'] ?? 'Plan observado por el docente supervisor. Corregir y reformular.';
            $plan->save();

            $msg = "Plan de tratamiento observado. El estudiante debe corregir los procedimientos antes de intervenir.";
        }

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'plan_tratamiento_validacion_docente',
            'tabla' => 'planes_tratamiento',
            'registro_id' => $plan->id,
            'payload_diff' => ['aprobado' => $validated['aprobado'], 'docente' => $user->name],
            'created_at' => now(),
        ]);

        return back()->with('success', $msg);
    }

    /**
     * Registro formal de aceptación del presupuesto y plan por el paciente (Firma o confirmación).
     */
    public function aceptarPaciente(Request $request, int $id): RedirectResponse
    {
        $plan = PlanTratamiento::findOrFail($id);
        $user = Auth::user();

        $validated = $request->validate([
            'firma_digital' => 'nullable|string',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $plan->aceptacion_paciente = [
            'firmado' => true,
            'aceptado' => true,
            'fecha_hora' => now()->toDateTimeString(),
            'costo_aceptado' => $plan->costo_total_estimado,
            'responsable_registro' => $user->name,
            'firma_digital' => $validated['firma_digital'] ?? null,
            'observaciones' => $validated['observaciones'] ?? 'El paciente manifiesta estar informado y acepta el plan de tratamiento y presupuesto.',
        ];
        $plan->save();

        return back()->with('success', 'Aceptación formal del paciente y presupuesto registrada correctamente.');
    }

    /**
     * Actualiza el estado de un procedimiento específico (ejecución, materiales, tiempo, notas).
     */
    public function actualizarProcedimiento(Request $request, int $plan_id, int $fase_id): RedirectResponse
    {
        $plan = PlanTratamiento::with('fases')->findOrFail($plan_id);
        $fase = TratamientoFase::where('plan_tratamiento_id', $plan_id)->findOrFail($fase_id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        // Regla: no permitir iniciar procedimientos si el plan no fue aprobado por el docente
        if ($plan->estado === 'propuesto' && $request->estado === 'completado') {
            return back()->with('error', 'Seguridad Clínica: No se puede completar un procedimiento de un Plan de Tratamiento que aún no cuenta con la Validación Docente previa.');
        }

        $validated = $request->validate([
            'estado' => 'required|string|in:pendiente,en_ejecucion,completado,cancelado',
            'tiempo_empleado_minutos' => 'nullable|integer|min:5|max:480',
            'materiales_consumidos' => 'nullable|array',
            'nota_sesion' => 'nullable|string',
            'calificacion' => 'nullable|integer|min:0|max:100',
            'observaciones_docente' => 'nullable|string',
        ]);

        $fase->estado = $validated['estado'];
        if (isset($validated['tiempo_empleado_minutos'])) {
            $fase->tiempo_empleado_minutos = $validated['tiempo_empleado_minutos'];
        }
        if (isset($validated['materiales_consumidos'])) {
            $fase->materiales_consumidos = $validated['materiales_consumidos'];
        }

        // Si se agregó nota de sesión
        if (!empty($validated['nota_sesion'])) {
            $sesiones = $fase->sesiones_clinicas ?? [];
            $sesiones[] = [
                'id' => 'ses-' . uniqid(),
                'fecha' => now()->toDateString(),
                'hora' => now()->format('H:i'),
                'operador' => $user->name,
                'nota' => $validated['nota_sesion'],
                'tiempo_min' => $validated['tiempo_empleado_minutos'] ?? $fase->tiempo_estimado_minutos,
            ];
            $fase->sesiones_clinicas = $sesiones;
        }

        // Si es docente calificando o validando el procedimiento
        if (in_array($rolSlug, ['docente', 'admin', 'director_clinica'])) {
            if (isset($validated['calificacion'])) {
                $fase->calificacion = $validated['calificacion'];
            }
            if (isset($validated['observaciones_docente'])) {
                $fase->observaciones_docente = $validated['observaciones_docente'];
            }
            $fase->docente_aprobador_id = $user->id;
            $fase->fecha_aprobacion = now();
        }

        $fase->save();

        // Recalcular porcentaje de avance del Plan de Tratamiento
        $fases = $plan->fases()->get();
        $total = $fases->count();
        $completadas = $fases->where('estado', 'completado')->count();
        $porcentaje = $total > 0 ? (int)round(($completadas / $total) * 100) : 0;

        $plan->porcentaje_avance = $porcentaje;
        if ($porcentaje === 100) {
            $plan->estado = 'completado';
        } elseif ($porcentaje > 0 && $plan->estado === 'aprobado_docente') {
            $plan->estado = 'en_progreso';
        }
        $plan->save();

        return back()->with('success', "Procedimiento '{$fase->procedimiento}' actualizado ({$fase->estado}). Avance general del PdT: {$porcentaje}%.");
    }

    /**
     * Cierre del tratamiento y emisión de Alta Clínica Definitiva.
     */
    public function altaClinica(Request $request, int $id): RedirectResponse
    {
        $plan = PlanTratamiento::with(['paciente', 'fases'])->findOrFail($id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if (!in_array($rolSlug, ['docente', 'admin', 'director_clinica'])) {
            abort(403, 'La emisión del Alta Clínica Definitiva requiere supervisión y firma de un Docente.');
        }

        $validated = $request->validate([
            'recomendaciones_finales' => 'required|string',
            'proximo_control_meses' => 'required|integer|in:3,6,12',
            'observaciones' => 'nullable|string',
        ]);

        $proximoControl = now()->addMonths((int)$validated['proximo_control_meses'])->toDateString();

        $plan->alta_clinica = [
            'fecha_alta' => now()->toDateTimeString(),
            'docente_nombre' => $user->name,
            'docente_id' => $user->id,
            'recomendaciones_finales' => $validated['recomendaciones_finales'],
            'proximo_control_fecha' => $proximoControl,
            'proximo_control_meses' => $validated['proximo_control_meses'],
            'observaciones' => $validated['observaciones'] ?? 'Tratamiento completado con éxito según plan de tratamiento.',
        ];
        $plan->estado = 'completado';
        $plan->porcentaje_avance = 100;
        $plan->save();

        // Actualizar estado clínico del paciente a 'alta_clinica'
        $paciente = $plan->paciente;
        $paciente->estado_clinico = 'alta_clinica';
        $paciente->save();

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'alta_clinica_definitiva',
            'tabla' => 'planes_tratamiento',
            'registro_id' => $plan->id,
            'payload_diff' => ['paciente_id' => $paciente->id, 'proximo_control' => $proximoControl],
            'created_at' => now(),
        ]);

        return back()->with('success', "Alta Clínica Definitiva emitida exitosamente para {$paciente->nombre_completo}. Próximo control programado en {$validated['proximo_control_meses']} meses ({$proximoControl}).");
    }

    /**
     * Remisión Inter-Cátedra / Especialidad.
     */
    public function crearRemision(Request $request, int $paciente_id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($paciente_id);
        $user = Auth::user();

        $validated = $request->validate([
            'catedra_origen' => 'required|string|max:100',
            'catedra_receptora' => 'required|string|max:100',
            'pieza_dental' => 'nullable|string|max:20',
            'procedimiento_solicitado' => 'required|string|max:255',
            'motivo_remision' => 'required|string',
            'docente_autoriza_id' => 'nullable|exists:users,id',
        ]);

        $remision = RemisionIntercatedra::create([
            'paciente_id' => $paciente->id,
            'estudiante_emisor_id' => $user->id,
            'docente_autoriza_id' => $validated['docente_autoriza_id'] ?? null,
            'catedra_origen' => $validated['catedra_origen'],
            'catedra_receptora' => $validated['catedra_receptora'],
            'pieza_dental' => $validated['pieza_dental'] ?? null,
            'procedimiento_solicitado' => $validated['procedimiento_solicitado'],
            'motivo_remision' => $validated['motivo_remision'],
            'estado' => 'activa',
        ]);

        AuditoriaLog::create([
            'user_id' => $user->id,
            'accion' => 'remision_intercatedra_creada',
            'tabla' => 'remisiones_intercatedra',
            'registro_id' => $remision->id,
            'payload_diff' => ['paciente_id' => $paciente->id, 'receptora' => $validated['catedra_receptora']],
            'created_at' => now(),
        ]);

        return back()->with('success', "Remisión inter-cátedra enviada a '{$validated['catedra_receptora']}' para la pieza {$validated['pieza_dental']}. Trazabilidad activa.");
    }

    /**
     * Resuelve o completa una remisión inter-cátedra.
     */
    public function resolverRemision(Request $request, int $id): RedirectResponse
    {
        $remision = RemisionIntercatedra::findOrFail($id);
        $user = Auth::user();

        $validated = $request->validate([
            'observaciones_resolucion' => 'required|string',
        ]);

        $remision->estado = 'completada';
        $remision->fecha_atencion = now();
        $remision->estudiante_receptor_id = $user->id;
        $remision->observaciones_resolucion = $validated['observaciones_resolucion'];
        $remision->save();

        return back()->with('success', 'Remisión inter-cátedra concluida y archivada en el historial del paciente.');
    }

    /**
     * Transferencia de Paciente de Estudiante a Estudiante con motivos estandarizados obligatorios.
     */
    public function transferirPaciente(Request $request, int $paciente_id): RedirectResponse
    {
        $paciente = Paciente::findOrFail($paciente_id);
        $user = Auth::user();
        $rolSlug = $user?->rol?->slug;

        if (!in_array($rolSlug, ['docente', 'admin', 'director_clinica'])) {
            abort(403, 'La transferencia o reasignación formal de un paciente requiere aprobación del Docente Supervisor o Coordinador.');
        }

        $validated = $request->validate([
            'estudiante_nuevo_id' => 'required|exists:users,id',
            'motivo_estandarizado' => 'required|string|in:Fin de semestre/rotación del estudiante anterior,Necesidad de mayor experiencia,Bajo desempeño del estudiante,Acuerdo entre partes,Otro motivo justificado',
            'justificacion_detallada' => 'required|string|min:10',
        ]);

        $estudianteAnteriorId = $paciente->estudiante_asignado_id;
        $estudianteNuevo = User::findOrFail($validated['estudiante_nuevo_id']);

        DB::transaction(function () use ($paciente, $estudianteAnteriorId, $estudianteNuevo, $user, $validated) {
            $paciente->estudiante_asignado_id = $estudianteNuevo->id;
            $paciente->estado_paciente = 'transferido';
            $paciente->save();

            TransferenciaPaciente::create([
                'paciente_id' => $paciente->id,
                'estudiante_anterior_id' => $estudianteAnteriorId,
                'estudiante_nuevo_id' => $estudianteNuevo->id,
                'docente_autoriza_id' => $user->id,
                'motivo_estandarizado' => $validated['motivo_estandarizado'],
                'justificacion_detallada' => $validated['justificacion_detallada'],
                'estado' => 'aprobada',
            ]);

            AuditoriaLog::create([
                'user_id' => $user->id,
                'accion' => 'paciente_transferido',
                'tabla' => 'pacientes',
                'registro_id' => $paciente->id,
                'payload_diff' => [
                    'anterior_id' => $estudianteAnteriorId,
                    'nuevo_id' => $estudianteNuevo->id,
                    'motivo' => $validated['motivo_estandarizado'],
                ],
                'created_at' => now(),
            ]);
        });

        return back()->with('success', "Paciente transferido exitosamente a {$estudianteNuevo->name}. Motivo: {$validated['motivo_estandarizado']}.");
    }

    /**
     * Reportes de producción clínica (procedimientos más realizados, tiempos y avances).
     */
    public function reportesProduccion(Request $request): JsonResponse
    {
        $resumenGeneral = [
            'total_planes' => PlanTratamiento::count(),
            'planes_aprobados' => PlanTratamiento::whereIn('estado', ['aprobado', 'aprobado_docente'])->count(),
            'planes_completados' => PlanTratamiento::where('estado', 'completado')->count(),
            'procedimientos_totales' => TratamientoFase::count(),
            'procedimientos_completados' => TratamientoFase::where('estado', 'completado')->count(),
        ];

        $topProcedimientos = TratamientoFase::select('procedimiento', 'especialidad', DB::raw('COUNT(*) as total'))
            ->groupBy('procedimiento', 'especialidad')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $distribucionEspecialidades = TratamientoFase::select('especialidad', DB::raw('COUNT(*) as total'))
            ->groupBy('especialidad')
            ->orderByDesc('total')
            ->get();

        $tiempoPromedioPorEspecialidad = TratamientoFase::whereNotNull('tiempo_empleado_minutos')
            ->select('especialidad', DB::raw('ROUND(AVG(tiempo_empleado_minutos)) as tiempo_promedio_min'), DB::raw('COUNT(*) as total_sesiones'))
            ->groupBy('especialidad')
            ->get();

        $productividadEstudiantes = User::whereHas('rol', fn($q) => $q->where('slug', 'estudiante'))
            ->withCount(['planesTratamiento' => fn($q) => $q->where('estado', 'completado')])
            ->orderByDesc('planes_tratamiento_count')
            ->limit(15)
            ->get(['id', 'name', 'codigo_institucional']);

        return response()->json([
            'resumen_general' => $resumenGeneral,
            'top_procedimientos' => $topProcedimientos,
            'distribucion_especialidades' => $distribucionEspecialidades,
            'tiempos_especialidad' => $tiempoPromedioPorEspecialidad,
            'productividad_estudiantes' => $productividadEstudiantes,
        ]);
    }
}
