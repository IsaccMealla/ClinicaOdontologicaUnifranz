<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransferenciaPaciente extends Model
{
    use HasFactory;

    protected $table = 'transferencias_pacientes';

    protected $fillable = [
        'paciente_id',
        'estudiante_anterior_id',
        'estudiante_nuevo_id',
        'docente_autoriza_id',
        'motivo_estandarizado',
        'justificacion_detallada',
        'estado',
    ];

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estudianteAnterior(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_anterior_id');
    }

    public function estudianteNuevo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_nuevo_id');
    }

    public function docenteAutoriza(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_autoriza_id');
    }
}
