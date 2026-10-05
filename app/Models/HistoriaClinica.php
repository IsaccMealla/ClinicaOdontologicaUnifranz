<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistoriaClinica extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'historias_clinicas';

    protected $fillable = [
        'numero_expediente',
        'paciente_id',
        'estudiante_id',
        'docente_supervisor_id',
        'motivo_consulta',
        'motivo_consulta_paciente',
        'enfermedad_actual',
        'antecedentes_odontologicos',
        'signos_vitales',
        'examen_estomatologico',
        'diagnostico_presuntivo',
        'diagnostico_definitivo',
        'diagnosticos_codificados',
        'pronostico',
        'plan_tratamiento',
        'plan_tratamiento_secuencia',
        'odontologia_legal_forense',
        'estado',
        'fecha_aprobacion',
        'observaciones_docente',
    ];

    protected function casts(): array
    {
        return [
            'signos_vitales' => 'array',
            'examen_estomatologico' => 'array',
            'antecedentes_odontologicos' => 'array',
            'diagnosticos_codificados' => 'array',
            'plan_tratamiento_secuencia' => 'array',
            'odontologia_legal_forense' => 'array',
            'fecha_aprobacion' => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::creating(function (HistoriaClinica $hc) {
            if (empty($hc->numero_expediente)) {
                $year = date('Y');
                $count = static::whereYear('created_at', $year)->count() + 1;
                $hc->numero_expediente = sprintf('HC-001-%s-%04d', $year, $count);
            }
        });
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

    public function getDocenteRevisorIdAttribute()
    {
        return $this->docente_supervisor_id;
    }

    public function odontogramas(): HasMany
    {
        return $this->hasMany(Odontograma::class, 'historia_clinica_id');
    }

    public function periodontogramas(): HasMany
    {
        return $this->hasMany(Periodontograma::class, 'historia_clinica_id');
    }

    public function planesTratamiento(): HasMany
    {
        return $this->hasMany(PlanTratamiento::class, 'historia_clinica_id');
    }
}
