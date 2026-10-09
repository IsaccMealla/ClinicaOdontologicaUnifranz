<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionSolicitud extends Model
{
    use HasFactory;

    protected $table = 'supervision_solicitudes';

    protected $fillable = [
        'estudiante_id',
        'docente_id',
        'paciente_id',
        'historia_clinica_id',
        'plan_tratamiento_id',
        'tratamiento_fase_id',
        'sillon_id',
        'asignatura',
        'tipo_hito',
        'procedimiento',
        'pieza_dental',
        'estado',
        'comentarios_estudiante',
        'comentarios_docente',
        'firma_digital',
        'evaluacion_rubrica',
        'solicitado_at',
        'respondido_at',
    ];

    protected function casts(): array
    {
        return [
            'firma_digital' => 'array',
            'evaluacion_rubrica' => 'array',
            'solicitado_at' => 'datetime',
            'respondido_at' => 'datetime',
        ];
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function historiaClinica(): BelongsTo
    {
        return $this->belongsTo(HistoriaClinica::class, 'historia_clinica_id');
    }

    public function planTratamiento(): BelongsTo
    {
        return $this->belongsTo(PlanTratamiento::class, 'plan_tratamiento_id');
    }

    public function tratamientoFase(): BelongsTo
    {
        return $this->belongsTo(TratamientoFase::class, 'tratamiento_fase_id');
    }

    public function sillon(): BelongsTo
    {
        return $this->belongsTo(Sillon::class, 'sillon_id');
    }
}
