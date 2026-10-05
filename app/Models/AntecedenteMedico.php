<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AntecedenteMedico extends Model
{
    use HasFactory;

    protected $table = 'antecedentes_medicos';

    protected $fillable = [
        'paciente_id',
        'estudiante_registra_id',
        'docente_supervisor_id',
        'patologicos_personales',
        'patologicos_familiares',
        'no_patologicos',
        'ginecologicos',
        'examen_clinico_fisico',
        'habitos',
        'historia_odontopediatrica',
        'antecedentes_periodontales',
        'examen_periodontal',
        'procedimientos_tratamientos',
        'motivo_consulta_paciente',
        'antecedentes_odontologicos',
        'odontograma',
        'diagnosticos_codificados',
        'plan_tratamiento_secuencia',
        'odontologia_legal_forense',
        'alerta_alergia',
        'alerta_hipertension',
        'alerta_coagulacion',
        'alerta_diabetes',
        'alerta_embarazo',
        'estado_revision',
        'comentarios_docente',
        'fecha_aprobacion',
    ];

    protected function casts(): array
    {
        return [
            'patologicos_personales' => 'array',
            'patologicos_familiares' => 'array',
            'no_patologicos' => 'array',
            'ginecologicos' => 'array',
            'examen_clinico_fisico' => 'array',
            'habitos' => 'array',
            'historia_odontopediatrica' => 'array',
            'antecedentes_periodontales' => 'array',
            'examen_periodontal' => 'array',
            'procedimientos_tratamientos' => 'array',
            'antecedentes_odontologicos' => 'array',
            'odontograma' => 'array',
            'diagnosticos_codificados' => 'array',
            'plan_tratamiento_secuencia' => 'array',
            'odontologia_legal_forense' => 'array',
            'alerta_alergia' => 'boolean',
            'alerta_hipertension' => 'boolean',
            'alerta_coagulacion' => 'boolean',
            'alerta_diabetes' => 'boolean',
            'alerta_embarazo' => 'boolean',
            'fecha_aprobacion' => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::saving(function (AntecedenteMedico $ant) {
            $pers = $ant->patologicos_personales ?? [];
            $gineco = $ant->ginecologicos ?? [];
            $alergiasObj = is_array($pers['alergias'] ?? null) ? $pers['alergias'] : [];
            $sistemicasObj = is_array($pers['enfermedades_sistemicas'] ?? null) ? $pers['enfermedades_sistemicas'] : [];
            $coagObj = is_array($pers['trastornos_coagulacion'] ?? null) ? $pers['trastornos_coagulacion'] : [];

            // Detectar banderas de alerta automáticamente a partir del contenido
            $ant->alerta_alergia = !empty($pers['alergia_penicilina'])
                || !empty($pers['alergia_anestesia'])
                || !empty($pers['alergia_aspirina'])
                || !empty($pers['alergia_yodo'])
                || !empty($pers['otras_alergias'])
                || !empty($alergiasObj['penicilina'])
                || !empty($alergiasObj['anestesia'])
                || !empty($alergiasObj['aspirina'])
                || !empty($alergiasObj['yodo'])
                || !empty($alergiasObj['otros']);

            $ant->alerta_hipertension = !empty($pers['tension_arterial'])
                || !empty($pers['hipertension'])
                || !empty($pers['presion_alta'])
                || !empty($sistemicasObj['hipertension']);

            $ant->alerta_coagulacion = !empty($pers['sangra_excesivamente'])
                || !empty($pers['problema_sanguineo'])
                || !empty($pers['hemofilia'])
                || !empty($pers['trastornos_coagulacion'])
                || !empty($coagObj['padece']);

            $ant->alerta_diabetes = !empty($pers['diabetes'])
                || !empty($sistemicasObj['diabetes']);

            $ant->alerta_embarazo = !empty($gineco['posibilidad_embarazo'])
                || !empty($gineco['embarazo']);
        });
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function estudianteRegistra(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_registra_id');
    }

    public function docenteSupervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_supervisor_id');
    }
}
