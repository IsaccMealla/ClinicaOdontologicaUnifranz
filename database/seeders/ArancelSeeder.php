<?php

namespace Database\Seeders;

use App\Models\Arancel;
use Illuminate\Database\Seeder;

class ArancelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aranceles = [
            // Operatoria Dental
            [
                'codigo' => 'AR-OP-01',
                'categoria' => 'Operatoria Dental',
                'nombre' => 'Obturación con Resina Compuesta 1 Superficie',
                'descripcion' => 'Restauración estética directa fotopolimerizable en esmalte y dentina (Clase I / V).',
                'precio_base' => 80.00,
                'tiempo_estimado_minutos' => 45,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-OP-02',
                'categoria' => 'Operatoria Dental',
                'nombre' => 'Obturación con Resina Compuesta 2 Superficies',
                'descripcion' => 'Restauración interproximal Clase II (MO, DO) con aislamiento absoluto.',
                'precio_base' => 110.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-OP-03',
                'categoria' => 'Operatoria Dental',
                'nombre' => 'Reconstrucción Estética Clase IV / Carilla Directa',
                'descripcion' => 'Reconstrucción de ángulo incisal o fractura estética anterior con resina nanohíbrida.',
                'precio_base' => 140.00,
                'tiempo_estimado_minutos' => 75,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-OP-04',
                'categoria' => 'Operatoria Dental',
                'nombre' => 'Inactivación y Restauración con Ionómero de Vidrio',
                'descripcion' => 'Terapia restauradora atraumática (TRA) con ionómero de alta viscosidad.',
                'precio_base' => 60.00,
                'tiempo_estimado_minutos' => 35,
                'activo' => true,
            ],

            // Periodoncia
            [
                'codigo' => 'AR-PE-01',
                'categoria' => 'Periodoncia',
                'nombre' => 'Profilaxis Dental Completa y Flúor Gel',
                'descripcion' => 'Higiene dental profesional, pulido coronario con pasta profiláctica y fluoración.',
                'precio_base' => 50.00,
                'tiempo_estimado_minutos' => 30,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PE-02',
                'categoria' => 'Periodoncia',
                'nombre' => 'Destartraje Supragingival con Ultrasonido',
                'descripcion' => 'Eliminación mecánica de cálculo y placa dura en boca completa con piezoeléctrico.',
                'precio_base' => 70.00,
                'tiempo_estimado_minutos' => 45,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PE-03',
                'categoria' => 'Periodoncia',
                'nombre' => 'Raspaje y Alisado Radicular Subgingival (por Cuadrante)',
                'descripcion' => 'Terapia periodontal profunda con curetas Gracey e irrigación antiséptica.',
                'precio_base' => 90.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PE-04',
                'categoria' => 'Periodoncia',
                'nombre' => 'Gingivectomía / Alargamiento Quirúrgico Coronario',
                'descripcion' => 'Remodelado de encía marginal o contorno tisular estético.',
                'precio_base' => 120.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],

            // Endodoncia
            [
                'codigo' => 'AR-EN-01',
                'categoria' => 'Endodoncia',
                'nombre' => 'Tratamiento de Conducto Unirradicular (Anterior)',
                'descripcion' => 'Biopulpectomía o necropulpectomía en incisivos o caninos con sellado termoplastificado.',
                'precio_base' => 180.00,
                'tiempo_estimado_minutos' => 75,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-EN-02',
                'categoria' => 'Endodoncia',
                'nombre' => 'Tratamiento de Conducto Birradicular (Premolar)',
                'descripcion' => 'Instrumentación rotatoria y obturación tridimensional en premolares superiores/inferiores.',
                'precio_base' => 220.00,
                'tiempo_estimado_minutos' => 90,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-EN-03',
                'categoria' => 'Endodoncia',
                'nombre' => 'Tratamiento de Conducto Multirradicular (Molar)',
                'descripcion' => 'Endodoncia en molares (3 a 4 conductos) con localización foraminal electrónica.',
                'precio_base' => 280.00,
                'tiempo_estimado_minutos' => 100,
                'activo' => true,
            ],

            // Cirugía Bucal
            [
                'codigo' => 'AR-CI-01',
                'categoria' => 'Cirugía Bucal',
                'nombre' => 'Exodoncia Simple de Pieza Permanente',
                'descripcion' => 'Extracción dental atraumática con anestesia local y hemostasia.',
                'precio_base' => 60.00,
                'tiempo_estimado_minutos' => 40,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-CI-02',
                'categoria' => 'Cirugía Bucal',
                'nombre' => 'Exodoncia Compleja con Odontosección',
                'descripcion' => 'Extracción quirúrgica con colgajo mucoperióstico y osteotomía alveolar.',
                'precio_base' => 120.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-CI-03',
                'categoria' => 'Cirugía Bucal',
                'nombre' => 'Exodoncia Quirúrgica de Tercer Molar Incluido',
                'descripcion' => 'Cirugía de muela de juicio retenida o impactada con sutura reabsorbible.',
                'precio_base' => 250.00,
                'tiempo_estimado_minutos' => 90,
                'activo' => true,
            ],

            // Prótesis Fija y Removible
            [
                'codigo' => 'AR-PR-01',
                'categoria' => 'Prótesis',
                'nombre' => 'Corona Protésica Metal-Porcelana',
                'descripcion' => 'Prótesis fija unitaria con subestructura metálica biocompatible y recubrimiento cerámico.',
                'precio_base' => 450.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PR-02',
                'categoria' => 'Prótesis',
                'nombre' => 'Perno Muñón Colado / Poste de Fibra de Vidrio',
                'descripcion' => 'Anclaje intrarradicular y reconstrucción de muñón coronal pos-endodoncia.',
                'precio_base' => 150.00,
                'tiempo_estimado_minutos' => 50,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PR-03',
                'categoria' => 'Prótesis',
                'nombre' => 'Prótesis Parcial Removible Acrílica',
                'descripcion' => 'Aparato protésico mucosoportado con ganchos forjados y dientes de resina multicapa.',
                'precio_base' => 550.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PR-04',
                'categoria' => 'Prótesis',
                'nombre' => 'Prótesis Total Mucosoportada (Superior o Inferior)',
                'descripcion' => 'Dentadura completa con base de acrílico termocurable de alto impacto.',
                'precio_base' => 750.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ],

            // Odontopediatría
            [
                'codigo' => 'AR-PD-01',
                'categoria' => 'Odontopediatría',
                'nombre' => 'Pulpotomía Vital en Diente Deciduo',
                'descripcion' => 'Amputación pulpar coronal y fijación con sulfato férrico / MTA y sellado coronario.',
                'precio_base' => 100.00,
                'tiempo_estimado_minutos' => 45,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PD-02',
                'categoria' => 'Odontopediatría',
                'nombre' => 'Corona Preformada de Acero en Molar Temporal',
                'descripcion' => 'Corona metálica prefabricada para molares primarios con destrucción severa.',
                'precio_base' => 120.00,
                'tiempo_estimado_minutos' => 45,
                'activo' => true,
            ],
            [
                'codigo' => 'AR-PD-03',
                'categoria' => 'Odontopediatría',
                'nombre' => 'Sellador de Fosas y Fisuras Preventivo',
                'descripcion' => 'Aplicación preventiva de sellador con liberación prolongada de fluoruro.',
                'precio_base' => 40.00,
                'tiempo_estimado_minutos' => 25,
                'activo' => true,
            ],
        ];

        foreach ($aranceles as $ar) {
            Arancel::updateOrCreate(['codigo' => $ar['codigo']], $ar);
        }
    }
}
