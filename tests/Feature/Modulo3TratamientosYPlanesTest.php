<?php

namespace Tests\Feature;

use App\Models\Arancel;
use App\Models\Paciente;
use App\Models\PlanTratamiento;
use App\Models\RemisionIntercatedra;
use App\Models\Role;
use App\Models\TransferenciaPaciente;
use App\Models\TratamientoFase;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class Modulo3TratamientosYPlanesTest extends TestCase
{
    use DatabaseTransactions;

    protected User $docente;
    protected User $estudiante1;
    protected User $estudiante2;
    protected Paciente $paciente;
    protected Arancel $arancel1;
    protected Arancel $arancel2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
        $this->artisan('db:seed', ['--class' => 'ArancelSeeder']);

        $rolDocente = Role::where('slug', 'docente')->first();
        $rolEstudiante = Role::where('slug', 'estudiante')->first();

        $this->docente = User::firstOrCreate(
            ['email' => 'docente.test.mod3@unifranz.edu.bo'],
            [
                'name' => 'Dr. Carlos Mendoza',
                'password' => bcrypt('password123'),
                'is_active' => true,
            ]
        );
        $this->docente->rol_id = $rolDocente->id;
        $this->docente->is_active = true;
        $this->docente->save();
        $this->docente->load('rol');

        $this->estudiante1 = User::firstOrCreate(
            ['email' => 'estudiante1.test.mod3@unifranz.edu.bo'],
            [
                'name' => 'Univ. Andrea Flores',
                'password' => bcrypt('password123'),
                'is_active' => true,
            ]
        );
        $this->estudiante1->rol_id = $rolEstudiante->id;
        $this->estudiante1->is_active = true;
        $this->estudiante1->save();
        $this->estudiante1->load('rol');

        $this->estudiante2 = User::firstOrCreate(
            ['email' => 'estudiante2.test.mod3@unifranz.edu.bo'],
            [
                'name' => 'Univ. Rodrigo Quispe',
                'password' => bcrypt('password123'),
                'is_active' => true,
            ]
        );
        $this->estudiante2->rol_id = $rolEstudiante->id;
        $this->estudiante2->is_active = true;
        $this->estudiante2->save();
        $this->estudiante2->load('rol');

        $this->paciente = Paciente::create([
            'iup' => 'PAC-MOD3-001',
            'ci' => '99887766',
            'nombres' => 'Marcelo',
            'apellido_paterno' => 'Perez',
            'fecha_nacimiento' => '1995-04-12',
            'sexo' => 'M',
            'estado_paciente' => 'activo',
            'estado_clinico' => 'en_tratamiento',
            'estudiante_asignado_id' => $this->estudiante1->id,
        ]);

        $this->arancel1 = Arancel::firstOrCreate(
            ['codigo' => 'OPE-001'],
            [
                'categoria' => 'Operatoria Dental',
                'nombre' => 'Obturación con resina compuesta fotopolimerizable simple',
                'precio_base' => 120.00,
                'tiempo_estimado_minutos' => 45,
                'activo' => true,
            ]
        );

        $this->arancel2 = Arancel::firstOrCreate(
            ['codigo' => 'END-001'],
            [
                'categoria' => 'Endodoncia',
                'nombre' => 'Tratamiento endodóntico unirradicular',
                'precio_base' => 250.00,
                'tiempo_estimado_minutos' => 60,
                'activo' => true,
            ]
        );
    }

    public function test_catalogo_aranceles_endpoint_retorna_datos(): void
    {
        $response = $this->actingAs($this->estudiante1)
            ->getJson('/aranceles/catalogo');

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json());
    }

    public function test_estudiante_puede_crear_plan_de_tratamiento_con_procedimientos_vinculados_a_aranceles(): void
    {
        $payload = [
            'titulo' => 'Plan Integral Odontológico 2026',
            'descripcion' => 'Rehabilitación dental por fases con resina y endodoncia',
            'docente_supervisor_id' => $this->docente->id,
            'procedimientos' => [
                [
                    'numero_fase' => 1,
                    'fase_categoria' => 'Fase I: Control de Infección',
                    'nombre_fase' => 'Control de Infección',
                    'especialidad' => 'Endodoncia',
                    'procedimiento' => 'Tratamiento endodóntico unirradicular',
                    'pieza_fdi' => 11,
                    'diagnostico_codigo' => 'K04.0',
                    'arancel_codigo' => $this->arancel2->codigo,
                    'costo_arancel' => 250.00,
                    'prioridad' => 'Urgente',
                    'tiempo_estimado_minutos' => 60,
                ],
                [
                    'numero_fase' => 2,
                    'fase_categoria' => 'Fase II: Restauradora',
                    'nombre_fase' => 'Restauradora',
                    'especialidad' => 'Operatoria Dental',
                    'procedimiento' => 'Obturación resina compuesta fotopolimerizable',
                    'pieza_fdi' => 16,
                    'diagnostico_codigo' => 'K02.1',
                    'arancel_codigo' => $this->arancel1->codigo,
                    'costo_arancel' => 120.00,
                    'prioridad' => 'Prioritario',
                    'tiempo_estimado_minutos' => 45,
                ],
            ],
        ];

        $response = $this->actingAs($this->estudiante1)
            ->post("/pacientes/{$this->paciente->id}/planes-tratamiento", $payload);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('planes_tratamiento', [
            'paciente_id' => $this->paciente->id,
            'titulo' => 'Plan Integral Odontológico 2026',
            'costo_total_estimado' => 370.00,
            'estado' => 'propuesto',
            'requiere_validacion_docente' => true,
        ]);

        $this->assertDatabaseHas('tratamiento_fases', [
            'pieza_fdi' => 11,
            'arancel_codigo' => 'END-001',
            'estado' => 'pendiente',
        ]);
    }

    public function test_docente_puede_aprobar_o_validar_el_plan_de_tratamiento_doble_check(): void
    {
        $plan = PlanTratamiento::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante1->id,
            'docente_supervisor_id' => $this->docente->id,
            'titulo' => 'Plan para Aprobación Docente',
            'costo_total_estimado' => 120.00,
            'porcentaje_avance' => 0,
            'estado' => 'propuesto',
            'requiere_validacion_docente' => true,
        ]);

        $response = $this->actingAs($this->docente)
            ->post("/planes-tratamiento/{$plan->id}/validar-docente", [
                'aprobado' => true,
                'observaciones' => 'Plan revisado y autorizado según normas de la clínica.',
            ]);

        $response->assertSessionHasNoErrors();
        $plan->refresh();
        $this->assertContains($plan->estado, ['aprobado', 'aprobado_docente']);
        $this->assertNotNull($plan->fecha_aprobacion_docente);
    }

    public function test_registro_de_aceptacion_formal_del_paciente(): void
    {
        $plan = PlanTratamiento::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante1->id,
            'docente_supervisor_id' => $this->docente->id,
            'titulo' => 'Plan Aceptado',
            'costo_total_estimado' => 250.00,
            'porcentaje_avance' => 0,
            'estado' => 'aprobado_docente',
            'requiere_validacion_docente' => false,
        ]);

        $response = $this->actingAs($this->estudiante1)
            ->post("/planes-tratamiento/{$plan->id}/aceptar-paciente", [
                'metodo' => 'firma_digital',
                'nombre_firmante' => 'Marcelo Perez',
                'documento_identidad' => '99887766',
                'observaciones' => 'Acepta presupuesto y plan de endodoncia',
            ]);

        $response->assertSessionHasNoErrors();
        $plan->refresh();
        $this->assertNotNull($plan->aceptacion_paciente);
        $this->assertTrue($plan->aceptacion_paciente['aceptado']);
    }

    public function test_actualizacion_de_procedimiento_recalcula_porcentaje_de_avance(): void
    {
        $plan = PlanTratamiento::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante1->id,
            'docente_supervisor_id' => $this->docente->id,
            'titulo' => 'Plan de Seguimiento',
            'costo_total_estimado' => 370.00,
            'porcentaje_avance' => 0,
            'estado' => 'aprobado_docente',
            'requiere_validacion_docente' => false,
        ]);

        $fase1 = TratamientoFase::create([
            'plan_tratamiento_id' => $plan->id,
            'numero_fase' => 1,
            'nombre_fase' => 'Control de Infección',
            'fase_categoria' => 'Fase I: Control de Infección',
            'especialidad' => 'Endodoncia',
            'procedimiento' => 'Tratamiento endodóntico',
            'pieza_fdi' => 11,
            'costo_arancel' => 250.00,
            'prioridad' => 'Urgente',
            'estado' => 'pendiente',
        ]);

        $fase2 = TratamientoFase::create([
            'plan_tratamiento_id' => $plan->id,
            'numero_fase' => 2,
            'nombre_fase' => 'Restauradora',
            'fase_categoria' => 'Fase II: Restauradora',
            'especialidad' => 'Operatoria Dental',
            'procedimiento' => 'Obturación resina',
            'pieza_fdi' => 16,
            'costo_arancel' => 120.00,
            'prioridad' => 'Prioritario',
            'estado' => 'pendiente',
        ]);

        // Estudiante actualiza fase1 a 'completado' con tiempo y materiales
        $response = $this->actingAs($this->estudiante1)
            ->post("/planes-tratamiento/{$plan->id}/fases/{$fase1->id}/actualizar", [
                'estado' => 'completado',
                'tiempo_empleado_minutos' => 50,
                'materiales_consumidos' => [
                    ['material' => 'Conos de gutapercha', 'cantidad' => 3, 'unidad' => 'piezas'],
                    ['material' => 'Cemento sellador AH Plus', 'cantidad' => 1, 'unidad' => 'dosis'],
                ],
                'observaciones_evolucion' => 'Conductometría y obturación tridimensional exitosa',
            ]);

        $response->assertSessionHasNoErrors();
        $plan->refresh();
        $this->assertEquals(50, $plan->porcentaje_avance); // 1 de 2 completado = 50%
    }

    public function test_remision_intercatedra_creacion_y_resolucion(): void
    {
        // Estudiante remite a otra cátedra
        $response = $this->actingAs($this->estudiante1)
            ->post("/pacientes/{$this->paciente->id}/remisiones", [
                'catedra_origen' => 'Operatoria Dental',
                'catedra_receptora' => 'Endodoncia',
                'pieza_dental' => '21',
                'procedimiento_solicitado' => 'Tratamiento de conducto previo a corona',
                'motivo_remision' => 'Paciente presenta pulpitis irreversible sintomática que imposibilita restauración directa.',
                'docente_autoriza_id' => $this->docente->id,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('remisiones_intercatedra', [
            'paciente_id' => $this->paciente->id,
            'catedra_origen' => 'Operatoria Dental',
            'catedra_receptora' => 'Endodoncia',
            'estado' => 'activa',
        ]);

        $remision = RemisionIntercatedra::where('paciente_id', $this->paciente->id)->first();

        // Resolver remisión
        $resolverResponse = $this->actingAs($this->docente)
            ->post("/remisiones/{$remision->id}/resolver", [
                'estado' => 'completada',
                'observaciones_resolucion' => 'Endodoncia de pieza 21 finalizada satisfactoriamente. Se devuelve a Operatoria.',
            ]);

        $resolverResponse->assertSessionHasNoErrors();
        $remision->refresh();
        $this->assertEquals('completada', $remision->estado);
    }

    public function test_transferencia_de_paciente_con_motivo_estandarizado_obligatorio(): void
    {
        $response = $this->actingAs($this->docente)
            ->post("/pacientes/{$this->paciente->id}/transferir-estudiante-formal", [
                'estudiante_nuevo_id' => $this->estudiante2->id,
                'motivo_estandarizado' => 'Fin de semestre/rotación del estudiante anterior',
                'justificacion_detallada' => 'El estudiante culminó su rotación del periodo académico.',
            ]);

        $response->assertSessionHasNoErrors();
        $this->paciente->refresh();
        $this->assertEquals($this->estudiante2->id, $this->paciente->estudiante_asignado_id);

        $this->assertDatabaseHas('transferencias_pacientes', [
            'paciente_id' => $this->paciente->id,
            'estudiante_anterior_id' => $this->estudiante1->id,
            'estudiante_nuevo_id' => $this->estudiante2->id,
            'motivo_estandarizado' => 'Fin de semestre/rotación del estudiante anterior',
        ]);
    }

    public function test_alta_clinica_definitiva_registra_recomendaciones_y_control(): void
    {
        $plan = PlanTratamiento::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante1->id,
            'docente_supervisor_id' => $this->docente->id,
            'titulo' => 'Plan Finalizado',
            'costo_total_estimado' => 120.00,
            'porcentaje_avance' => 100,
            'estado' => 'aprobado_docente',
            'requiere_validacion_docente' => false,
        ]);

        $response = $this->actingAs($this->docente)
            ->post("/planes-tratamiento/{$plan->id}/alta-clinica", [
                'recomendaciones_finales' => 'Higiene con cepillo de cerdas suaves, hilo dental diario y enjuague fluorado.',
                'proximo_control_meses' => 6,
                'observaciones' => 'Paciente dado de alta clínica con salud gingival restablecida.',
            ]);

        $response->assertSessionHasNoErrors();
        $plan->refresh();
        $this->assertEquals('completado', $plan->estado);
        $this->assertNotNull($plan->alta_clinica);

        $this->paciente->refresh();
        $this->assertEquals('alta_clinica', $this->paciente->estado_clinico);
    }

    public function test_reportes_de_produccion_clinica(): void
    {
        $response = $this->actingAs($this->docente)
            ->getJson('/tratamientos/reportes-produccion');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'resumen_general',
            'top_procedimientos',
            'distribucion_especialidades',
            'productividad_estudiantes',
        ]);
    }
}
