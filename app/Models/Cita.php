<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cita extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'citas';

    protected $fillable = [
        'paciente_id',
        'estudiante_id',
        'docente_id',
        'sillon_id',
        'plan_tratamiento_id',
        'tratamiento_fase_id',
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'duracion_estimada_minutos',
        'es_recurrente',
        'frecuencia_recurrencia',
        'grupo_recurrencia_id',
        'motivo',
        'estado',
        'check_in_at',
        'inicio_atencion_at',
        'fin_atencion_at',
        'minutos_espera_reales',
        'alerta_espera_prolongada',
        'recordatorio_enviado',
        'recordatorio_enviado_at',
        'recordatorio_canal',
        'recordatorio_mensaje',
        'cancelada_en',
        'cancelada_por_id',
        'motivo_cancelacion',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora_inicio' => 'datetime',
            'fecha_hora_fin' => 'datetime',
            'check_in_at' => 'datetime',
            'inicio_atencion_at' => 'datetime',
            'fin_atencion_at' => 'datetime',
            'recordatorio_enviado_at' => 'datetime',
            'cancelada_en' => 'datetime',
            'duracion_estimada_minutos' => 'integer',
            'minutos_espera_reales' => 'integer',
            'es_recurrente' => 'boolean',
            'alerta_espera_prolongada' => 'boolean',
            'recordatorio_enviado' => 'boolean',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function sillon(): BelongsTo
    {
        return $this->belongsTo(Sillon::class, 'sillon_id');
    }

    public function planTratamiento(): BelongsTo
    {
        return $this->belongsTo(PlanTratamiento::class, 'plan_tratamiento_id');
    }

    public function tratamientoFase(): BelongsTo
    {
        return $this->belongsTo(TratamientoFase::class, 'tratamiento_fase_id');
    }

    public function canceladaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelada_por_id');
    }
}
