<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sillon extends Model
{
    use HasFactory;

    protected $table = 'sillones';

    protected $fillable = [
        'codigo',
        'nombre',
        'sala_clinica',
        'marca',
        'modelo',
        'numero_serie',
        'estado',
        'posicion_x',
        'posicion_y',
        'ultima_revision',
        'frecuencia_mantenimiento_dias',
        'notas_tecnicas',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'ultima_revision' => 'datetime',
            'frecuencia_mantenimiento_dias' => 'integer',
            'posicion_x' => 'float',
            'posicion_y' => 'float',
        ];
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'sillon_id');
    }
}
