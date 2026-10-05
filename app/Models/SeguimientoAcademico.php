<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeguimientoAcademico extends Model
{
    use HasFactory;

    protected $table = 'seguimiento_academico';

    protected $fillable = [
        'estudiante_id',
        'docente_tutor_id',
        'asignatura',
        'periodo_academico',
        'procedimiento_clave',
        'cupos_requeridos',
        'cupos_completados',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'cupos_requeridos' => 'integer',
            'cupos_completados' => 'integer',
        ];
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function docenteTutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_tutor_id');
    }
}
