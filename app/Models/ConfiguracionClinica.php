<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfiguracionClinica extends Model
{
    use HasFactory;

    protected $table = 'configuraciones_clinica';

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
    ];

    public static function getValor(string $clave, mixed $default = null): mixed
    {
        $setting = static::where('clave', $clave)->first();
        return $setting ? $setting->valor : $default;
    }
}
