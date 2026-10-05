<?php

namespace Database\Seeders;

use App\Models\AntecedenteMedico;
use App\Models\AuditoriaLog;
use App\Models\Cita;
use App\Models\HistoriaClinica;
use App\Models\Odontograma;
use App\Models\Paciente;
use App\Models\Periodontograma;
use App\Models\PlanTratamiento;
use App\Models\SeguimientoAcademico;
use App\Models\Sillon;
use App\Models\TratamientoFase;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClinicaDemoSeeder extends Seeder
{
    /**
     * Run the database seeds with rich clinical records, treatments, and histories.
     */
    public function run(): void
    {
        // Usuarios Docentes
        $docenteFernandez = User::where('email', 'docente@unifranz.edu.bo')->first();
        $docenteMorales = User::where('email', 'valeria.morales@unifranz.edu.bo')->first() ?? $docenteFernandez;
        $docenteSalazar = User::where('email', 'rodrigo.salazar@unifranz.edu.bo')->first() ?? $docenteFernandez;

        // Estudiantes Operadores
        $estudianteGabriela = User::where('email', 'estudiante@unifranz.edu.bo')->first();
        $estudianteTorrico = User::where('email', 'sofia.torrico@unifranz.edu.bo')->first() ?? $estudianteGabriela;
        $estudianteSiles = User::where('email', 'alejandro.siles@unifranz.edu.bo')->first() ?? $estudianteGabriela;
        $estudianteBeltran = User::where('email', 'camila.beltran@unifranz.edu.bo')->first() ?? $estudianteGabriela;
        $estudianteMercado = User::where('email', 'gabriel.mercado@unifranz.edu.bo')->first() ?? $estudianteGabriela;

        // Sillones
        $sillones = Sillon::all();
        $sillon1 = $sillones->where('codigo', 'SIL-01')->first() ?? $sillones->first();
        $sillon2 = $sillones->where('codigo', 'SIL-02')->first() ?? $sillones->first();
        $sillon3 = $sillones->where('codigo', 'SIL-03')->first() ?? $sillones->first();
        $sillon4 = $sillones->where('codigo', 'SIL-04')->first() ?? $sillones->first();

        // =============================================================
        // PACIENTE 1: Juan Carlos Pérez Mamani (Operatoria & Periodoncia)
        // =============================================================
        $paciente1 = Paciente::updateOrCreate(
            ['ci' => '8492014'],
            [
                'iup' => 'UNIFRANZ-2026-000001',
                'ci_expedido' => 'LP',
                'nombres' => 'Juan Carlos',
                'apellido_paterno' => 'Pérez',
                'apellido_materno' => 'Mamani',
                'fecha_nacimiento' => '1995-04-12',
                'sexo' => 'M',
                'estado_civil' => 'Soltero',
                'nacionalidad' => 'Boliviana',
                'ocupacion' => 'Contador General',
                'nivel_instruccion' => 'Licenciatura Universitaria',
                'lugar_nacimiento' => 'La Paz',
                'fuente_referencia' => 'Recomendación de familiar / campaña universitaria',
                'seguro_convenio' => 'Seguro Universitario Estudiantil',
                'numero_poliza' => 'UNIF-SEG-84920',
                'direccion' => 'Av. Landaeta N° 450, Zona San Pedro',
                'telefono' => '2491122',
                'celular' => '71542369',
                'email' => 'juan.perez.contador@gmail.com',
                'contacto_emergencia' => 'Elena Mamani de Pérez',
                'telefono_emergencia' => '72033445',
                'parentesco_emergencia' => 'Madre',
                'estado_paciente' => 'activo',
                'estado_clinico' => 'en_tratamiento',
                'saldo_cuenta' => 120.00,
                'consentimiento_inicial' => [
                    'firmado' => true,
                    'fecha_hora' => '2026-02-15 09:30:00',
                    'tipo' => 'digital_formulario',
                    'reglamento_general_aceptado' => true,
                    'politica_privacidad_aceptada' => true,
                    'responsable_nombre' => 'Gabriela Morales',
                    'responsable_id' => $estudianteGabriela?->id,
                    'observaciones' => 'Consentimiento informado inicial firmado digitalmente en admisión de clínica.',
                ],
                'estudiante_asignado_id' => $estudianteGabriela?->id,
                'fecha_ultima_consulta' => now()->subDays(3),
                'motivo_ultima_consulta' => 'Control de obturación y destartraje completado.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente1->id],
            [
                'estudiante_registra_id' => $estudianteGabriela?->id,
                'docente_supervisor_id' => $docenteFernandez?->id,
                'alerta_alergia' => true,
                'motivo_consulta_paciente' => 'Doctora, me duele mucho la muela de abajo al tomar agua fría y siento que se me traba comida entre los dientes.',
                'antecedentes_odontologicos' => [
                    'frecuencia_visitas' => 'Cada 1 a 2 años o solo ante dolor agudo',
                    'experiencias_traumaticas' => 'Extracción dolorosa en la adolescencia por anestesia tardía',
                    'tratamientos_previos' => ['obturaciones_amalgama', 'profilaxis_anual'],
                    'sensibilidad_termica' => true,
                    'sangrado_cepillado' => true,
                ],
                'odontograma' => [
                    'dientes' => [
                        '46' => [
                            'caras' => ['oclusal' => 'obturacion_resina', 'mesial' => 'obturacion_resina', 'distal' => 'sano', 'vestibular' => 'sano', 'lingual' => 'sano'],
                            'general' => null,
                            'ultima_fecha' => '2026-03-25 15:00:00',
                        ],
                        '16' => [
                            'caras' => ['oclusal' => 'caries', 'mesial' => 'sano', 'distal' => 'sano', 'vestibular' => 'sano', 'palatino' => 'sano'],
                            'general' => null,
                            'ultima_fecha' => '2026-03-20 10:15:00',
                        ],
                        '21' => [
                            'caras' => ['mesial' => 'caries', 'distal' => 'sano', 'vestibular' => 'sano', 'palatino' => 'sano', 'oclusal' => 'sano'],
                            'general' => null,
                            'ultima_fecha' => '2026-03-20 10:18:00',
                        ],
                        '36' => [
                            'caras' => ['oclusal' => 'obturacion_amalgama', 'mesial' => 'sano', 'distal' => 'sano', 'vestibular' => 'sano', 'lingual' => 'sano'],
                            'general' => null,
                            'ultima_fecha' => '2025-08-10 11:00:00',
                        ],
                        '38' => [
                            'caras' => ['oclusal' => 'sano', 'mesial' => 'sano', 'distal' => 'sano', 'vestibular' => 'sano', 'lingual' => 'sano'],
                            'general' => 'ausente',
                            'ultima_fecha' => '2024-05-12 09:00:00',
                        ],
                    ],
                    'observaciones' => 'Higiene regular, cálculo subgingival en anteroinferiores, obturación estética reciente en 46.',
                ],
                'diagnosticos_codificados' => [
                    [
                        'id' => 'diag-1',
                        'codigo' => 'K02.1',
                        'estandar' => 'CIE-10',
                        'descripcion' => 'Caries de la dentina (cavitada)',
                        'pieza' => '16',
                        'tipo' => 'Dental / Cavitaria',
                        'prioridad' => 'Urgente',
                        'fecha_registro' => '2026-03-20',
                    ],
                    [
                        'id' => 'diag-2',
                        'codigo' => 'K02.0',
                        'estandar' => 'CIE-10',
                        'descripcion' => 'Caries limitada al esmalte (mancha blanca)',
                        'pieza' => '21',
                        'tipo' => 'Dental',
                        'prioridad' => 'Prioritario',
                        'fecha_registro' => '2026-03-20',
                    ],
                    [
                        'id' => 'diag-3',
                        'codigo' => 'K05.1',
                        'estandar' => 'CIE-10',
                        'descripcion' => 'Gingivitis crónica localizada / generalizada',
                        'pieza' => 'Generalizado',
                        'tipo' => 'Periodontal',
                        'prioridad' => 'Prioritario',
                        'fecha_registro' => '2026-03-20',
                    ],
                ],
                'plan_tratamiento_secuencia' => [
                    [
                        'id' => 'pdt-1',
                        'orden' => 1,
                        'procedimiento' => 'Profilaxis completa y destartraje supragingival con ultrasonido',
                        'pieza' => 'Todos',
                        'diagnostico_codigo' => 'K05.1 (Gingivitis crónica)',
                        'prioridad' => 'Prioritario',
                        'costo_estimado' => 70.00,
                        'estado' => 'Completado',
                        'notas' => 'Realizado con éxito en sesión 1.',
                    ],
                    [
                        'id' => 'pdt-2',
                        'orden' => 2,
                        'procedimiento' => 'Restauración con resina compuesta fotopolimerizable Clase II',
                        'pieza' => '46',
                        'diagnostico_codigo' => 'K02.1 (Caries dentina)',
                        'prioridad' => 'Urgente',
                        'costo_estimado' => 120.00,
                        'estado' => 'Completado',
                        'notas' => 'Obturación nanohíbrida 3M Z350.',
                    ],
                    [
                        'id' => 'pdt-3',
                        'orden' => 3,
                        'procedimiento' => 'Restauración con resina compuesta oclusal profunda',
                        'pieza' => '16',
                        'diagnostico_codigo' => 'K02.1 (Caries dentina)',
                        'prioridad' => 'Urgente',
                        'costo_estimado' => 110.00,
                        'estado' => 'En curso',
                        'notas' => 'Sesión programada para la siguiente semana.',
                    ],
                    [
                        'id' => 'pdt-4',
                        'orden' => 4,
                        'procedimiento' => 'Tratamiento remineralizante / microabrasión e infiltrante de resina',
                        'pieza' => '21',
                        'diagnostico_codigo' => 'K02.0 (Caries esmalte)',
                        'prioridad' => 'Electivo',
                        'costo_estimado' => 80.00,
                        'estado' => 'Propuesto',
                        'notas' => 'Estética de sector anterior.',
                    ],
                ],
                'odontologia_legal_forense' => [
                    'tatuajes_amalgama' => 'Leve pigmentación gingival por amalgama vestibular adyacente a pieza 36.',
                    'restauraciones_complejas' => 'Amalgama MOD antigua en pieza 36 con buen sellado marginal.',
                    'anomalias_morfologicas' => 'Cúspide de Carabelli prominente en pieza 16 y 26 bilateral.',
                    'observaciones_forenses' => 'Morfología dental pentagonal en molares inferiores, patrón rugoscópico palatino tipo bifurcado.',
                ],
                'patologicos_personales' => [
                    'estado_salud' => 'Aparente buen estado de salud general.',
                    'fecha_ultimo_examen_medico' => '2025-11-10',
                    'alergia_penicilina' => true,
                    'alergia_penicilina_obs' => 'Reacción urticariana y edema labial tras amoxicilina en 2021',
                    'alergia_anestesia' => false,
                    'alergia_aspirina' => false,
                    'alergia_yodo' => false,
                    'sangra_excesivamente' => false,
                    'tension_arterial' => false,
                    'diabetes' => false,
                    'intervencion_quirurgica' => true,
                    'quirurgica_obs' => 'Apendicectomía (2018)',
                ],
                'patologicos_familiares' => [
                    'diabetes' => true,
                    'diabetes_familiar' => 'Abuelo paterno',
                    'hipertension_arterial' => true,
                    'hipertension_familiar' => 'Madre (controlada con Enalapril)',
                ],
                'no_patologicos' => [
                    'consume_citricos' => true,
                    'tecnica_cepillado' => 'Bass modificada',
                    'veces_cepilla_dia' => '2 veces al día',
                    'elementos_higiene' => 'Cepillo de cerdas suaves e hilo dental esporádico',
                ],
                'examen_clinico_fisico' => [
                    'presion_arterial' => '120/80 mmHg',
                    'frecuencia_cardiaca' => '72 lpm',
                    'frecuencia_respiratoria' => '16 rpm',
                    'temperatura' => '36.5 °C',
                    'peso' => '70 kg',
                    'talla' => '1.72 m',
                    'imc' => '23.6 (Normal)',
                    'biotipo' => 'Mesomorfo',
                    'facies' => 'No característica, simétrica',
                ],
                'habitos' => [
                    'bruxismo' => false,
                    'onicofagia' => false,
                    'respirador_bucal' => false,
                    'fuma' => false,
                    'alcohol' => 'Ocasional social',
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p1-1',
                        'titulo' => 'Restauración Resina Nanohíbrida Clase II',
                        'pieza' => '46',
                        'especialidad' => 'Operatoria Dental',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p1-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(12)->format('Y-m-d'),
                                'hora' => '14:30',
                                'descripcion' => 'Anestesia infiltrativa troncular espina de Spix. Aislamiento absoluto con dique de goma y clamp 14A. Eliminación de caries amelodentinaria profunda en pieza 46 con fresa redonda de baja velocidad. Protección pulpar indirecta con hidróxido de calcio fraguable y base de ionómero de vidrio tipo base.',
                                'anestesia' => 'Mepivacaína 3% sin vasoconstrictor (1 cartucho)',
                                'materiales' => 'Dique de goma, clamp 14A, Dycal, Ionómero Ketac Molar 3M',
                                'indicaciones_paciente' => 'Dieta blanda por 24h. No ingerir alimentos calientes mientras dure la anestesia.',
                                'proxima_cita' => now()->subDays(5)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 95,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(12)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Buen aislamiento absoluto y cavidad limpia y conservadora.',
                                'evidencias' => [
                                    [
                                        'id' => 'evi-demo-1',
                                        'tipo' => 'foto',
                                        'titulo' => 'Foto intraoral pre-operatoria pieza 46 (Caries oclusal profunda)',
                                        'url' => 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
                                        'nombre_archivo' => 'foto_preoperatoria_46.jpg',
                                        'extension' => 'jpg',
                                        'tamano' => '1.8 MB',
                                        'fecha' => now()->subDays(12)->format('Y-m-d 14:35'),
                                        'subido_por' => 'Gabriela Morales',
                                    ],
                                    [
                                        'id' => 'evi-demo-2',
                                        'tipo' => 'radiografia',
                                        'titulo' => 'Radiografía periapical pre-operatoria pieza 46',
                                        'url' => 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
                                        'nombre_archivo' => 'rx_periapical_pieza_46.jpg',
                                        'extension' => 'jpg',
                                        'tamano' => '2.4 MB',
                                        'fecha' => now()->subDays(12)->format('Y-m-d 14:20'),
                                        'subido_por' => 'Gabriela Morales',
                                    ],
                                    [
                                        'id' => 'evi-demo-3',
                                        'tipo' => 'documento',
                                        'titulo' => 'Consentimiento Informado Firmado - Operatoria Dental',
                                        'url' => '/storage/documentos_ejemplo/consentimiento_informado_46.pdf',
                                        'nombre_archivo' => 'consentimiento_informado_46.pdf',
                                        'extension' => 'pdf',
                                        'tamano' => '320 KB',
                                        'fecha' => now()->subDays(12)->format('Y-m-d 14:15'),
                                        'subido_por' => 'Gabriela Morales',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'ses-p1-1-2',
                                'numero_sesion' => 2,
                                'fecha' => now()->subDays(5)->format('Y-m-d'),
                                'hora' => '15:00',
                                'descripcion' => 'Aislamiento absoluto con dique. Grabado ácido selectivo de esmalte por 15 segundos con ácido fosfórico 37%. Aplicación de adhesivo Single Bond Universal, fotopolimerización 20 seg. Estratificación por capas oblicuas de resina nanohíbrida Filtek Z350 tono A2. Fotopolimerización por incrementos de 2mm. Ajuste de oclusión en céntrica y desoclusión canina. Acabado y pulido con discos Sof-Lex y puntas siliconadas Enhance.',
                                'anestesia' => 'No requerida',
                                'materiales' => 'Ácido fosfórico 37%, Single Bond Universal, Resina Filtek Z350XT A2/A3, Discos Sof-Lex, pasta diamantada',
                                'indicaciones_paciente' => 'Evitar alimentos con pigmentos intensos (café, té, gaseosas oscuras) por 24 horas.',
                                'proxima_cita' => now()->addDays(7)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 98,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(5)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Excelente punto de contacto mesial y brillo superficial.',
                                'evidencias' => [
                                    [
                                        'id' => 'evi-demo-4',
                                        'tipo' => 'foto',
                                        'titulo' => 'Foto intraoral post-operatoria inmediata (Acabado y pulido oclusal)',
                                        'url' => 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
                                        'nombre_archivo' => 'resultado_postoperatorio_46.jpg',
                                        'extension' => 'jpg',
                                        'tamano' => '1.5 MB',
                                        'fecha' => now()->subDays(5)->format('Y-m-d 15:45'),
                                        'subido_por' => 'Gabriela Morales',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'trat-p1-2',
                        'titulo' => 'Destartraje y Terapia Básica Periodontal',
                        'pieza' => 'Boca completa',
                        'especialidad' => 'Periodoncia',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p1-2-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(3)->format('Y-m-d'),
                                'hora' => '16:00',
                                'descripcion' => 'Tartrectomía con insertos de ultrasonido piezoeléctrico en cuadrantes 1, 2, 3 y 4. Eliminación de depósitos duros de cálculo supragingival y subgingival superficial. Profilaxis con pasta abrasiva de grano medio y copa de goma profiláctica. Irrigación subgingival con clorhexidina 0.12%. Instrucción personalizada de técnica de Bass modificada y pase de hilo dental.',
                                'anestesia' => 'Anestésico tópico en gel (Benzocaína 20%)',
                                'materiales' => 'Ultrasonido Woodpecker, pasta profiláctica Nupro, escobillas Robinson, Clorhexidina 0.12%',
                                'indicaciones_paciente' => 'Enjuagues bucales con Clorhexidina al 0.12% cada 12 horas por 7 días. Cepillado suave.',
                                'proxima_cita' => now()->addDays(15)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 96,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(3)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Procedimiento atraumático, sin daño tisular. Buen control de sangrado.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'comentarios_docente' => 'Fases 1 y 2 de tratamiento concluidas satisfactoriamente con alta médica.',
                'fecha_aprobacion' => now()->subDays(3),
            ]
        );

        // =============================================================
        // PACIENTE 2: María René Flores Gutiérrez (Prótesis Fija & Rehabilitación)
        // =============================================================
        $paciente2 = Paciente::updateOrCreate(
            ['ci' => '6754321'],
            [
                'iup' => 'UNIFRANZ-2026-000002',
                'ci_expedido' => 'SC',
                'nombres' => 'María René',
                'apellido_paterno' => 'Flores',
                'apellido_materno' => 'Gutiérrez',
                'fecha_nacimiento' => '1968-08-23',
                'sexo' => 'F',
                'estado_civil' => 'Casada',
                'nacionalidad' => 'Boliviana',
                'ocupacion' => 'Docente Universitaria',
                'nivel_instruccion' => 'Maestría / Posgrado',
                'lugar_nacimiento' => 'Santa Cruz',
                'fuente_referencia' => 'Convenio Institucional Magisterio',
                'seguro_convenio' => 'Alianza Aseguradora Salud',
                'numero_poliza' => 'POL-ALI-99214',
                'direccion' => 'Calle 21 de Calacoto N° 8200',
                'telefono' => '2791450',
                'celular' => '77239011',
                'email' => 'maria.flores.doc@hotmail.com',
                'contacto_emergencia' => 'Jorge Mendoza (Esposo)',
                'telefono_emergencia' => '77341290',
                'parentesco_emergencia' => 'Esposo',
                'estado_paciente' => 'activo',
                'estado_clinico' => 'en_tratamiento',
                'saldo_cuenta' => 450.00,
                'consentimiento_inicial' => [
                    'firmado' => true,
                    'fecha_hora' => '2026-01-20 11:15:00',
                    'tipo' => 'digital_formulario',
                    'reglamento_general_aceptado' => true,
                    'politica_privacidad_aceptada' => true,
                    'responsable_nombre' => 'Gabriela Morales',
                    'responsable_id' => $estudianteGabriela?->id,
                    'observaciones' => 'Consentimiento informado inicial firmado digitalmente en módulo de admisión.',
                ],
                'estudiante_asignado_id' => $estudianteGabriela?->id,
                'fecha_ultima_consulta' => now()->subDays(2),
                'motivo_ultima_consulta' => 'Prueba de estructura metálica y colorímetro para corona metal-cerámica.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente2->id],
            [
                'estudiante_registra_id' => $estudianteGabriela?->id,
                'docente_supervisor_id' => $docenteMorales?->id,
                'alerta_hipertension' => true,
                'alerta_coagulacion' => true,
                'motivo_consulta_paciente' => 'Se me fracturó la corona de la muela derecha y no puedo masticar bien; además me sangran las encías al lavarme.',
                'antecedentes_odontologicos' => [
                    'frecuencia_visitas' => 'Cada 6 meses regularmente',
                    'experiencias_traumaticas' => 'Ninguna destacable',
                    'tratamientos_previos' => ['coronas_metal_porcelana', 'endodoncia_15', 'profilaxis'],
                    'sensibilidad_termica' => false,
                    'sangrado_cepillado' => true,
                ],
                'odontograma' => [
                    'dientes' => [
                        '15' => [
                            'caras' => ['oclusal' => 'corona', 'mesial' => 'sano', 'distal' => 'sano', 'vestibular' => 'sano', 'palatino' => 'sano'],
                            'general' => 'corona',
                            'ultima_fecha' => '2026-03-24 16:00:00',
                        ],
                        '16' => [
                            'caras' => ['oclusal' => 'fractura', 'mesial' => 'sano', 'distal' => 'fractura', 'vestibular' => 'sano', 'palatino' => 'sano'],
                            'general' => 'fractura',
                            'ultima_fecha' => '2026-03-24 16:15:00',
                        ],
                        '46' => [
                            'caras' => ['oclusal' => 'obturacion_resina', 'mesial' => 'sano', 'distal' => 'sano', 'vestibular' => 'sano', 'lingual' => 'sano'],
                            'general' => null,
                            'ultima_fecha' => '2025-10-14 09:30:00',
                        ],
                    ],
                    'observaciones' => 'Facetas de desgaste por bruxismo nocturno, periodonto reducido sano en anterosuperiores.',
                ],
                'diagnosticos_codificados' => [
                    [
                        'id' => 'diag-p2-1',
                        'codigo' => 'K04.0',
                        'estandar' => 'CIE-10',
                        'descripcion' => 'Pulpitis reversible / irreversible (Fractura coronal)',
                        'pieza' => '16',
                        'tipo' => 'Endodóntico / Protésico',
                        'prioridad' => 'Urgente',
                        'fecha_registro' => '2026-03-24',
                    ],
                    [
                        'id' => 'diag-p2-2',
                        'codigo' => 'CDT-D3330',
                        'estandar' => 'CDT-2',
                        'descripcion' => 'Tratamiento endodóntico (conducto) - Pieza molar',
                        'pieza' => '16',
                        'tipo' => 'Procedimiento',
                        'prioridad' => 'Urgente',
                        'fecha_registro' => '2026-03-24',
                    ],
                ],
                'plan_tratamiento_secuencia' => [
                    [
                        'id' => 'pdt-p2-1',
                        'orden' => 1,
                        'procedimiento' => 'Tratamiento de conducto radicular multirradicular pieza 16',
                        'pieza' => '16',
                        'diagnostico_codigo' => 'K04.0 (Pulpitis)',
                        'prioridad' => 'Urgente',
                        'costo_estimado' => 280.00,
                        'estado' => 'En curso',
                        'notas' => 'Conductometría completada, pendiente obturación.',
                    ],
                    [
                        'id' => 'pdt-p2-2',
                        'orden' => 2,
                        'procedimiento' => 'Perno colado / poste de fibra de vidrio y reconstrucción de muñón',
                        'pieza' => '16',
                        'diagnostico_codigo' => 'CDT-D3330',
                        'prioridad' => 'Prioritario',
                        'costo_estimado' => 150.00,
                        'estado' => 'Propuesto',
                        'notas' => 'Posterior a sellado endodóntico.',
                    ],
                    [
                        'id' => 'pdt-p2-3',
                        'orden' => 3,
                        'procedimiento' => 'Corona definitiva metal-porcelana sobre muñón',
                        'pieza' => '16',
                        'diagnostico_codigo' => 'K08.1',
                        'prioridad' => 'Prioritario',
                        'costo_estimado' => 450.00,
                        'estado' => 'Propuesto',
                        'notas' => 'Laboratorio dental asignado.',
                    ],
                ],
                'odontologia_legal_forense' => [
                    'tatuajes_amalgama' => 'Sin pigmentaciones observables.',
                    'restauraciones_complejas' => 'Corona metal-cerámica en 15 con margen subgingival vestibular.',
                    'anomalias_morfologicas' => 'Torus palatino plano de 1.5 cm en línea media.',
                    'observaciones_forenses' => 'Forma de arco ovoide superior, presencia de torus palatino.',
                ],
                'patologicos_personales' => [
                    'estado_salud' => 'Hipertensión arterial diagnosticada en 2019.',
                    'fecha_ultimo_examen_medico' => '2026-02-15',
                    'tension_arterial' => true,
                    'tension_arterial_tipo' => 'Hipertensión Grado 1 (Enalapril 10mg/día)',
                    'sangra_excesivamente' => true,
                    'sangrado_obs' => 'Tendencia a hemorragia gingival prolongada',
                    'toma_medicamentos' => true,
                    'medicamentos_obs' => 'Aspirina 100mg y Enalapril 10mg diarios',
                ],
                'patologicos_familiares' => [
                    'hipertension_arterial' => true,
                    'hipertension_familiar' => 'Ambos padres con antecedentes de cardiopatía hipertensiva',
                ],
                'no_patologicos' => [
                    'apretamiento_dentario' => true,
                    'apretamiento_obs' => 'Bruxismo céntrico y excéntrico nocturno con facetas de desgaste',
                ],
                'examen_clinico_fisico' => [
                    'presion_arterial' => '125/82 mmHg (controlada)',
                    'frecuencia_cardiaca' => '68 lpm',
                    'frecuencia_respiratoria' => '17 rpm',
                    'temperatura' => '36.4 °C',
                    'peso' => '64 kg',
                    'talla' => '1.58 m',
                ],
                'habitos' => [
                    'bruxismo' => true,
                    'apretamiento' => true,
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p2-1',
                        'titulo' => 'Corona Individual Metal-Porcelana',
                        'pieza' => '14',
                        'especialidad' => 'Prótesis Fija',
                        'estado_general' => 'EN_CURSO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p2-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(9)->format('Y-m-d'),
                                'hora' => '10:00',
                                'descripcion' => 'Toma de presión arterial previa: 124/80 mmHg. Anestesia infiltrativa sin vasoconstrictor (Mepivacaína 3%). Tallado biomecánico periférico con terminación en chaflán yuxtagingival de 1.2mm. Retracción gingival con hilo retractor Ultrapack #00. Confección y rebasado de corona provisional acrílica con resina Protemp 4, cementada con Temp-Bond NE.',
                                'anestesia' => 'Mepivacaína al 3% sin epinefrina (1.8 ml)',
                                'materiales' => 'Fresas diamantadas grano grueso y fino, hilo retractor Ultrapack, Protemp 4, Temp-Bond NE',
                                'indicaciones_paciente' => 'Evitar alimentos pegajosos o duros en hemiarcada superior derecha. Acudir si el provisorio se desaloja.',
                                'proxima_cita' => now()->subDays(2)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 94,
                                'docente_nombre' => 'Dra. Valeria Morales',
                                'fecha_firma' => now()->subDays(9)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Correcta conicidad axial de 6 grados y línea de terminación definida.',
                            ],
                            [
                                'id' => 'ses-p2-1-2',
                                'numero_sesion' => 2,
                                'fecha' => now()->subDays(2)->format('Y-m-d'),
                                'hora' => '11:00',
                                'descripcion' => 'Retiro de corona provisional y limpieza de residuos de cemento provisional. Prueba de estructura metálica (coping de Cr-Ni) en pieza 14: adaptación marginal verificada con sonda de exploración, asentamiento pasivo y espacio adecuado para porcelana (1.5mm oclusal y 1.2mm vestibular). Selección de color con guía Vita Classical: tono A3 en cervical y A2 en tercio medio e incisal. Re-cementado de provisorio con Temp-Bond.',
                                'anestesia' => 'No requerida',
                                'materiales' => 'Guía Vita Classical, silicona fluida de comprobación Fit-Checker GC, Temp-Bond',
                                'indicaciones_paciente' => 'Cita programada para prueba de bizcocho de porcelana.',
                                'proxima_cita' => now()->addDays(5)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 97,
                                'docente_nombre' => 'Dra. Valeria Morales',
                                'fecha_firma' => now()->subDays(2)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Adaptación marginal clínica óptima menor a 50 micras. Enviado a laboratorio para estratificación de cerámica.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'comentarios_docente' => 'Control hemodinámico riguroso en cada cita.',
                'fecha_aprobacion' => now()->subDays(2),
            ]
        );

        // =============================================================
        // PACIENTE 3: Luciana Belén Choque Vargas (Odontología Conservadora)
        // =============================================================
        $paciente3 = Paciente::updateOrCreate(
            ['ci' => '9812401'],
            [
                'ci_expedido' => 'LP',
                'nombres' => 'Luciana Belén',
                'apellido_paterno' => 'Choque',
                'apellido_materno' => 'Vargas',
                'fecha_nacimiento' => '2004-11-18',
                'sexo' => 'F',
                'estado_civil' => 'Soltera',
                'ocupacion' => 'Estudiante de Arquitectura',
                'lugar_nacimiento' => 'La Paz',
                'direccion' => 'Zona Miraflores, Calle Cuba N° 1204',
                'telefono' => '2221190',
                'celular' => '76298144',
                'contacto_emergencia' => 'Raúl Choque (Padre)',
                'telefono_emergencia' => '71190283',
                'parentesco_emergencia' => 'Padre',
                'estudiante_asignado_id' => $estudianteGabriela?->id,
                'fecha_ultima_consulta' => now()->subDays(1),
                'motivo_ultima_consulta' => 'Sellantes de fosas y fisuras en molares sanos.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente3->id],
            [
                'estudiante_registra_id' => $estudianteGabriela?->id,
                'docente_supervisor_id' => $docenteFernandez?->id,
                'patologicos_personales' => [
                    'estado_salud' => 'Sano, sin antecedentes médicos relevantes.',
                ],
                'no_patologicos' => [
                    'veces_cepilla_dia' => '2 veces al día',
                    'consumo_azucares' => 'Frecuente entre comidas',
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p3-1',
                        'titulo' => 'Sellantes Resinosos de Fosas y Fisuras',
                        'pieza' => '16, 26, 36, 46',
                        'especialidad' => 'Operatoria Preventiva',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p3-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(1)->format('Y-m-d'),
                                'hora' => '16:30',
                                'descripcion' => 'Aislamiento relativo con rollos de algodón y eyector de alta potencia. Profilaxis oclusal con piedra pómez y agua sin glicerina. Grabado ácido con ácido fosfórico 37% por 20 segundos. Lavado profuso y secado hasta obtener aspecto de tiza. Aplicación de sellante resinoso Clinpro 3M con cambio de color rosa a blanco. Fotopolimerización 20 segundos por pieza. Control con explorador de retención y control oclusal.',
                                'anestesia' => 'No requerida',
                                'materiales' => 'Piedra pómez, ácido fosfórico 37%, sellante Clinpro 3M, papel de articular Bausch',
                                'indicaciones_paciente' => 'Higiene dental reforzada con cepillado después de cada comida.',
                                'proxima_cita' => now()->addMonths(6)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 100,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(1)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Excelente técnica preventiva, sellado hermético verificado.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(1),
            ]
        );

        // =============================================================
        // PACIENTE 4: Roberto Carlos Miranda Soliz (Periodoncia Especializada)
        // =============================================================
        $paciente4 = Paciente::updateOrCreate(
            ['ci' => '5419823'],
            [
                'ci_expedido' => 'CB',
                'nombres' => 'Roberto Carlos',
                'apellido_paterno' => 'Miranda',
                'apellido_materno' => 'Soliz',
                'fecha_nacimiento' => '1981-06-03',
                'sexo' => 'M',
                'estado_civil' => 'Casado',
                'ocupacion' => 'Comerciante Mayorista',
                'lugar_nacimiento' => 'Cochabamba',
                'direccion' => 'Av. Buenos Aires N° 780, Zona El Tejar',
                'telefono' => '2489012',
                'celular' => '73091823',
                'contacto_emergencia' => 'Martha Soliz (Esposa)',
                'telefono_emergencia' => '71902834',
                'parentesco_emergencia' => 'Esposa',
                'estudiante_asignado_id' => $estudianteGabriela?->id,
                'fecha_ultima_consulta' => now()->subDays(6),
                'motivo_ultima_consulta' => 'Raspaje y alisado radicular a campo cerrado por cuadrantes.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente4->id],
            [
                'estudiante_registra_id' => $estudianteGabriela?->id,
                'docente_supervisor_id' => $docenteFernandez?->id,
                'alerta_alergia' => true,
                'patologicos_personales' => [
                    'alergia_aspirina' => true,
                    'alergia_aspirina_obs' => 'Broncoespasmo severo por Ácido Acetilsalicílico (AAS)',
                    'fumador' => true,
                    'cigarrillos_dia' => '10 cigarrillos al día desde hace 15 años',
                ],
                'no_patologicos' => [
                    'fuma' => true,
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p4-1',
                        'titulo' => 'Raspaje y Alisado Radicular Cuadrantes 1 y 4',
                        'pieza' => 'Cuadrantes 1 y 4',
                        'especialidad' => 'Periodoncia',
                        'estado_general' => 'EN_CURSO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p4-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(6)->format('Y-m-d'),
                                'hora' => '15:30',
                                'descripcion' => 'Anestesia infiltrativa con Mepivacaína 2% con epinefrina. Sondaje periodontal previo confirmó bolsas de 5 a 6mm en molares superiores e inferiores. Instrumentación con curetas Gracey específicas (1/2, 7/8, 11/12, 13/14). Debridamiento mecánico de bolsas periodontales y alisado de superficie radicular hasta notar superficie dura y suave al tacto. Irrigación profusa con suero fisiológico y clorhexidina al 0.12%.',
                                'anestesia' => 'Mepivacaína 2% con adrenalina 1:100.000 (2 carpules)',
                                'materiales' => 'Curetas Gracey Hu-Friedy, piedras de afilar Arkansas, clorhexidina al 0.12%',
                                'indicaciones_paciente' => 'Evitar fumar durante las primeras 48 horas. Paracetamol 500mg c/8h en caso de dolor. NO USAR ASPIRINA.',
                                'proxima_cita' => now()->addDays(8)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriela Morales',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 92,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(6)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Buen apoyo digital y angulación de corte en curetas Gracey.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'en_revision',
                'comentarios_docente' => 'Falta completar RAR en cuadrantes 2 y 3 en la próxima sesión.',
            ]
        );

        // =============================================================
        // PACIENTES 5 A 8 (Otros Estudiantes Operadores)
        // =============================================================

        // Paciente 5: Carmen Rosa Daza (Prótesis Total - Sofía Torrico)
        $paciente5 = Paciente::updateOrCreate(
            ['ci' => '3418902'],
            [
                'ci_expedido' => 'LP',
                'nombres' => 'Carmen Rosa',
                'apellido_paterno' => 'Daza',
                'apellido_materno' => 'Velásquez',
                'fecha_nacimiento' => '1963-02-14',
                'sexo' => 'F',
                'estado_civil' => 'Viuda',
                'ocupacion' => 'Jubilada',
                'lugar_nacimiento' => 'La Paz',
                'direccion' => 'Calle Sagárnaga N° 340',
                'celular' => '71982341',
                'contacto_emergencia' => 'Lorena Quiroga (Hija)',
                'telefono_emergencia' => '72093845',
                'parentesco_emergencia' => 'Hija',
                'estudiante_asignado_id' => $estudianteTorrico?->id,
                'fecha_ultima_consulta' => now()->subDays(3),
                'motivo_ultima_consulta' => 'Instalación y ajuste de oclusión de prótesis total superior e inferior.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente5->id],
            [
                'estudiante_registra_id' => $estudianteTorrico?->id,
                'docente_supervisor_id' => $docenteMorales?->id,
                'alerta_diabetes' => true,
                'patologicos_personales' => [
                    'diabetes' => true,
                    'diabetes_tipo' => 'Diabetes Mellitus Tipo 2 (Metformina 850mg c/12h)',
                    'glucemia_ayunas' => '115 mg/dl (controlada)',
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p5-1',
                        'titulo' => 'Prótesis Total Bimaxilar Acrílica',
                        'pieza' => 'Maxilar y Mandíbula',
                        'especialidad' => 'Prótesis Removible',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p5-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(15)->format('Y-m-d'),
                                'hora' => '09:00',
                                'descripcion' => 'Toma de impresión anatómica preliminar con alginato en cubetas tipo Rim-Lock. Vaciado en yeso piedra tipo III.',
                                'estudiante_nombre' => 'Sofía Valentina Torrico',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 95,
                                'docente_nombre' => 'Dra. Valeria Morales',
                                'fecha_firma' => now()->subDays(15)->format('Y-m-d H:i'),
                            ],
                            [
                                'id' => 'ses-p5-1-2',
                                'numero_sesion' => 2,
                                'fecha' => now()->subDays(8)->format('Y-m-d'),
                                'hora' => '10:00',
                                'descripcion' => 'Registro de relación céntrica y dimensión vertical oclusal con rodetes de cera. Selección de dientes acrílicos New Hue tono 66.',
                                'estudiante_nombre' => 'Sofía Valentina Torrico',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 97,
                                'docente_nombre' => 'Dra. Valeria Morales',
                                'fecha_firma' => now()->subDays(8)->format('Y-m-d H:i'),
                            ],
                            [
                                'id' => 'ses-p5-1-3',
                                'numero_sesion' => 3,
                                'fecha' => now()->subDays(3)->format('Y-m-d'),
                                'hora' => '11:00',
                                'descripcion' => 'Inserción de prótesis total superior e inferior terminadas en acrílico termopolimerizable. Verificación de retención, soporte y estabilidad. Control con pasta reveladora de presión y papel de articular. Instrucción de higiene de prótesis.',
                                'estudiante_nombre' => 'Sofía Valentina Torrico',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 98,
                                'docente_nombre' => 'Dra. Valeria Morales',
                                'fecha_firma' => now()->subDays(3)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Excelente retención periférica y estética facial rejuvenecida.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(3),
            ]
        );

        // Paciente 6: Jorge Antonio Medina (Cirugía Tercer Molar - Alejandro Siles)
        $paciente6 = Paciente::updateOrCreate(
            ['ci' => '7129480'],
            [
                'ci_expedido' => 'SC',
                'nombres' => 'Jorge Antonio',
                'apellido_paterno' => 'Medina',
                'apellido_materno' => 'Prado',
                'fecha_nacimiento' => '1987-10-09',
                'sexo' => 'M',
                'estado_civil' => 'Soltero',
                'ocupacion' => 'Ingeniero Comercial',
                'lugar_nacimiento' => 'Santa Cruz',
                'direccion' => 'Av. Busch N° 1450',
                'celular' => '77312984',
                'contacto_emergencia' => 'Claudia Medina (Hermana)',
                'telefono_emergencia' => '77123984',
                'parentesco_emergencia' => 'Hermana',
                'estudiante_asignado_id' => $estudianteSiles?->id,
                'fecha_ultima_consulta' => now()->subDays(5),
                'motivo_ultima_consulta' => 'Odontectomía quirúrgica de tercer molar inferior 38.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente6->id],
            [
                'estudiante_registra_id' => $estudianteSiles?->id,
                'docente_supervisor_id' => $docenteFernandez?->id,
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p6-1',
                        'titulo' => 'Odontectomía Quirúrgica de Tercer Molar 38 Retenido',
                        'pieza' => '38',
                        'especialidad' => 'Cirugía Bucal',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p6-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(5)->format('Y-m-d'),
                                'hora' => '14:00',
                                'descripcion' => 'Asepsia y antisepsia de campo operatorio. Anestesia troncular al nervio dentario inferior y lingual con Lidocaína 2% con epinefrina. Incisión mucoperióstica con descarga vestibular en distal de 37. Desprendimiento de colgajo de espesor total con periostotomo de Molt. Ostectomía vestibular y distal con fresa quirúrgica Zekrya y pieza de mano recta bajo irrigación profusa con solución salina estéril. Odontosección coronorradicular. Luxación y avulsión de fragmentos con elevador recto fino. Curetaje de lecho alveolar y lavado con suero fisiológico. Sutura con hilo de seda negra 3-0 a puntos simples interrumpidos.',
                                'anestesia' => 'Lidocaína 2% con epinefrina 1:100.000 (3 carpules)',
                                'materiales' => 'Bisturí #15, periostotomo Molt, fresa Zekrya, pinzas gubia, sutura seda 3-0',
                                'indicaciones_paciente' => 'Hielo local las primeras 24h. Amoxicilina 500mg c/8h por 7 días, Ibuprofeno 600mg c/8h por 3 días. Dieta blanda fría. Retiro de puntos en 7 días.',
                                'proxima_cita' => now()->addDays(2)->format('Y-m-d'),
                                'estudiante_nombre' => 'Alejandro Siles',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 96,
                                'docente_nombre' => 'Dr. Roberto Fernández',
                                'fecha_firma' => now()->subDays(5)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Cirugía limpia, preservación adecuada de cortical lingual.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(5),
            ]
        );

        // Paciente 7: Valeria Méndez (Endodoncia - Gabriel Mercado)
        $paciente7 = Paciente::updateOrCreate(
            ['ci' => '8901234'],
            [
                'ci_expedido' => 'TJ',
                'nombres' => 'Valeria Alejandra',
                'apellido_paterno' => 'Méndez',
                'apellido_materno' => 'Soruco',
                'fecha_nacimiento' => '2001-09-15',
                'sexo' => 'F',
                'estado_civil' => 'Soltera',
                'ocupacion' => 'Diseñadora Gráfica',
                'lugar_nacimiento' => 'Tarija',
                'direccion' => 'Calle Villalobos N° 890, Miraflores',
                'celular' => '79812401',
                'contacto_emergencia' => 'Silvia Soruco (Madre)',
                'telefono_emergencia' => '79012384',
                'parentesco_emergencia' => 'Madre',
                'estudiante_asignado_id' => $estudianteMercado?->id,
                'fecha_ultima_consulta' => now()->subDays(2),
                'motivo_ultima_consulta' => 'Endodoncia unirradicular pieza 21 por traumatismo dentario.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente7->id],
            [
                'estudiante_registra_id' => $estudianteMercado?->id,
                'docente_supervisor_id' => $docenteSalazar?->id,
                'alerta_alergia' => true,
                'patologicos_personales' => [
                    'alergia_yodo' => true,
                    'alergia_yodo_obs' => 'Dermatitis por contacto con antisépticos yodados',
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p7-1',
                        'titulo' => 'Endodoncia Unirradicular Necropulpectomía',
                        'pieza' => '21',
                        'especialidad' => 'Endodoncia',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p7-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(8)->format('Y-m-d'),
                                'hora' => '11:00',
                                'descripcion' => 'Aislamiento absoluto con dique de goma y clamp 211. Apertura cameral palatina con fresa redonda #4 y fresa Endo-Z. Conductometría electrónica con localizador apical Woodpex V verificada radiográficamente en 22.5mm. Instrumentación rotatoria con sistema WaveOne Gold Primary (25/.07) bajo irrigación continua con Hipoclorito de Sodio al 2.5% y EDTA al 17%. Secado de conducto y medicación intraconducto con pasta de Hidróxido de Calcio UltraCal XS. Sellado provisional con Coltosol.',
                                'anestesia' => 'Articaína 4% con epinefrina 1:100.000',
                                'materiales' => 'Limas WaveOne Gold, NaOCl 2.5%, EDTA 17%, UltraCal XS, Coltosol',
                                'indicaciones_paciente' => 'No masticar sobre el incisivo superior. Ibuprofeno 400mg si hay dolor periapical leve.',
                                'proxima_cita' => now()->subDays(2)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriel Mercado',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 97,
                                'docente_nombre' => 'Dr. Rodrigo Salazar',
                                'fecha_firma' => now()->subDays(8)->format('Y-m-d H:i'),
                            ],
                            [
                                'id' => 'ses-p7-1-2',
                                'numero_sesion' => 2,
                                'fecha' => now()->subDays(2)->format('Y-m-d'),
                                'hora' => '11:30',
                                'descripcion' => 'Retiro de sellado provisional bajo dique de goma. Irrigación final ultrasónica pasiva con EDTA al 17% y NaOCl. Secado con conos de papel estéril. Prueba de cono maestro de gutapercha WaveOne Gold 25/.07 con trabamiento apical (tug-back) verificado con radiografía de conometría. Obturación termoplastificada mediante técnica de condensación continua con cemento sellador biocerámico TotalFill BC Sealer. Corte de gutapercha a nivel cameral y sellado coronario con ionómero de vidrio resinoso. Radiografía final de obturación confirma sellado tridimensional hermético hasta longitud de trabajo.',
                                'anestesia' => 'No requerida',
                                'materiales' => 'Conos WaveOne Gold 25/.07, TotalFill BC Sealer, sistema de calor Calamus Dentsply, Ionómero Vitrebond',
                                'indicaciones_paciente' => 'Programar restauración estética definitiva con resina en sector palatino.',
                                'proxima_cita' => now()->addDays(14)->format('Y-m-d'),
                                'estudiante_nombre' => 'Gabriel Mercado',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 100,
                                'docente_nombre' => 'Dr. Rodrigo Salazar',
                                'fecha_firma' => now()->subDays(2)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Obturación endodóntica impecable con sellador biocerámico.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(2),
            ]
        );

        // Paciente 8: Benjamín Morales (Odontopediatría - Camila Beltrán)
        $paciente8 = Paciente::updateOrCreate(
            ['ci' => '10293847'],
            [
                'ci_expedido' => 'LP',
                'nombres' => 'Benjamín Ignacio',
                'apellido_paterno' => 'Morales',
                'apellido_materno' => 'Calle',
                'fecha_nacimiento' => '2018-03-20',
                'sexo' => 'M',
                'estado_civil' => 'Soltero',
                'ocupacion' => 'Estudiante de Primaria (8 años)',
                'lugar_nacimiento' => 'La Paz',
                'direccion' => 'Calle 8 de Obrajes N° 340',
                'celular' => '72091823',
                'contacto_emergencia' => 'Carla Calle de Morales (Madre)',
                'telefono_emergencia' => '72091823',
                'parentesco_emergencia' => 'Madre',
                'estudiante_asignado_id' => $estudianteBeltran?->id,
                'fecha_ultima_consulta' => now()->subDays(1),
                'motivo_ultima_consulta' => 'Pulpotomía y corona preformada de acero en molar deciduo 75.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente8->id],
            [
                'estudiante_registra_id' => $estudianteBeltran?->id,
                'docente_supervisor_id' => $docenteSalazar?->id,
                'historia_odontopediatrica' => [
                    'comportamiento_frankl' => 'Frankl III (Positivo colaborativo)',
                    'lactancia_materna_meses' => '18 meses',
                    'biberon_nocturno' => 'Hasta los 3 años con azúcar',
                    'habitos' => ['succion_digital' => false, 'deglucion_atipica' => false],
                ],
                'procedimientos_tratamientos' => [
                    [
                        'id' => 'trat-p8-1',
                        'titulo' => 'Pulpotomía Vital y Corona de Acero Inoxidable',
                        'pieza' => '75',
                        'especialidad' => 'Odontopediatría',
                        'estado_general' => 'FINALIZADO',
                        'sesiones' => [
                            [
                                'id' => 'ses-p8-1-1',
                                'numero_sesion' => 1,
                                'fecha' => now()->subDays(1)->format('Y-m-d'),
                                'hora' => '10:30',
                                'descripcion' => 'Manejo conductual con técnica Decir-Mostrar-Hacer. Anestesia infiltrativa mandibular con Mepivacaína al 3%. Aislamiento absoluto con dique de goma pediátrico. Apertura cameral y remoción de pulpa coronal con cucharilla de dentina afilada. Hemostasia lograda con torunda de algodón estéril y sulfato férrico al 15.5% por 15 segundos. Colocación de base de óxido de zinc-eugenol reforzado (IRM). Desgaste oclusal de 1.5mm y proximal de la pieza 75. Selección, adaptación y festoneado de corona preformada de acero inoxidable 3M tamaño 4. Cementación definitiva con ionómero de vidrio tipo I (Ketac Cem). Limpieza de excesos con hilo dental.',
                                'anestesia' => 'Mepivacaína al 3% sin vasoconstrictor (1 carpule pediátrico)',
                                'materiales' => 'Dique de goma, Sulfato férrico ViscoStat, IRM Dentsply, Coronas 3M ESPE, Ketac Cem',
                                'indicaciones_paciente' => 'No masticar goma de mascar ni caramelos pegajosos. Dieta blanda. Felicitación y refuerzo positivo al niño.',
                                'proxima_cita' => now()->addMonths(3)->format('Y-m-d'),
                                'estudiante_nombre' => 'Camila Andrea Beltrán',
                                'estado_academico' => 'aprobado',
                                'calificacion' => 98,
                                'docente_nombre' => 'Dr. Rodrigo Salazar',
                                'fecha_firma' => now()->subDays(1)->format('Y-m-d H:i'),
                                'observaciones_docente' => 'Excelente manejo de la conducta infantil y correcta adaptación de la corona.',
                            ],
                        ],
                    ],
                ],
                'estado_revision' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(1),
            ]
        );

        // =============================================================
        // PACIENTES 9 A 12 (Sin Asignar - Casos de Admisión & Triaje)
        // =============================================================
        $paciente9 = Paciente::updateOrCreate(
            ['ci' => '4509128'],
            [
                'ci_expedido' => 'BE',
                'nombres' => 'Walter Hernán',
                'apellido_paterno' => 'Claure',
                'apellido_materno' => 'Ribera',
                'fecha_nacimiento' => '1974-12-05',
                'sexo' => 'M',
                'estado_civil' => 'Casado',
                'ocupacion' => 'Ganadero / Transportista',
                'lugar_nacimiento' => 'Trinidad, Beni',
                'direccion' => 'Zona Río Seco N° 451, El Alto',
                'celular' => '73901845',
                'contacto_emergencia' => 'Marlene Ribera (Esposa)',
                'telefono_emergencia' => '71190283',
                'parentesco_emergencia' => 'Esposa',
                'estudiante_asignado_id' => null,
                'fecha_ultima_consulta' => now(),
                'motivo_ultima_consulta' => 'Dolor pulsátil intenso en molar inferior izquierdo. Requiere operador.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente9->id],
            [
                'patologicos_personales' => [
                    'estado_salud' => 'Dolor agudo por caries penetrante en pieza 36',
                    'alergia_penicilina' => false,
                ],
                'estado_revision' => 'borrador',
            ]
        );

        $paciente10 = Paciente::updateOrCreate(
            ['ci' => '9283741'],
            [
                'ci_expedido' => 'SC',
                'nombres' => 'Andrea Paola',
                'apellido_paterno' => 'Justiniano',
                'apellido_materno' => 'Saucedo',
                'fecha_nacimiento' => '1998-05-28',
                'sexo' => 'F',
                'estado_civil' => 'Soltera',
                'ocupacion' => 'Asesora Financiera',
                'lugar_nacimiento' => 'Santa Cruz',
                'direccion' => 'Sopocachi, Calle Guachalla N° 340',
                'celular' => '78291045',
                'contacto_emergencia' => 'Karla Justiniano (Hermana)',
                'telefono_emergencia' => '78019284',
                'parentesco_emergencia' => 'Hermana',
                'estudiante_asignado_id' => null,
                'fecha_ultima_consulta' => now()->subDays(1),
                'motivo_ultima_consulta' => 'Blanqueamiento dental y carillas de resina compuesta en sector anterior.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente10->id],
            [
                'patologicos_personales' => ['estado_salud' => 'Sano'],
                'estado_revision' => 'borrador',
            ]
        );

        $paciente11 = Paciente::updateOrCreate(
            ['ci' => '2390184'],
            [
                'ci_expedido' => 'OR',
                'nombres' => 'Raúl Ernesto',
                'apellido_paterno' => 'Benavides',
                'apellido_materno' => 'Pinto',
                'fecha_nacimiento' => '1959-07-17',
                'sexo' => 'M',
                'estado_civil' => 'Casado',
                'ocupacion' => 'Jubilado Minero',
                'lugar_nacimiento' => 'Oruro',
                'direccion' => 'Villa Fátima, Av. Las Américas N° 980',
                'celular' => '71567890',
                'contacto_emergencia' => 'Carlos Benavides (Hijo)',
                'telefono_emergencia' => '72091834',
                'parentesco_emergencia' => 'Hijo',
                'estudiante_asignado_id' => null,
                'fecha_ultima_consulta' => now()->subDays(3),
                'motivo_ultima_consulta' => 'Desdentado parcial superior e inferior Kennedy Clase I.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente11->id],
            [
                'patologicos_personales' => ['enfermedad_pulmonar' => 'Neumoconiosis leve controlada'],
                'estado_revision' => 'borrador',
            ]
        );

        $paciente12 = Paciente::updateOrCreate(
            ['ci' => '9912048'],
            [
                'ci_expedido' => 'LP',
                'nombres' => 'Nicole Stephany',
                'apellido_paterno' => 'Romero',
                'apellido_materno' => 'Aguilar',
                'fecha_nacimiento' => '2003-01-25',
                'sexo' => 'F',
                'estado_civil' => 'Unión Libre',
                'ocupacion' => 'Comerciante',
                'lugar_nacimiento' => 'La Paz',
                'direccion' => 'Zona Achumani, Calle 22 N° 45',
                'celular' => '76540918',
                'contacto_emergencia' => 'David Mamani (Pareja)',
                'telefono_emergencia' => '76290184',
                'parentesco_emergencia' => 'Pareja',
                'estudiante_asignado_id' => null,
                'fecha_ultima_consulta' => now(),
                'motivo_ultima_consulta' => 'Gingivitis del embarazo y sangrado profuso. Requiere profilaxis de 2do trimestre.',
                'inasistencias_acumuladas' => 0,
                'alerta_abandono' => false,
                'activo' => true,
            ]
        );

        AntecedenteMedico::updateOrCreate(
            ['paciente_id' => $paciente12->id],
            [
                'alerta_embarazo' => true,
                'ginecologicos' => [
                    'posibilidad_embarazo' => true,
                    'embarazo_meses' => '5',
                    'embarazo_obs' => 'Segundo trimestre gestacional. Evitar radiografías y fármacos teratogénicos.',
                ],
                'patologicos_personales' => [
                    'sangra_excesivamente' => true,
                    'sangrado_obs' => 'Granuloma piogénico gravídico incipiente en papila de 11-21',
                ],
                'estado_revision' => 'borrador',
            ]
        );

        // =============================================================
        // HISTORIAS CLÍNICAS HC-001 COMPLETAS
        // =============================================================
        $historia1 = HistoriaClinica::updateOrCreate(
            ['numero_expediente' => 'HC-001-2026-0001'],
            [
                'paciente_id' => $paciente1->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'motivo_consulta' => 'Molestia en molar inferior derecho al masticar y sangrado de encías durante el cepillado.',
                'enfermedad_actual' => 'Cuadro de evolución de 3 semanas caracterizado por dolor provocado térmico en pieza 46 y gingivorragia difusa.',
                'signos_vitales' => [
                    'temperatura_c' => '36.5',
                    'presion_arterial' => '120/80',
                    'pulso' => '74',
                    'frecuencia_respiratoria' => '16',
                    'peso_kg' => '70',
                    'talla_m' => '1.72',
                    'estado_general' => 'Bueno',
                    'estado_nutricional' => 'Normopeso',
                    'estado_hidratacion' => 'Hidratado',
                    'consciencia' => 'Lúcido, orientado en T-E-P',
                ],
                'examen_estomatologico' => [
                    'craneo' => 'Mesocéfalo',
                    'cara_simetria' => 'Simétrica',
                    'perfil' => 'Recto',
                    'labios' => 'Medianos, hidratados, competentes',
                    'carrillos' => 'Rosados, línea alba normal bilateral',
                    'paladar' => 'Paladar duro profundo, color normal',
                    'lengua' => 'Papilada, móvil, sin alteraciones',
                    'piso_boca' => 'Sin induraciones, carúnculas salivales permeables',
                    'encias' => 'Encía marginal eritematosa en zona anteroinferior',
                    'atm' => [
                        'apertura' => '42 mm normal',
                        'chasquidos' => false,
                        'dolor' => false,
                        'desviacion' => false,
                    ],
                    'oclusion' => 'Clase I de Angle bilateral',
                ],
                'diagnostico_presuntivo' => 'Caries dental profunda en pieza 46 y Gingivitis inducida por placa.',
                'diagnostico_definitivo' => 'Pulpitis reversible en pieza 46 y Gingivitis marginal localizada.',
                'pronostico' => 'Favorable con tratamiento oportuno.',
                'plan_tratamiento' => "1. Profilaxis dental y destartraje ultrasónico.\n2. Apertura y eliminación de caries en pieza 46.\n3. Restauración con resina compuesta fotopolimerizable.\n4. Control a los 15 días.",
                'estado' => 'aprobada',
                'fecha_aprobacion' => now()->subDays(4),
                'observaciones_docente' => 'Autorizada para inicio de fases clínicas.',
            ]
        );

        $historia2 = HistoriaClinica::updateOrCreate(
            ['numero_expediente' => 'HC-001-2026-0002'],
            [
                'paciente_id' => $paciente2->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteMorales->id,
                'motivo_consulta' => 'Rehabilitación estética y funcional por ausencia de piezas dentarias posteriores y fractura coronaria.',
                'enfermedad_actual' => 'Pérdida de piezas dentarias hace 2 años con dificultad masticatoria progresiva y desgaste en bordes incisales.',
                'signos_vitales' => [
                    'temperatura_c' => '36.4',
                    'presion_arterial' => '125/80',
                    'pulso' => '72',
                    'frecuencia_respiratoria' => '17',
                    'peso_kg' => '65',
                    'talla_m' => '1.60',
                    'estado_general' => 'Bueno',
                    'consciencia' => 'Lúcida y orientada en tiempo y espacio',
                ],
                'examen_estomatologico' => [
                    'craneo' => 'Braquicéfalo',
                    'cara_simetria' => 'Simétrica',
                    'perfil' => 'Ligeramente convexo',
                    'atm' => ['apertura' => '40 mm', 'chasquidos' => true, 'lado_chasquido' => 'Izquierdo'],
                ],
                'diagnostico_definitivo' => 'Edentulismo parcial maxilar superior e inferior Kennedy Clase II Subclase 1.',
                'pronostico' => 'Favorable con prótesis fija y férula miorrelajante nocturna.',
                'plan_tratamiento' => "1. Corona metal-cerámica en pieza 14.\n2. Reconstrucción con poste de fibra de vidrio en pieza 15.\n3. Férula oclusal para bruxismo.",
                'estado' => 'aprobada',
                'fecha_aprobacion' => now()->subDays(2),
                'observaciones_docente' => 'Plan protésico validado.',
            ]
        );

        $historia3 = HistoriaClinica::updateOrCreate(
            ['numero_expediente' => 'HC-001-2026-0003'],
            [
                'paciente_id' => $paciente3->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'motivo_consulta' => 'Evaluación preventiva y sellantes.',
                'enfermedad_actual' => 'Paciente asintomática acude a control odontológico semestral.',
                'signos_vitales' => [
                    'temperatura_c' => '36.3',
                    'presion_arterial' => '110/70',
                    'pulso' => '70',
                    'frecuencia_respiratoria' => '16',
                ],
                'diagnostico_definitivo' => 'Fosas y fisuras profundas de alto riesgo cariogénico.',
                'pronostico' => 'Excelente.',
                'plan_tratamiento' => 'Sellantes de fosas en 16, 26, 36, 46 y aplicación tópica de flúor barniz.',
                'estado' => 'aprobada',
                'fecha_aprobacion' => now()->subDays(1),
            ]
        );

        $historia4 = HistoriaClinica::updateOrCreate(
            ['numero_expediente' => 'HC-001-2026-0004'],
            [
                'paciente_id' => $paciente4->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'motivo_consulta' => 'Movilidad dental incipiente y sangrado espontáneo de encías.',
                'enfermedad_actual' => 'Evolución de 6 meses con pérdida de soporte óseo y halitosis.',
                'signos_vitales' => [
                    'temperatura_c' => '36.6',
                    'presion_arterial' => '130/85',
                    'pulso' => '78',
                    'frecuencia_respiratoria' => '18',
                ],
                'diagnostico_definitivo' => 'Periodontitis Estadio II Grado B generalizada.',
                'pronostico' => 'Moderado condicionado a cesación tabáquica.',
                'plan_tratamiento' => 'Terapia periodontal básica completa con raspaje y alisado radicular en 4 cuadrantes.',
                'estado' => 'en_revision',
            ]
        );

        $historia7 = HistoriaClinica::updateOrCreate(
            ['numero_expediente' => 'HC-001-2026-0007'],
            [
                'paciente_id' => $paciente7->id,
                'estudiante_id' => $estudianteMercado->id,
                'docente_supervisor_id' => $docenteSalazar->id,
                'motivo_consulta' => 'Cambio de coloración oscura en diente frontal tras golpe.',
                'enfermedad_actual' => 'Traumatismo frontal hace 4 meses jugando básquetbol con discromía progresiva en pieza 21.',
                'signos_vitales' => [
                    'temperatura_c' => '36.5',
                    'presion_arterial' => '115/75',
                    'pulso' => '68',
                ],
                'diagnostico_definitivo' => 'Necrosis pulpar aséptica en pieza 21.',
                'pronostico' => 'Muy Favorable.',
                'plan_tratamiento' => "1. Tratamiento de conducto radicular (necropulpectomía).\n2. Blanqueamiento interno no vital.\n3. Restauración con resina compuesta.",
                'estado' => 'aprobada',
                'fecha_aprobacion' => now()->subDays(2),
            ]
        );

        // =============================================================
        // ODONTOGRAMAS
        // =============================================================
        Odontograma::updateOrCreate(
            ['historia_clinica_id' => $historia1->id, 'version' => 1],
            [
                'paciente_id' => $paciente1->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'tipo' => 'inicial',
                'hallazgos_piezas' => [
                    '18' => ['estado' => 'sano', 'caras' => []],
                    '16' => ['estado' => 'obturado', 'caras' => ['oclusal' => 'amalgama_buen_estado']],
                    '21' => ['estado' => 'sano', 'caras' => []],
                    '26' => ['estado' => 'cariado', 'caras' => ['oclusal' => 'caries_esmalte']],
                    '36' => ['estado' => 'sano', 'caras' => []],
                    '46' => ['estado' => 'obturado', 'caras' => ['oclusal' => 'resina_fotopolimerizable', 'mesial' => 'resina_fotopolimerizable']],
                    '48' => ['estado' => 'ausente', 'caras' => []],
                ],
                'especificaciones' => 'Odontograma actualizado con obturación resina en 46. Pieza 26 para siguiente sesión.',
                'estado_aprobacion' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(4),
                'comentarios_docente' => 'Excelente sellado marginal en resina de 46.',
            ]
        );

        Odontograma::updateOrCreate(
            ['historia_clinica_id' => $historia2->id, 'version' => 1],
            [
                'paciente_id' => $paciente2->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteMorales->id,
                'tipo' => 'inicial',
                'hallazgos_piezas' => [
                    '14' => ['estado' => 'provisorio', 'caras' => ['oclusal' => 'corona_provisoria']],
                    '15' => ['estado' => 'desgaste', 'caras' => ['oclusal' => 'atricion']],
                    '16' => ['estado' => 'ausente', 'caras' => []],
                    '26' => ['estado' => 'ausente', 'caras' => []],
                    '36' => ['estado' => 'obturado', 'caras' => ['oclusal' => 'amalgama']],
                    '46' => ['estado' => 'ausente', 'caras' => []],
                ],
                'especificaciones' => 'Odontograma protésico para confección de corona en 14 y diseño de prótesis removible.',
                'estado_aprobacion' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(2),
            ]
        );

        // =============================================================
        // PERIODONTOGRAMAS
        // =============================================================
        Periodontograma::updateOrCreate(
            ['historia_clinica_id' => $historia1->id, 'version' => 1],
            [
                'paciente_id' => $paciente1->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'mediciones_periodontales' => [
                    'cuadrante_1' => [
                        '16' => ['sondaje_vestibular' => [3, 2, 3], 'margen_vestibular' => [0, 0, 0], 'sangrado' => false],
                        '11' => ['sondaje_vestibular' => [2, 2, 2], 'margen_vestibular' => [0, 0, 0], 'sangrado' => false],
                    ],
                    'cuadrante_4' => [
                        '46' => ['sondaje_vestibular' => [3, 2, 3], 'margen_vestibular' => [0, 0, 0], 'sangrado' => false],
                        '41' => ['sondaje_vestibular' => [2, 2, 2], 'margen_vestibular' => [0, 0, 0], 'sangrado' => false],
                    ],
                ],
                'indice_placa_porcentaje' => 12.00,
                'indice_sangrado_porcentaje' => 6.50,
                'diagnostico_periodontal' => 'Periodonto clínicamente sano tras destartraje y profilaxis.',
                'pronostico_periodontal' => 'Muy Favorable.',
                'estado_aprobacion' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(3),
                'comentarios_docente' => 'Índices óptimos alcanzados.',
            ]
        );

        Periodontograma::updateOrCreate(
            ['historia_clinica_id' => $historia4->id, 'version' => 1],
            [
                'paciente_id' => $paciente4->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'mediciones_periodontales' => [
                    'cuadrante_1' => [
                        '16' => ['sondaje_vestibular' => [5, 4, 6], 'margen_vestibular' => [1, 0, 2], 'sangrado' => true],
                        '11' => ['sondaje_vestibular' => [3, 3, 4], 'margen_vestibular' => [0, 0, 1], 'sangrado' => true],
                    ],
                    'cuadrante_3' => [
                        '36' => ['sondaje_vestibular' => [6, 4, 5], 'margen_vestibular' => [2, 1, 2], 'sangrado' => true],
                    ],
                ],
                'indice_placa_porcentaje' => 48.00,
                'indice_sangrado_porcentaje' => 36.00,
                'diagnostico_periodontal' => 'Periodontitis Estadio II Grado B en fumador moderado.',
                'pronostico_periodontal' => 'Reservado condicionado a cesación tabáquica.',
                'estado_aprobacion' => 'aprobado',
                'fecha_aprobacion' => now()->subDays(6),
            ]
        );

        // =============================================================
        // PLANES DE TRATAMIENTO Y FASES
        // =============================================================
        $plan1 = PlanTratamiento::updateOrCreate(
            ['historia_clinica_id' => $historia1->id],
            [
                'paciente_id' => $paciente1->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteFernandez->id,
                'titulo' => 'Plan Integral de Operatoria y Periodoncia',
                'descripcion' => 'Profilaxis, destartraje y restauración con resina compuesta en piezas 46 y 26.',
                'costo_total_estimado' => 450.00,
                'estado' => 'aprobado_docente',
                'fecha_aprobacion_docente' => now()->subDays(4),
                'observaciones_docente' => 'Plan integral validado.',
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan1->id, 'numero_fase' => 1],
            [
                'nombre_fase' => 'Fase 1: Higiene y Destartraje',
                'procedimiento' => 'Eliminación de placa bacteriana, cálculo supragingival y pulido coronario.',
                'pieza_fdi' => null,
                'estado' => 'aprobado_docente',
                'calificacion' => 96,
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan1->id, 'numero_fase' => 2],
            [
                'nombre_fase' => 'Fase 2: Restauración Resina Compuesta 46',
                'procedimiento' => 'Remoción de caries oclusal y mesial en pieza 46 con grabado selectivo y resina nanohíbrida.',
                'pieza_fdi' => 46,
                'estado' => 'aprobado_docente',
                'calificacion' => 98,
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan1->id, 'numero_fase' => 3],
            [
                'nombre_fase' => 'Fase 3: Restauración Resina Pieza 26',
                'procedimiento' => 'Apertura y restauración oclusal con resina en pieza 26.',
                'pieza_fdi' => 26,
                'estado' => 'en_ejecucion',
            ]
        );

        $plan2 = PlanTratamiento::updateOrCreate(
            ['historia_clinica_id' => $historia2->id],
            [
                'paciente_id' => $paciente2->id,
                'estudiante_id' => $estudianteGabriela->id,
                'docente_supervisor_id' => $docenteMorales->id,
                'titulo' => 'Plan de Rehabilitación Oral Protésica',
                'descripcion' => 'Corona individual metal-cerámica en pieza 14 y férula oclusal nocturna.',
                'costo_total_estimado' => 1200.00,
                'estado' => 'aprobado_docente',
                'fecha_aprobacion_docente' => now()->subDays(2),
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan2->id, 'numero_fase' => 1],
            [
                'nombre_fase' => 'Fase 1: Preparación Biomecánica y Provisorio',
                'procedimiento' => 'Tallado periférico con línea de terminación en chaflán y corona provisoria acrílica.',
                'pieza_fdi' => 14,
                'estado' => 'aprobado_docente',
                'calificacion' => 94,
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan2->id, 'numero_fase' => 2],
            [
                'nombre_fase' => 'Fase 2: Prueba de Cofia Metálica y Color',
                'procedimiento' => 'Comprobación de sellado marginal y toma de color A2/A3.',
                'pieza_fdi' => 14,
                'estado' => 'aprobado_docente',
                'calificacion' => 97,
            ]
        );

        TratamientoFase::updateOrCreate(
            ['plan_tratamiento_id' => $plan2->id, 'numero_fase' => 3],
            [
                'nombre_fase' => 'Fase 3: Cementación Definitiva',
                'procedimiento' => 'Prueba de bizcocho, ajuste oclusal y cementación definitiva.',
                'pieza_fdi' => 14,
                'estado' => 'en_ejecucion',
            ]
        );

        // =============================================================
        // CITAS EN SILLONES CLÍNICOS
        // =============================================================
        if ($sillon1) {
            Cita::updateOrCreate(
                [
                    'paciente_id' => $paciente1->id,
                    'fecha_hora_inicio' => now()->setTime(14, 30),
                ],
                [
                    'fecha_hora_fin' => now()->setTime(16, 0),
                    'duracion_estimada_minutos' => 90,
                    'estudiante_id' => $estudianteGabriela->id,
                    'docente_id' => $docenteFernandez->id,
                    'sillon_id' => $sillon1->id,
                    'motivo' => 'Restauración oclusal de pieza 26 con resina fotopolimerizable',
                    'estado' => 'confirmada',
                ]
            );
        }

        if ($sillon2) {
            Cita::updateOrCreate(
                [
                    'paciente_id' => $paciente2->id,
                    'fecha_hora_inicio' => now()->setTime(16, 30),
                ],
                [
                    'fecha_hora_fin' => now()->setTime(18, 0),
                    'duracion_estimada_minutos' => 90,
                    'estudiante_id' => $estudianteGabriela->id,
                    'docente_id' => $docenteMorales->id,
                    'sillon_id' => $sillon2->id,
                    'motivo' => 'Prueba de bizcocho de porcelana para corona en pieza 14',
                    'estado' => 'en_espera',
                ]
            );
        }

        if ($sillon3 && $estudianteTorrico) {
            Cita::updateOrCreate(
                [
                    'paciente_id' => $paciente5->id,
                    'fecha_hora_inicio' => now()->setTime(10, 0),
                ],
                [
                    'fecha_hora_fin' => now()->setTime(11, 30),
                    'duracion_estimada_minutos' => 90,
                    'estudiante_id' => $estudianteTorrico->id,
                    'docente_id' => $docenteMorales->id,
                    'sillon_id' => $sillon3->id,
                    'motivo' => 'Control post-inserción de prótesis total superior',
                    'estado' => 'atendida',
                ]
            );
        }

        // =============================================================
        // SEGUIMIENTO ACADÉMICO (COMPETENCIAS)
        // =============================================================
        SeguimientoAcademico::updateOrCreate(
            [
                'estudiante_id' => $estudianteGabriela->id,
                'asignatura' => 'Operatoria Dental II',
                'periodo_academico' => '2026-I',
                'procedimiento_clave' => 'Restauración Clase II Resina Compuesta',
            ],
            [
                'docente_tutor_id' => $docenteFernandez->id,
                'cupos_requeridos' => 10,
                'cupos_completados' => 8,
                'estado' => 'en_curso',
            ]
        );

        SeguimientoAcademico::updateOrCreate(
            [
                'estudiante_id' => $estudianteGabriela->id,
                'asignatura' => 'Periodoncia I',
                'periodo_academico' => '2026-I',
                'procedimiento_clave' => 'Profilaxis y Destartraje Supragingival',
            ],
            [
                'docente_tutor_id' => $docenteFernandez->id,
                'cupos_requeridos' => 12,
                'cupos_completados' => 11,
                'estado' => 'en_curso',
            ]
        );

        SeguimientoAcademico::updateOrCreate(
            [
                'estudiante_id' => $estudianteGabriela->id,
                'asignatura' => 'Cirugía Bucal I',
                'periodo_academico' => '2026-I',
                'procedimiento_clave' => 'Exodoncia Simple en Dientes Posteriores',
            ],
            [
                'docente_tutor_id' => $docenteMorales->id,
                'cupos_requeridos' => 6,
                'cupos_completados' => 6,
                'estado' => 'completado',
            ]
        );

        // =============================================================
        // AUDITORÍA DEMO
        // =============================================================
        AuditoriaLog::create([
            'user_id' => $estudianteGabriela?->id,
            'accion' => 'restauracion_completada',
            'tabla' => 'antecedentes_medicos',
            'registro_id' => $paciente1->id,
            'payload_diff' => ['diente' => '46', 'procedimiento' => 'Resina compuesta ocluso-mesial'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'ClinicaApp/1.0',
            'created_at' => now()->subDays(5),
        ]);

        AuditoriaLog::create([
            'user_id' => $estudianteGabriela?->id,
            'accion' => 'historia_clinica_creada',
            'tabla' => 'historias_clinicas',
            'registro_id' => $historia1->id,
            'payload_diff' => ['nuevo' => ['numero_expediente' => 'HC-001-2026-0001', 'estado' => 'aprobada']],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'ClinicaApp/1.0',
            'created_at' => now()->subDays(12),
        ]);
    }
}
