<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ImagenClinica extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'imagenes_clinicas';

    protected $fillable = [
        'paciente_id',
        'iup',
        'historia_clinica_id',
        'plan_tratamiento_id',
        'tratamiento_fase_id',
        'user_id',
        'docente_validador_id',
        'categoria',
        'tipo_imagen',
        'fase_caso',
        'pieza_dental',
        'plano_corte_cbct',
        'tipo_placa_psp',
        'titulo',
        'descripcion',
        'archivo_path',
        'archivo_url',
        'nombre_original',
        'mime_type',
        'tamano_bytes',
        'tamano_formateado',
        'fecha_adquisicion',
        'metadatos',
        'anotaciones',
        'validada_por_docente',
        'fecha_validacion',
        'observaciones_docente',
        'calificacion_docente',
    ];

    protected function casts(): array
    {
        return [
            'fecha_adquisicion' => 'datetime',
            'fecha_validacion' => 'datetime',
            'metadatos' => 'array',
            'anotaciones' => 'array',
            'validada_por_docente' => 'boolean',
            'calificacion_docente' => 'integer',
        ];
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function docenteValidador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_validador_id');
    }
}
