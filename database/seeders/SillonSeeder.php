<?php

namespace Database\Seeders;

use App\Models\Sillon;
use Illuminate\Database\Seeder;

class SillonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sillones = [
            [
                'codigo' => 'SIL-01',
                'nombre' => 'Sillón Clínico 1',
                'sala_clinica' => 'Clínica Odontológica Integral A',
                'marca' => 'Gnatus',
                'modelo' => 'G3 New Fit',
                'numero_serie' => 'GN-2024-001',
                'estado' => 'disponible',
                'posicion_x' => 10.5,
                'posicion_y' => 20.0,
                'ultima_revision' => now()->subDays(10),
                'frecuencia_mantenimiento_dias' => 30,
                'notas_tecnicas' => 'Mantenimiento preventivo al día. Compresor y turbina calibrados.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-02',
                'nombre' => 'Sillón Clínico 2',
                'sala_clinica' => 'Clínica Odontológica Integral A',
                'marca' => 'Gnatus',
                'modelo' => 'G3 New Fit',
                'numero_serie' => 'GN-2024-002',
                'estado' => 'disponible',
                'posicion_x' => 15.5,
                'posicion_y' => 20.0,
                'ultima_revision' => now()->subDays(10),
                'frecuencia_mantenimiento_dias' => 30,
                'notas_tecnicas' => 'Lámpara LED regulable operativa.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-03',
                'nombre' => 'Sillón Clínico 3',
                'sala_clinica' => 'Clínica Odontológica Integral A',
                'marca' => 'KaVo',
                'modelo' => 'Primus 1058 Life',
                'numero_serie' => 'KV-2023-881',
                'estado' => 'disponible',
                'posicion_x' => 20.5,
                'posicion_y' => 20.0,
                'ultima_revision' => now()->subDays(5),
                'frecuencia_mantenimiento_dias' => 45,
                'notas_tecnicas' => 'Ultrasonido piezoeléctrico integrado activo.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-04',
                'nombre' => 'Sillón Clínico 4',
                'sala_clinica' => 'Clínica Odontológica Integral A',
                'marca' => 'KaVo',
                'modelo' => 'Primus 1058 Life',
                'numero_serie' => 'KV-2023-882',
                'estado' => 'ocupado',
                'posicion_x' => 25.5,
                'posicion_y' => 20.0,
                'ultima_revision' => now()->subDays(5),
                'frecuencia_mantenimiento_dias' => 45,
                'notas_tecnicas' => 'En atención programada.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-05',
                'nombre' => 'Sillón Quirúrgico 1',
                'sala_clinica' => 'Quirófano Menor Odontológico',
                'marca' => 'A-dec',
                'modelo' => '500 Dental Chair',
                'numero_serie' => 'AD-2025-104',
                'estado' => 'disponible',
                'posicion_x' => 10.0,
                'posicion_y' => 45.0,
                'ultima_revision' => now()->subDays(2),
                'frecuencia_mantenimiento_dias' => 15,
                'notas_tecnicas' => 'Unidad quirúrgica esterilizada y lista para cirugías maxilofaciales menores.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-06',
                'nombre' => 'Sillón Pediátrico 1',
                'sala_clinica' => 'Clínica Odontopediatría B',
                'marca' => 'Dentsply Sirona',
                'modelo' => 'Intego Pro Ambidextrous',
                'numero_serie' => 'DS-2024-331',
                'estado' => 'disponible',
                'posicion_x' => 12.0,
                'posicion_y' => 65.0,
                'ultima_revision' => now()->subDays(8),
                'frecuencia_mantenimiento_dias' => 30,
                'notas_tecnicas' => 'Tapizado lúdico infantil en óptimas condiciones.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-07',
                'nombre' => 'Sillón Clínico 5',
                'sala_clinica' => 'Clínica Odontológica Integral B',
                'marca' => 'Gnatus',
                'modelo' => 'G2 Line',
                'numero_serie' => 'GN-2022-550',
                'estado' => 'en_mantenimiento',
                'posicion_x' => 18.0,
                'posicion_y' => 65.0,
                'ultima_revision' => now()->subDays(1),
                'frecuencia_mantenimiento_dias' => 30,
                'notas_tecnicas' => 'Cambio de electroválvula de succión en curso.',
                'activo' => true,
            ],
            [
                'codigo' => 'SIL-08',
                'nombre' => 'Sillón Clínico 6',
                'sala_clinica' => 'Clínica Odontológica Integral B',
                'marca' => 'Gnatus',
                'modelo' => 'G2 Line',
                'numero_serie' => 'GN-2022-551',
                'estado' => 'disponible',
                'posicion_x' => 24.0,
                'posicion_y' => 65.0,
                'ultima_revision' => now()->subDays(12),
                'frecuencia_mantenimiento_dias' => 30,
                'notas_tecnicas' => 'Totalmente operativo.',
                'activo' => true,
            ],
        ];

        foreach ($sillones as $s) {
            Sillon::updateOrCreate(['codigo' => $s['codigo']], $s);
        }
    }
}
