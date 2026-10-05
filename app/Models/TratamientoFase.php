<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TratamientoFase extends Model
{
    use HasFactory;

    protected $table = 'tratamiento_fases';

    protected $fillable = [
        'plan_tratamiento_id',
        'numero_fase',
        'fase_categoria',
        'nombre_fase',
        'especialidad',
        'procedimiento',
        'pieza_fdi',
        'diagnostico_codigo',
        'arancel_codigo',
        'costo_arancel',
        'prioridad',
        'tiempo_estimado_minutos',
        'tiempo_empleado_minutos',
        'materiales_consumidos',
        'sesiones_clinicas',
        'estado',
        'observaciones_estudiante',
        'observaciones_docente',
        'calificacion',
        'docente_aprobador_id',
        'fecha_aprobacion',
    ];

    protected function casts(): array
    {
        return [
            'numero_fase' => 'integer',
            'pieza_fdi' => 'integer',
            'costo_arancel' => 'float',
            'tiempo_estimado_minutos' => 'integer',
            'tiempo_empleado_minutos' => 'integer',
            'materiales_consumidos' => 'array',
            'sesiones_clinicas' => 'array',
            'calificacion' => 'integer',
            'fecha_aprobacion' => 'datetime',
        ];
    }

    public function planTratamiento(): BelongsTo
    {
        return $this->belongsTo(PlanTratamiento::class, 'plan_tratamiento_id');
    }

    public function docenteAprobador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_aprobador_id');
    }
}
