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
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'duracion_estimada_minutos',
        'motivo',
        'estado',
        'check_in_at',
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
            'cancelada_en' => 'datetime',
            'duracion_estimada_minutos' => 'integer',
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

    public function canceladaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelada_por_id');
    }
}
