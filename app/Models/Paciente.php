<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paciente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pacientes';

    protected $fillable = [
        'iup',
        'ci',
        'ci_expedido',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'fecha_nacimiento',
        'sexo',
        'estado_civil',
        'nacionalidad',
        'ocupacion',
        'nivel_instruccion',
        'lugar_nacimiento',
        'direccion',
        'telefono',
        'celular',
        'email',
        'fuente_referencia',
        'seguro_convenio',
        'numero_poliza',
        'contacto_emergencia',
        'telefono_emergencia',
        'parentesco_emergencia',
        'estado_paciente',
        'estado_clinico',
        'ci_documento_url',
        'consentimiento_inicial',
        'saldo_cuenta',
        'estudiante_asignado_id',
        'fecha_ultima_consulta',
        'motivo_ultima_consulta',
        'inasistencias_acumuladas',
        'alerta_abandono',
        'activo',
    ];

    protected $appends = [
        'nombre_completo',
        'edad',
        'alertas_medicas',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'fecha_ultima_consulta' => 'date',
            'inasistencias_acumuladas' => 'integer',
            'alerta_abandono' => 'boolean',
            'activo' => 'boolean',
            'consentimiento_inicial' => 'array',
            'saldo_cuenta' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Paciente $paciente) {
            if (empty($paciente->iup)) {
                $year = date('Y');
                $padded = str_pad((string)$paciente->id, 6, '0', STR_PAD_LEFT);
                $paciente->iup = "UNIFRANZ-{$year}-{$padded}";
                $paciente->saveQuietly();
            }
        });
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}");
    }

    public function getEdadAttribute(): ?int
    {
        return $this->fecha_nacimiento ? Carbon::parse($this->fecha_nacimiento)->age : null;
    }

    /**
     * Retorna un array con las alertas médicas activas para visualización en badges
     */
    public function getAlertasMedicasAttribute(): array
    {
        $alertas = [];
        $ant = $this->antecedentesMedicos;

        if (!$ant) {
            return $alertas;
        }

        $pers = $ant->patologicos_personales ?? [];

        if ($ant->alerta_alergia || !empty($pers['alergia_penicilina']) || !empty($pers['alergia_anestesia']) || !empty($pers['alergia_aspirina']) || !empty($pers['alergia_yodo'])) {
            $detalles = [];
            if (!empty($pers['alergia_penicilina'])) $detalles[] = 'Penicilina';
            if (!empty($pers['alergia_anestesia'])) $detalles[] = 'Anestesia';
            if (!empty($pers['alergia_aspirina'])) $detalles[] = 'Aspirina';
            if (!empty($pers['alergia_yodo'])) $detalles[] = 'Yodo';
            $alertas[] = [
                'tipo' => 'alergia',
                'nivel' => 'peligro', // badge rojo
                'titulo' => 'Alergia Medicamentosa',
                'detalle' => count($detalles) > 0 ? implode(', ', $detalles) : 'Alergias reportadas',
            ];
        }

        if ($ant->alerta_coagulacion || !empty($pers['sangra_excesivamente']) || !empty($pers['hemofilia']) || !empty($pers['problema_sanguineo'])) {
            $alertas[] = [
                'tipo' => 'coagulacion',
                'nivel' => 'peligro',
                'titulo' => 'Trastorno Coagulación',
                'detalle' => 'Riesgo hemorrágico en cirugía o exodoncias',
            ];
        }

        if ($ant->alerta_hipertension || !empty($pers['tension_arterial'])) {
            $alertas[] = [
                'tipo' => 'hipertension',
                'nivel' => 'advertencia', // badge ámbar
                'titulo' => 'Hipertensión Arterial',
                'detalle' => $pers['tension_arterial_tipo'] ?? 'Controlar PA antes de anestesia',
            ];
        }

        if ($ant->alerta_diabetes || !empty($pers['diabetes'])) {
            $alertas[] = [
                'tipo' => 'diabetes',
                'nivel' => 'advertencia',
                'titulo' => 'Diabetes Mellitus',
                'detalle' => 'Retardo en cicatrización / profilaxis',
            ];
        }

        if ($ant->alerta_embarazo || (!empty($ant->ginecologicos['posibilidad_embarazo']))) {
            $meses = $ant->ginecologicos['embarazo_meses'] ?? '';
            $alertas[] = [
                'tipo' => 'embarazo',
                'nivel' => 'info',
                'titulo' => 'Paciente Gestante',
                'detalle' => $meses ? "{$meses} meses de gestación" : 'Posibilidad de embarazo',
            ];
        }

        return $alertas;
    }

    public function estudianteAsignado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_asignado_id');
    }

    public function antecedentesMedicos(): HasOne
    {
        return $this->hasOne(AntecedenteMedico::class, 'paciente_id');
    }

    public function historiasClinicas(): HasMany
    {
        return $this->hasMany(HistoriaClinica::class, 'paciente_id');
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'paciente_id');
    }

    public function odontogramas(): HasMany
    {
        return $this->hasMany(Odontograma::class, 'paciente_id');
    }

    public function periodontogramas(): HasMany
    {
        return $this->hasMany(Periodontograma::class, 'paciente_id');
    }

    public function planesTratamiento(): HasMany
    {
        return $this->hasMany(PlanTratamiento::class, 'paciente_id');
    }

    public function remisionesIntercatedra(): HasMany
    {
        return $this->hasMany(RemisionIntercatedra::class, 'paciente_id');
    }

    public function transferencias(): HasMany
    {
        return $this->hasMany(TransferenciaPaciente::class, 'paciente_id');
    }
}
