<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Arancel extends Model
{
    use HasFactory;

    protected $table = 'aranceles';

    protected $fillable = [
        'codigo',
        'categoria',
        'nombre',
        'descripcion',
        'precio_base',
        'tiempo_estimado_minutos',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'precio_base' => 'float',
            'tiempo_estimado_minutos' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
