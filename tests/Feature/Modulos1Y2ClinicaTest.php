<?php

namespace Tests\Feature;

use App\Models\AntecedenteMedico;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class Modulos1Y2ClinicaTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_paciente_automatic_iup_generation_and_modulo1_fields(): void
    {
        $rolEstudiante = Role::where('slug', 'estudiante')->first();
        $estudiante = User::factory()->create(['rol_id' => $rolEstudiante->id, 'is_active' => true]);

        $this->actingAs($estudiante);

        $response = $this->post(route('pacientes.store'), [
            'ci' => '99887766',
            'ci_expedido' => 'LP',
            'nombres' => 'Marcelo',
            'apellido_paterno' => 'Arce',
            'apellido_materno' => 'Rojas',
            'fecha_nacimiento' => '1990-05-15',
            'sexo' => 'M',
            'nacionalidad' => 'Boliviana',
            'ocupacion' => 'Ingeniero de Sistemas',
            'nivel_instruccion' => 'Licenciatura Universitaria',
            'email' => 'marcelo.arce@unifranz.edu.bo',
            'celular' => '78912345',
            'fuente_referencia' => 'Redes Sociales UNIFRANZ',
            'seguro_convenio' => 'Seguro Privado Bisa',
            'numero_poliza' => 'POL-BISA-1234',
            'contacto_emergencia' => 'Carla Rojas (Hermana)',
            'telefono_emergencia' => '71122334',
            'parentesco_emergencia' => 'Hermana',
            'estado_paciente' => 'activo',
            'estado_clinico' => 'en_evaluacion',
            'consentimiento_firmado' => true,
            'reglamento_aceptado' => true,
            'privacidad_aceptada' => true,
        ]);

        $response->assertRedirect();

        $paciente = Paciente::where('ci', '99887766')->first();
        $this->assertNotNull($paciente);
        $this->assertNotNull($paciente->iup);
        $this->assertStringStartsWith('UNIFRANZ-' . date('Y') . '-', $paciente->iup);
        $this->assertEquals('Boliviana', $paciente->nacionalidad);
        $this->assertEquals('marcelo.arce@unifranz.edu.bo', $paciente->email);
        $this->assertEquals('activo', $paciente->estado_paciente);
        $this->assertEquals('en_evaluacion', $paciente->estado_clinico);
        $this->assertTrue($paciente->consentimiento_inicial['firmado']);
    }

    public function test_buscar_rapido_paciente_by_iup_ci_or_name(): void
    {
        $rolEstudiante = Role::where('slug', 'estudiante')->first();
        $estudiante = User::factory()->create(['rol_id' => $rolEstudiante->id, 'is_active' => true]);

        $paciente = Paciente::create([
            'ci' => '11223344',
            'ci_expedido' => 'LP',
            'nombres' => 'Patricia',
            'apellido_paterno' => 'Quiroga',
            'apellido_materno' => 'Salas',
            'fecha_nacimiento' => '1998-03-20',
            'sexo' => 'F',
            'iup' => 'UNIFRANZ-2026-999999',
            'estudiante_asignado_id' => $estudiante->id,
            'estado_paciente' => 'activo',
            'estado_clinico' => 'en_evaluacion',
        ]);

        $this->actingAs($estudiante);

        // Búsqueda por IUP
        $resIup = $this->getJson(route('pacientes.buscar-rapido', ['q' => '999999']));
        $resIup->assertOk();
        $resIup->assertJsonFragment(['ci' => '11223344 LP', 'iup' => 'UNIFRANZ-2026-999999']);

        // Búsqueda por CI
        $resCi = $this->getJson(route('pacientes.buscar-rapido', ['q' => '11223344']));
        $resCi->assertOk();
        $resCi->assertJsonFragment(['nombre_completo' => 'Patricia Quiroga Salas']);
    }

    public function test_modulo2_clinical_history_cie10_pdt_and_forensic_saving(): void
    {
        $rolEstudiante = Role::where('slug', 'estudiante')->first();
        $estudiante = User::factory()->create(['rol_id' => $rolEstudiante->id, 'is_active' => true]);

        $paciente = Paciente::create([
            'ci' => '55667788',
            'ci_expedido' => 'CB',
            'nombres' => 'Gonzalo',
            'apellido_paterno' => 'Vargas',
            'fecha_nacimiento' => '1992-07-10',
            'sexo' => 'M',
            'estudiante_asignado_id' => $estudiante->id,
            'estado_paciente' => 'activo',
            'estado_clinico' => 'en_tratamiento',
        ]);

        $this->actingAs($estudiante);

        $payload = [
            'motivo_consulta_paciente' => 'Me duele la muela derecha al tomar cosas frías o calientes.',
            'antecedentes_odontologicos' => [
                'frecuencia_visitas' => 'Cada año',
                'experiencias_traumaticas' => 'Ninguna',
            ],
            'odontograma' => [
                'dientes' => [
                    '16' => ['caras' => ['oclusal' => 'caries'], 'general' => null],
                ],
            ],
            'diagnosticos_codificados' => [
                [
                    'codigo' => 'K02.1',
                    'estandar' => 'CIE-10',
                    'descripcion' => 'Caries de la dentina (cavitada)',
                    'pieza' => '16',
                    'prioridad' => 'Urgente',
                ],
            ],
            'plan_tratamiento_secuencia' => [
                [
                    'orden' => 1,
                    'procedimiento' => 'Restauración con resina compuesta oclusal',
                    'pieza' => '16',
                    'prioridad' => 'Urgente',
                    'costo_estimado' => 100.00,
                    'estado' => 'Propuesto',
                ],
            ],
            'odontologia_legal_forense' => [
                'tatuajes_amalgama' => 'Pigmentación leve en mucosa vestibular.',
                'anomalias_morfologicas' => 'Tubérculo de Carabelli en 16.',
            ],
        ];

        $response = $this->post(route('pacientes.antecedentes.guardar', $paciente->id), $payload);
        $response->assertRedirect();

        $antecedente = AntecedenteMedico::where('paciente_id', $paciente->id)->first();
        $this->assertNotNull($antecedente);
        $this->assertEquals('Me duele la muela derecha al tomar cosas frías o calientes.', $antecedente->motivo_consulta_paciente);
        $this->assertEquals('K02.1', $antecedente->diagnosticos_codificados[0]['codigo']);
        $this->assertEquals('Restauración con resina compuesta oclusal', $antecedente->plan_tratamiento_secuencia[0]['procedimiento']);
        $this->assertEquals('caries', $antecedente->odontograma['dientes']['16']['caras']['oclusal']);
        $this->assertEquals('Pigmentación leve en mucosa vestibular.', $antecedente->odontologia_legal_forense['tatuajes_amalgama']);
    }
}
