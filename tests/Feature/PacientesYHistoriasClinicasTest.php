<?php

use App\Models\AntecedenteMedico;
use App\Models\HistoriaClinica;
use App\Models\Paciente;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('estudiante can view patient index and create a new patient', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $response = $this->actingAs($estudiante)->get(route('pacientes.index'));
    $response->assertStatus(200);

    $nuevoPacienteData = [
        'nombres' => 'Marcelo',
        'apellido_paterno' => 'Claure',
        'apellido_materno' => 'Vargas',
        'ci' => '7891234SC',
        'ci_expedido' => 'SC',
        'fecha_nacimiento' => '1995-04-12',
        'sexo' => 'M',
        'telefono' => '77123456',
        'direccion' => 'Av. Banzer 4to Anillo',
        'ocupacion' => 'Ingeniero de Software',
        'estado_civil' => 'Soltero',
        'contacto_emergencia' => 'María Claure',
        'telefono_emergencia' => '77987654',
        'parentesco_emergencia' => 'Hermana',
    ];

    $createResponse = $this->actingAs($estudiante)->post(route('pacientes.store'), $nuevoPacienteData);
    $createResponse->assertRedirect();

    $this->assertDatabaseHas('pacientes', [
        'ci' => '7891234SC',
        'nombres' => 'Marcelo',
        'apellido_paterno' => 'Claure',
        'estudiante_asignado_id' => $estudiante->id,
    ]);
});

test('patient antecedents auto-detect medical alerts across 4 blocks', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    $paciente = Paciente::first();

    $antecedentesData = [
        'patologicos_personales' => [
            'alergias' => [
                'penicilina' => true,
                'anestesia' => false,
                'aspirina' => true,
                'otros' => 'Sulfas',
            ],
            'enfermedades_sistemicas' => [
                'hipertension' => true,
                'diabetes' => false,
                'cardiopatias' => false,
            ],
            'trastornos_coagulacion' => [
                'padece' => true,
                'especificar' => 'Tiempo de protrombina prolongado',
            ],
            'medicacion_actual' => 'Enalapril 10mg diario',
        ],
        'patologicos_familiares' => [
            'diabetes' => ['presente' => true, 'parentesco' => 'Padre', 'observaciones' => 'Tipo 2 controlada'],
            'hipertension' => ['presente' => true, 'parentesco' => 'Madre', 'observaciones' => ''],
        ],
        'no_patologicos' => [
            'habitos_orales' => [
                'bruxismo' => true,
                'onicofagia' => false,
            ],
            'higiene_oral' => [
                'frecuencia_cepillado_dia' => 3,
                'hilo_dental' => true,
            ],
            'toxicologicos' => [
                'tabaco' => false,
                'alcohol' => true,
            ],
        ],
        'ginecologicos' => [
            'embarazo' => true,
            'meses_gestacion' => 4,
            'lactancia' => false,
            'anticonceptivos' => false,
        ],
    ];

    $response = $this->actingAs($estudiante)->post(
        route('pacientes.antecedentes.guardar', $paciente->id),
        $antecedentesData
    );

    $response->assertRedirect();

    $antecedente = AntecedenteMedico::where('paciente_id', $paciente->id)->first();
    expect($antecedente)->not->toBeNull();
    expect($antecedente->alerta_alergia)->toBeTrue();
    expect($antecedente->alerta_hipertension)->toBeTrue();
    expect($antecedente->alerta_coagulacion)->toBeTrue();
    expect($antecedente->alerta_embarazo)->toBeTrue();

    // Verify dynamic model accessor generates visual badges
    $pacienteFresh = $paciente->fresh();
    expect($pacienteFresh->alertas_medicas)->toBeArray();
    expect(count($pacienteFresh->alertas_medicas))->toBeGreaterThanOrEqual(4);
});

test('estudiante can create HC-001 with sequential code and docente can approve it', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $paciente = Paciente::first();

    $hcData = [
        'paciente_id' => $paciente->id,
        'motivo_consulta' => 'Dolor intenso en molar inferior derecho al masticar',
        'enfermedad_actual' => 'Paciente refiere cuadro clínico de 3 días de evolución caracterizado por odontalgia punzante.',
        'signos_vitales' => [
            'presion_arterial' => '120/80',
            'frecuencia_cardiaca' => 72,
            'frecuencia_respiratoria' => 16,
            'temperatura' => 36.6,
            'peso_kg' => 68.5,
            'talla_cm' => 170,
        ],
        'examen_estomatologico' => [
            'atm' => ['ruidos' => 'chasquido bilateral', 'dolor_palpacion' => false],
            'oclusion' => ['clasificacion_angle' => 'Clase I', 'mordida' => 'Normal'],
            'tejidos_blandos' => ['encias' => 'Gingivitis marginal leve en sector anteroinferior'],
        ],
        'diagnostico_presuntivo' => 'Pulpitis irreversible sintomática pieza 46',
        'diagnostico_definitivo' => 'Pulpitis irreversible sintomática pieza 46 por caries profunda',
        'pronostico' => 'Favorable',
        'plan_tratamiento' => 'Tratamiento de conductos (endodoncia) pieza 46 y posterior restauración con corona.',
        'estado' => 'en_revision',
    ];

    $response = $this->actingAs($estudiante)->post(route('historias-clinicas.store'), $hcData);
    $response->assertRedirect();

    $historia = HistoriaClinica::where('paciente_id', $paciente->id)
        ->latest('id')
        ->first();

    expect($historia)->not->toBeNull();
    expect($historia->numero_expediente)->toStartWith('HC-001-');
    expect($historia->estado)->toBe('en_revision');

    // Docente approves the clinical history
    $approvalResponse = $this->actingAs($docente)->patch(
        route('historias-clinicas.estado', $historia->id),
        [
            'estado' => 'aprobada',
            'observaciones_docente' => 'Historia clínica completa y diagnósticos fundamentados. Proceder a endodoncia.',
        ]
    );

    $approvalResponse->assertRedirect();

    $historiaFresh = $historia->fresh();
    expect($historiaFresh->estado)->toBe('aprobada');
    expect($historiaFresh->docente_supervisor_id)->toBe($docente->id);
    expect($historiaFresh->fecha_aprobacion)->not->toBeNull();
});

test('paciente role cannot create or modify clinical histories or access medical records', function () {
    $pacienteUser = User::where('email', 'paciente@unifranz.edu.bo')->first();
    $paciente = Paciente::first();

    // Paciente user cannot access patient intake
    $this->actingAs($pacienteUser)->get(route('pacientes.create'))
        ->assertStatus(403);

    // Paciente user cannot submit clinical history
    $this->actingAs($pacienteUser)->post(route('historias-clinicas.store'), [
        'paciente_id' => $paciente->id,
        'motivo_consulta' => 'Prueba ilícita',
    ])->assertStatus(403);
});
