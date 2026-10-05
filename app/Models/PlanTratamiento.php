<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanTratamiento extends Model
{
    use HasFactory;

    protected $table = 'planes_tratamiento';

    protected $fillable = [
        'historia_clinica_id',
        'paciente_id',
        'estudiante_id',
        'docente_supervisor_id',
        'titulo',
        'descripcion',
        'fase_actual',
        'costo_total_estimado',
        'porcentaje_avance',
        'estado',
        'fecha_aprobacion_docente',
        'observaciones_docente',
        'aceptacion_paciente',
        'alta_clinica',
        'requiere_validacion_docente',
    ];

    protected function casts(): array
    {
        return [
            'costo_total_estimado' => 'float',
            'porcentaje_avance' => 'integer',
            'fecha_aprobacion_docente' => 'datetime',
            'aceptacion_paciente' => 'array',
            'alta_clinica' => 'array',
            'requiere_validacion_docente' => 'boolean',
        ];
    }

    public function historiaClinica(): BelongsTo
    {
        return $this->belongsTo(HistoriaClinica::class, 'historia_clinica_id');
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function docenteSupervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_supervisor_id');
    }

    public function fases(): HasMany
    {
        return $this->hasMany(TratamientoFase::class, 'plan_tratamiento_id');
    }
}
