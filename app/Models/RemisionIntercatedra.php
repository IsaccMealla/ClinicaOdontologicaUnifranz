<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RemisionIntercatedra extends Model
{
    use HasFactory;

    protected $table = 'remisiones_intercatedra';

    protected $fillable = [
        'paciente_id',
        'estudiante_emisor_id',
        'docente_autoriza_id',
        'estudiante_receptor_id',
        'catedra_origen',
        'catedra_receptora',
        'pieza_dental',
        'procedimiento_solicitado',
        'motivo_remision',
        'estado',
        'fecha_atencion',
        'observaciones_resolucion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_atencion' => 'datetime',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estudianteEmisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_emisor_id');
    }

    public function docenteAutoriza(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_autoriza_id');
    }

    public function estudianteReceptor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_receptor_id');
    }
}
