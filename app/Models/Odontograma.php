<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Odontograma extends Model
{
    use HasFactory;

    protected $table = 'odontogramas';

    protected $fillable = [
        'historia_clinica_id',
        'paciente_id',
        'estudiante_id',
        'docente_supervisor_id',
        'tipo',
        'version',
        'hallazgos_piezas',
        'especificaciones',
        'estado_aprobacion',
        'fecha_aprobacion',
        'comentarios_docente',
    ];

    protected function casts(): array
    {
        return [
            'hallazgos_piezas' => 'array',
            'version' => 'integer',
            'fecha_aprobacion' => 'datetime',
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
}
