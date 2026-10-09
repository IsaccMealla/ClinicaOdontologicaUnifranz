<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsignaturaCupoRequisito extends Model
{
    use HasFactory;

    protected $table = 'asignaturas_cupos_requisitos';

    protected $fillable = [
        'asignatura',
        'semestre',
        'procedimiento_clave',
        'cupos_minimos',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'cupos_minimos' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
