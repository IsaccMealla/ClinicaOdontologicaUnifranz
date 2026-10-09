<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionProgramacion extends Model
{
    use HasFactory;

    protected $table = 'supervision_programaciones';

    protected $fillable = [
        'docente_id',
        'asignatura',
        'dia_semana',
        'turno',
        'sala_clinica',
        'gabinetes_asignados',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }
}
