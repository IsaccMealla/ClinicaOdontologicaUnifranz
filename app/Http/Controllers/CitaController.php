<?php

namespace App\Http\Controllers;

use App\Models\ActaAbandono;
use App\Models\Cita;
use App\Models\ConfiguracionClinica;
use App\Models\HistoriaClinica;
use App\Models\Paciente;
use App\Models\PlanTratamiento;
use App\Models\Sillon;
use App\Models\TratamientoFase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CitaController extends Controller
{
    /**
     * Display the multi-resource agenda, waiting room, abandonment tracking, and coordination reports.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userRole = $user->rol ? $user->rol->slug : 'estudiante';

        // 1. Configuraciones clínicas operativas
        $tiempoMaxEspera = (int) ConfiguracionClinica::getValor('tiempo_max_espera_minutos', 15);
        $maxInasistencias = (int) ConfiguracionClinica::getValor('max_inasistencias_abandono', 3);

        // 2. Filtros de agenda
        $fechaInicio = $request->query('fecha_inicio', Carbon::today()->startOfWeek()->toDateString());
        $fechaFin = $request->query('fecha_fin', Carbon::today()->endOfWeek()->toDateString());
        $sillonId = $request->query('sillon_id');
        $estudianteId = $request->query('estudiante_id');
        $docenteId = $request->query('docente_id');
        $estado = $request->query('estado');

        // Query principal de citas para la vista de agenda
        $citasQuery = Cita::with([
            'paciente:id,nombres,apellido_paterno,apellido_materno,ci,celular,email,iup,inasistencias_acumuladas,alerta_abandono',
            'estudiante:id,name,email',
            'docente:id,name,email',
            'sillon:id,nombre,codigo,sala_clinica,estado',
            'planTratamiento:id,descripcion,codigo_plan',
            'tratamientoFase:id,procedimiento',
        ])
        ->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
        ->whereDate('fecha_hora_inicio', '<=', $fechaFin);

        // Si es estudiante, puede ver la agenda general o sus citas prioritarias
        if ($sillonId) {
            $citasQuery->where('sillon_id', $sillonId);
        }
        if ($estudianteId) {
            $citasQuery->where('estudiante_id', $estudianteId);
        }
        if ($docenteId) {
            $citasQuery->where('docente_id', $docenteId);
        }
        if ($estado) {
            $citasQuery->where('estado', $estado);
        }

        $citas = $citasQuery->orderBy('fecha_hora_inicio')->get();

        // 3. Sala de Espera Activa de Hoy
        $hoy = Carbon::today()->toDateString();
        $citasHoy = Cita::with([
            'paciente:id,nombres,apellido_paterno,apellido_materno,ci,celular,iup,inasistencias_acumuladas',
            'estudiante:id,name,email',
            'docente:id,name,email',
            'sillon:id,nombre,codigo,sala_clinica',
            'planTratamiento:id,descripcion',
        ])
        ->whereDate('fecha_hora_inicio', $hoy)
        ->orderBy('fecha_hora_inicio')
        ->get()
        ->map(function ($cita) use ($tiempoMaxEspera) {
            $minutosEspera = 0;
            $alertaRoja = false;

            if ($cita->estado === 'en_espera' && $cita->check_in_at) {
                $minutosEspera = Carbon::parse($cita->check_in_at)->diffInMinutes(now());
                $alertaRoja = $minutosEspera >= $tiempoMaxEspera;
            } elseif ($cita->minutos_espera_reales) {
                $minutosEspera = $cita->minutos_espera_reales;
            }

            $citaArray = $cita->toArray();
            $citaArray['minutos_espera_actual'] = $minutosEspera;
            $citaArray['alerta_roja'] = $alertaRoja;
            return $citaArray;
        });

        // 4. Pacientes en Riesgo de Abandono (con 2 o más inasistencias)
        $pacientesAbandono = Paciente::with(['estudianteAsignado:id,name', 'citas' => function ($q) {
            $q->where('estado', 'no_asistio')->orderByDesc('fecha_hora_inicio')->limit(5);
        }])
        ->where('inasistencias_acumuladas', '>=', 2)
        ->orWhere('alerta_abandono', true)
        ->orderByDesc('inasistencias_acumuladas')
        ->limit(20)
        ->get();

        // 5. Actas de Abandono emitidas
        $actasAbandono = ActaAbandono::with([
            'paciente:id,nombres,apellido_paterno,apellido_materno,ci,iup',
            'docente:id,name',
            'estudiante:id,name',
        ])
        ->latest('fecha_declaracion')
        ->limit(20)
        ->get();

        // 6. Reportes y Métricas Operativas
        $metricas = [
            'total_citas_hoy' => $citasHoy->count(),
            'en_espera_hoy' => $citasHoy->where('estado', 'en_espera')->count(),
            'en_atencion_hoy' => $citasHoy->where('estado', 'en_atencion')->count(),
            'alertas_rojas_espera' => $citasHoy->where('alerta_roja', true)->count(),
            'pacientes_alerta_abandono' => $pacientesAbandono->count(),
        ];

        // Carga de Gabinetes (ocupación por sillón en la semana/mes)
        $sillones = Sillon::where('activo', true)->orderBy('codigo')->get();
        $cargaGabinetes = $sillones->map(function ($sillon) use ($fechaInicio, $fechaFin) {
            $totalCitas = Cita::where('sillon_id', $sillon->id)
                ->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
                ->whereDate('fecha_hora_inicio', '<=', $fechaFin)
                ->whereNotIn('estado', ['cancelada'])
                ->count();

            $minutosOcupados = Cita::where('sillon_id', $sillon->id)
                ->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
                ->whereDate('fecha_hora_inicio', '<=', $fechaFin)
                ->whereNotIn('estado', ['cancelada'])
                ->sum('duracion_estimada_minutos');

            return [
                'sillon_id' => $sillon->id,
                'codigo' => $sillon->codigo,
                'nombre' => $sillon->nombre,
                'sala' => $sillon->sala_clinica,
                'estado_actual' => $sillon->estado,
                'total_citas' => $totalCitas,
                'horas_ocupadas' => round($minutosOcupados / 60, 1),
            ];
        });

        // Productividad por Estudiante
        $productividadEstudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })
        ->withCount([
            'citas as citas_programadas' => function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
                  ->whereDate('fecha_hora_inicio', '<=', $fechaFin);
            },
            'citas as citas_asistidas' => function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
                  ->whereDate('fecha_hora_inicio', '<=', $fechaFin)
                  ->whereIn('estado', ['asistio', 'completada']);
            },
            'citas as citas_inasistencias' => function ($q) use ($fechaInicio, $fechaFin) {
                $q->whereDate('fecha_hora_inicio', '>=', $fechaInicio)
                  ->whereDate('fecha_hora_inicio', '<=', $fechaFin)
                  ->where('estado', 'no_asistio');
            },
        ])
        ->orderByDesc('citas_asistidas')
        ->limit(15)
        ->get(['id', 'name', 'email']);

        // Listas auxiliares para el formulario de agendamiento
        $estudiantes = User::whereHas('rol', function ($q) {
            $q->where('slug', 'estudiante');
        })->where('activo', true)->orderBy('name')->get(['id', 'name', 'email']);

        $docentes = User::whereHas('rol', function ($q) {
            $q->whereIn('slug', ['docente', 'director_clinica']);
        })->where('activo', true)->orderBy('name')->get(['id', 'name', 'email']);

        $pacientesList = Paciente::where('activo', true)
            ->whereNotIn('estado_paciente', ['alta_abandono'])
            ->orderBy('apellido_paterno')
            ->limit(100)
            ->get(['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'iup', 'celular', 'estudiante_asignado_id']);

        return Inertia::render('Citas/Index', [
            'citas' => $citas,
            'citasHoy' => $citasHoy,
            'pacientesAbandono' => $pacientesAbandono,
            'actasAbandono' => $actasAbandono,
            'sillones' => $sillones,
            'estudiantes' => $estudiantes,
            'docentes' => $docentes,
            'pacientes' => $pacientesList,
            'filtros' => [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'sillon_id' => $sillonId,
                'estudiante_id' => $estudianteId,
                'docente_id' => $docenteId,
                'estado' => $estado,
            ],
            'metricas' => $metricas,
            'cargaGabinetes' => $cargaGabinetes,
            'productividadEstudiantes' => $productividadEstudiantes,
            'configuraciones' => [
                'tiempo_max_espera_minutos' => $tiempoMaxEspera,
                'max_inasistencias_abandono' => $maxInasistencias,
            ],
            'userRole' => $userRole,
        ]);
    }

    /**
     * Crear una nueva cita con validación obligatoria multi-recurso,
     * bloqueo de colisiones físicas y humanas, y opción de recurrencia.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'estudiante_id' => 'required|exists:users,id',
            'docente_id' => 'required|exists:users,id',
            'sillon_id' => 'required|exists:sillones,id',
            'plan_tratamiento_id' => 'nullable|exists:planes_tratamiento,id',
            'tratamiento_fase_id' => 'nullable|exists:tratamiento_fases,id',
            'fecha_hora_inicio' => 'required|date',
            'duracion_estimada_minutos' => 'required|integer|min:15|max:360',
            'motivo' => 'required|string|max:255',
            'observaciones' => 'nullable|string|max:1000',
            'es_recurrente' => 'nullable|boolean',
            'frecuencia_recurrencia' => 'nullable|string|in:semanal,quincenal',
            'repeticiones' => 'nullable|integer|min:1|max:12',
        ]);

        $inicio = Carbon::parse($validated['fecha_hora_inicio']);
        $duracion = (int) $validated['duracion_estimada_minutos'];
        $fin = (clone $inicio)->addMinutes($duracion);

        $esRecurrente = !empty($validated['es_recurrente']) && !empty($validated['repeticiones']) && $validated['repeticiones'] > 1;
        $repeticiones = $esRecurrente ? (int) $validated['repeticiones'] : 1;
        $frecuenciaDias = ($validated['frecuencia_recurrencia'] ?? 'semanal') === 'quincenal' ? 14 : 7;
        $grupoRecurrenciaId = $esRecurrente ? 'REC-' . strtoupper(Str::random(10)) : null;

        $citasCreadas = [];
        $colisiones = [];

        DB::beginTransaction();
        try {
            for ($i = 0; $i < $repeticiones; $i++) {
                $sesionInicio = (clone $inicio)->addDays($i * $frecuenciaDias);
                $sesionFin = (clone $fin)->addDays($i * $frecuenciaDias);

                // 1. Verificación de colisión física (Gabinete / Sillón)
                $colisionSillon = Cita::where('sillon_id', $validated['sillon_id'])
                    ->whereNotIn('estado', ['cancelada'])
                    ->where(function ($q) use ($sesionInicio, $sesionFin) {
                        $q->where('fecha_hora_inicio', '<', $sesionFin)
                          ->where('fecha_hora_fin', '>', $sesionInicio);
                    })
                    ->exists();

                if ($colisionSillon) {
                    $colisiones[] = "Gabinete ocupado el " . $sesionInicio->format('d/m/Y H:i');
                    continue;
                }

                // 2. Verificación de colisión humana (Estudiante)
                $colisionEstudiante = Cita::where('estudiante_id', $validated['estudiante_id'])
                    ->whereNotIn('estado', ['cancelada'])
                    ->where(function ($q) use ($sesionInicio, $sesionFin) {
                        $q->where('fecha_hora_inicio', '<', $sesionFin)
                          ->where('fecha_hora_fin', '>', $sesionInicio);
                    })
                    ->exists();

                if ($colisionEstudiante) {
                    $colisiones[] = "Estudiante tiene otra cita el " . $sesionInicio->format('d/m/Y H:i');
                    continue;
                }

                $cita = Cita::create([
                    'paciente_id' => $validated['paciente_id'],
                    'estudiante_id' => $validated['estudiante_id'],
                    'docente_id' => $validated['docente_id'],
                    'sillon_id' => $validated['sillon_id'],
                    'plan_tratamiento_id' => $validated['plan_tratamiento_id'] ?? null,
                    'tratamiento_fase_id' => $validated['tratamiento_fase_id'] ?? null,
                    'fecha_hora_inicio' => $sesionInicio,
                    'fecha_hora_fin' => $sesionFin,
                    'duracion_estimada_minutos' => $duracion,
                    'es_recurrente' => $esRecurrente,
                    'frecuencia_recurrencia' => $esRecurrente ? ($validated['frecuencia_recurrencia'] ?? 'semanal') : null,
                    'grupo_recurrencia_id' => $grupoRecurrenciaId,
                    'motivo' => $validated['motivo'],
                    'observaciones' => $validated['observaciones'] ?? null,
                    'estado' => 'programada',
                ]);

                $citasCreadas[] = $cita;
            }

            if (count($citasCreadas) === 0) {
                DB::rollBack();
                return back()->withErrors([
                    'colision' => 'No se pudo programar la cita debido a colisiones de disponibilidad: ' . implode(', ', $colisiones),
                ]);
            }

            DB::commit();

            $mensaje = count($citasCreadas) === 1
                ? 'Cita programada exitosamente.'
                : 'Se programaron ' . count($citasCreadas) . ' citas recurrentes exitosamente.';

            if (!empty($colisiones)) {
                $mensaje .= ' Nota: algunas sesiones no pudieron agendarse por colisión (' . implode('; ', $colisiones) . ').';
            }

            return back()->with('success', $mensaje);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar la cita: ' . $e->getMessage()]);
        }
    }

    /**
     * Protocolo de Flujo: Registrar llegada del paciente en Recepción (Check-in a "En Sala de Espera")
     */
    public function checkIn($id)
    {
        $cita = Cita::with(['paciente', 'estudiante', 'docente'])->findOrFail($id);

        $cita->update([
            'estado' => 'en_espera',
            'check_in_at' => now(),
        ]);

        return back()->with('success', "Paciente {$cita->paciente->nombres} registrado en Sala de Espera. Se emitió alerta al alumno {$cita->estudiante->name}.");
    }

    /**
     * Protocolo de Flujo: El estudiante llama al paciente e inicia la atención clínica.
     */
    public function iniciarAtencion($id)
    {
        $cita = Cita::with(['paciente', 'sillon'])->findOrFail($id);

        $minutosEspera = $cita->check_in_at ? Carbon::parse($cita->check_in_at)->diffInMinutes(now()) : 0;

        $cita->update([
            'estado' => 'en_atencion',
            'inicio_atencion_at' => now(),
            'minutos_espera_reales' => $minutosEspera,
        ]);

        // Actualizar estado del sillón a ocupado
        if ($cita->sillon) {
            $cita->sillon->update(['estado' => 'ocupado']);
        }

        return back()->with('success', "Atención iniciada con {$cita->paciente->nombres} en {$cita->sillon->nombre}.");
    }

    /**
     * Protocolo de Flujo: Concluir la cita con éxito ("Asistió" / "Completada")
     */
    public function completar(Request $request, $id)
    {
        $cita = Cita::with(['paciente', 'sillon'])->findOrFail($id);

        $cita->update([
            'estado' => 'asistio',
            'fin_atencion_at' => now(),
            'observaciones' => $request->input('observaciones', $cita->observaciones),
        ]);

        // Liberar el sillón
        if ($cita->sillon) {
            $cita->sillon->update(['estado' => 'disponible']);
        }

        // Si la cita tenía una fase de tratamiento asociada y se envió un estado de avance
        if ($cita->tratamiento_fase_id && $request->filled('estado_procedimiento')) {
            $fase = TratamientoFase::find($cita->tratamiento_fase_id);
            if ($fase) {
                $fase->update([
                    'estado' => $request->input('estado_procedimiento'),
                    'fecha_realizacion' => now(),
                ]);
            }
        }

        return back()->with('success', "Cita completada exitosamente. Unidad {$cita->sillon->codigo} liberada.");
    }

    /**
     * Protocolo de Ausentismo: Registrar inasistencia del paciente (No Show)
     */
    public function marcarNoAsistio(Request $request, $id)
    {
        $cita = Cita::with('paciente')->findOrFail($id);
        $paciente = $cita->paciente;

        DB::beginTransaction();
        try {
            $cita->update([
                'estado' => 'no_asistio',
                'observaciones' => $request->input('motivo', 'Paciente no asistió a su cita programada.'),
            ]);

            // Liberar sillón si estaba reservado
            if ($cita->sillon_id) {
                Sillon::where('id', $cita->sillon_id)->update(['estado' => 'disponible']);
            }

            // Incrementar contador de inasistencias del paciente
            $paciente->increment('inasistencias_acumuladas');
            $maxInasistencias = (int) ConfiguracionClinica::getValor('max_inasistencias_abandono', 3);

            $mensaje = "Inasistencia registrada. El paciente acumula {$paciente->inasistencias_acumuladas} faltas.";

            // Si supera el umbral, activar alerta de abandono
            if ($paciente->inasistencias_acumuladas >= $maxInasistencias) {
                $paciente->update(['alerta_abandono' => true]);
                $mensaje .= " ¡ALERTA DE ABANDONO ACTIVADA! Se notificó al Docente y Coordinación.";
            }

            DB::commit();
            return back()->with('success', $mensaje);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar inasistencia: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancelar cita programada
     */
    public function cancelar(Request $request, $id)
    {
        $validated = $request->validate([
            'motivo_cancelacion' => 'required|string|max:500',
        ]);

        $cita = Cita::findOrFail($id);
        $cita->update([
            'estado' => 'cancelada',
            'cancelada_en' => now(),
            'cancelada_por_id' => Auth::id(),
            'motivo_cancelacion' => $validated['motivo_cancelacion'],
        ]);

        if ($cita->sillon_id) {
            Sillon::where('id', $cita->sillon_id)->update(['estado' => 'disponible']);
        }

        return back()->with('success', 'Cita cancelada correctamente.');
    }

    /**
     * Enviar recordatorio automático (WhatsApp, Correo, SMS)
     */
    public function enviarRecordatorio(Request $request, $id)
    {
        $cita = Cita::with(['paciente', 'estudiante', 'sillon'])->findOrFail($id);
        $canal = $request->input('canal', 'whatsapp');

        $fechaFormato = Carbon::parse($cita->fecha_hora_inicio)->isoFormat('dddd D [de] MMMM [a las] HH:mm');
        $mensajeRecordatorio = "Estimado(a) {$cita->paciente->nombres}, le recordamos su cita en Clínica Odontológica UNIFRANZ programada para el {$fechaFormato} en la unidad {$cita->sillon->nombre} con el estudiante {$cita->estudiante->name}. Motivo: {$cita->motivo}. Por favor confirmar su asistencia.";

        $cita->update([
            'recordatorio_enviado' => true,
            'recordatorio_enviado_at' => now(),
            'recordatorio_canal' => $canal,
            'recordatorio_mensaje' => $mensajeRecordatorio,
        ]);

        return back()->with('success', "Recordatorio generado y enviado por {$canal} a {$cita->paciente->celular}.");
    }

    /**
     * Protocolo de Alta por Abandono de Tratamiento:
     * Genera Acta/Nota de Abandono en HC (M2) y marca al paciente inactivo/abandono en M1.
     */
    public function darAltaAbandono(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'motivo_abandono' => 'required|string|max:1000',
            'acciones_previas' => 'nullable|string|max:1000',
            'observaciones' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $paciente = Paciente::with(['historiasClinicas' => function ($q) {
            $q->latest()->limit(1);
        }])->findOrFail($validated['paciente_id']);

        $historia = $paciente->historiasClinicas->first();

        DB::beginTransaction();
        try {
            // Contar actas previas para código correlativo
            $conteoActas = ActaAbandono::whereYear('fecha_declaracion', date('Y'))->count() + 1;
            $codigoActa = 'ACTA-ABAN-' . date('Y') . '-' . str_pad($conteoActas, 4, '0', STR_PAD_LEFT);

            $acta = ActaAbandono::create([
                'paciente_id' => $paciente->id,
                'historia_clinica_id' => $historia ? $historia->id : null,
                'docente_id' => $user->id,
                'estudiante_id' => $paciente->estudiante_asignado_id,
                'numero_inasistencias' => $paciente->inasistencias_acumuladas,
                'fecha_declaracion' => Carbon::today(),
                'codigo_acta' => $codigoActa,
                'motivo_abandono' => $validated['motivo_abandono'],
                'acciones_previas' => $validated['acciones_previas'] ?? 'Intentos de contacto telefónico y mensajería institucional sin respuesta favorable.',
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            // Registrar nota en la Historia Clínica si existe
            if ($historia) {
                $notaAbandono = "\n\n[ACTA DE ABANDONO {$codigoActa} - " . date('d/m/Y') . "]: Caso cerrado por inasistencia reiterada ({$paciente->inasistencias_acumuladas} faltas). Emitido por: {$user->name}. Motivo: {$validated['motivo_abandono']}";
                $historia->update([
                    'observaciones_docente' => ($historia->observaciones_docente ?? '') . $notaAbandono,
                ]);
            }

            // Actualizar paciente en Módulo 1 a Inactivo / Alta por Abandono
            $paciente->update([
                'activo' => false,
                'estado_paciente' => 'alta_abandono',
                'estado_clinico' => 'abandono',
                'alerta_abandono' => true,
            ]);

            // Cancelar citas futuras pendientes
            Cita::where('paciente_id', $paciente->id)
                ->where('fecha_hora_inicio', '>=', now())
                ->whereIn('estado', ['programada', 'confirmada', 'en_espera'])
                ->update([
                    'estado' => 'cancelada',
                    'cancelada_en' => now(),
                    'cancelada_por_id' => $user->id,
                    'motivo_cancelacion' => "Cancelación automática por Acta de Abandono {$codigoActa}",
                ]);

            DB::commit();

            return back()->with('success', "Acta de Abandono {$codigoActa} emitida formalmente. Paciente marcado como Alta por Abandono e inactivado.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al emitir el acta de abandono: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualizar configuraciones operativas (tiempos de espera, umbral de abandono)
     */
    public function guardarConfiguracion(Request $request)
    {
        $validated = $request->validate([
            'tiempo_max_espera_minutos' => 'required|integer|min:5|max:120',
            'max_inasistencias_abandono' => 'required|integer|min:1|max:10',
        ]);

        ConfiguracionClinica::updateOrCreate(
            ['clave' => 'tiempo_max_espera_minutos'],
            ['valor' => (string) $validated['tiempo_max_espera_minutos'], 'descripcion' => 'Minutos máximos en sala de espera antes de Alerta Roja']
        );

        ConfiguracionClinica::updateOrCreate(
            ['clave' => 'max_inasistencias_abandono'],
            ['valor' => (string) $validated['max_inasistencias_abandono'], 'descripcion' => 'Inasistencias consecutivas para Protocolo de Abandono']
        );

        return back()->with('success', 'Configuración de tiempos y alertas actualizada.');
    }
}
