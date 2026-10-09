<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertaBajoDesempeno extends Model
{
    use HasFactory;

    protected $table = 'alertas_bajo_desempeno';

    protected $fillable = [
        'estudiante_id',
        'docente_id',
        'asignatura',
        'motivo_categoria',
        'motivo_detallado',
        'medidas_sugeridas',
        'estado',
        'resolucion_coordinacion',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }
}
