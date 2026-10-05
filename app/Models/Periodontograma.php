<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Periodontograma extends Model
{
    use HasFactory;

    protected $table = 'periodontogramas';

    protected $fillable = [
        'historia_clinica_id',
        'paciente_id',
        'estudiante_id',
        'docente_supervisor_id',
        'version',
        'mediciones_periodontales',
        'indice_placa_porcentaje',
        'indice_sangrado_porcentaje',
        'diagnostico_periodontal',
        'pronostico_periodontal',
        'estado_aprobacion',
        'fecha_aprobacion',
        'comentarios_docente',
    ];

    protected function casts(): array
    {
        return [
            'mediciones_periodontales' => 'array',
            'indice_placa_porcentaje' => 'float',
            'indice_sangrado_porcentaje' => 'float',
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
