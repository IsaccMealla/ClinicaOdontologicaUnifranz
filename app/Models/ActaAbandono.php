<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActaAbandono extends Model
{
    use HasFactory;

    protected $table = 'actas_abandono';

    protected $fillable = [
        'paciente_id',
        'historia_clinica_id',
        'docente_id',
        'estudiante_id',
        'numero_inasistencias',
        'fecha_declaracion',
        'codigo_acta',
        'motivo_abandono',
        'acciones_previas',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_declaracion' => 'date',
            'numero_inasistencias' => 'integer',
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

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }
}
