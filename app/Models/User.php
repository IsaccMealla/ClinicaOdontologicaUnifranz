<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol_id',
        'codigo_institucional',
        'telefono',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function hasRole(string $slug): bool
    {
        return $this->rol && $this->rol->slug === $slug;
    }

    public function historiasClinicasComoEstudiante(): HasMany
    {
        return $this->hasMany(HistoriaClinica::class, 'estudiante_id');
    }

    public function historiasClinicasComoDocente(): HasMany
    {
        return $this->hasMany(HistoriaClinica::class, 'docente_supervisor_id');
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'estudiante_id');
    }

    public function seguimientosAcademicos(): HasMany
    {
        return $this->hasMany(SeguimientoAcademico::class, 'estudiante_id');
    }

    public function pacientesAsignados(): HasMany
    {
        return $this->hasMany(Paciente::class, 'estudiante_asignado_id');
    }

    public function planesTratamiento(): HasMany
    {
        return $this->hasMany(PlanTratamiento::class, 'estudiante_id');
    }
}
