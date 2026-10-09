<?php

namespace Tests\Feature;

use App\Models\AlertaBajoDesempeno;
use App\Models\AsignaturaCupoRequisito;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\Sillon;
use App\Models\SupervisionProgramacion;
use App\Models\SupervisionSolicitud;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class Modulo6FormacionYSupervisionTest extends TestCase
{
    use DatabaseTransactions;

    protected $admin;
    protected $docente;
    protected $estudiante;
    protected $paciente;
    protected $sillon;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        $roleAdmin = Role::where('slug', 'admin')->first();
        $roleDocente = Role::where('slug', 'docente')->first();
        $roleEstudiante = Role::where('slug', 'estudiante')->first();

        $this->admin = User::create([
            'name' => 'Coordinador Clinico M6',
            'email' => 'coordinador_m6_' . uniqid() . '@unifranz.edu.bo',
            'password' => bcrypt('password123'),
            'rol_id' => $roleAdmin->id,
            'is_active' => true,
        ]);

        $this->docente = User::create([
            'name' => 'Docente Supervisor M6',
            'email' => 'docente_m6_' . uniqid() . '@unifranz.edu.bo',
            'password' => bcrypt('password123'),
            'rol_id' => $roleDocente->id,
            'is_active' => true,
        ]);

        $this->estudiante = User::create([
            'name' => 'Estudiante Clinico M6',
            'email' => 'estudiante_m6_' . uniqid() . '@unifranz.edu.bo',
            'password' => bcrypt('password123'),
            'rol_id' => $roleEstudiante->id,
            'codigo_institucional' => 'EST-M6-99',
            'is_active' => true,
        ]);

        $this->paciente = Paciente::create([
            'nombres' => 'Carlos M6',
            'apellido_paterno' => 'Mamani',
            'apellido_materno' => 'Flores',
            'ci' => '7654321',
            'iup' => 'PAC-M6-' . uniqid(),
            'fecha_nacimiento' => '1995-05-15',
            'sexo' => 'M',
            'telefono' => '71234567',
            'domicilio' => 'Av. Landaeta 123',
            'activo' => true,
            'estudiante_asignado_id' => $this->estudiante->id,
        ]);

        $this->sillon = Sillon::firstOrCreate(
            ['codigo' => 'SIL-M6-01'],
            ['nombre' => 'Gabinete Endodoncia 1', 'sala_clinica' => 'Piso 2', 'activo' => true]
        );
    }

    public function test_acceso_a_modulo_supervision_por_roles_autorizados()
    {
        $response = $this->actingAs($this->docente)->get(route('supervision.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Supervision/Index'));

        $responseEst = $this->actingAs($this->estudiante)->get(route('supervision.index'));
        $responseEst->assertStatus(200);
    }

    public function test_estudiante_solicita_aprobacion_de_hito_clinico()
    {
        $response = $this->actingAs($this->estudiante)->post(route('supervision.solicitudes.store'), [
            'paciente_id' => $this->paciente->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'asignatura' => 'Endodoncia I',
            'tipo_hito' => 'inicio_procedimiento_critico',
            'procedimiento' => 'Apertura cameral y localización de conductos',
            'pieza_dental' => '2.1',
            'comentarios_estudiante' => 'Aislamiento absoluto con grapa #9 verificado sin filtraciones.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('supervision_solicitudes', [
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'tipo_hito' => 'inicio_procedimiento_critico',
            'procedimiento' => 'Apertura cameral y localización de conductos',
            'estado' => 'pendiente',
        ]);
    }

    public function test_docente_aprueba_y_firma_electronicamente_solicitud()
    {
        $solicitud = SupervisionSolicitud::create([
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'paciente_id' => $this->paciente->id,
            'asignatura' => 'Endodoncia I',
            'tipo_hito' => 'cierre_alta_tecnica',
            'procedimiento' => 'Obturación y sellado endodóntico',
            'pieza_dental' => '1.1',
            'estado' => 'pendiente',
            'solicitado_at' => now(),
        ]);

        $response = $this->actingAs($this->docente)->post(route('supervision.solicitudes.responder', $solicitud->id), [
            'estado' => 'aprobado',
            'comentarios_docente' => 'Excelente condensación lateral y conometría adecuada.',
            'rubrica_bioseguridad' => 5,
            'rubrica_destreza' => 5,
            'rubrica_criterio' => 5,
            'rubrica_trato_paciente' => 5,
            'nota_final' => 98,
        ]);

        $response->assertSessionHas('success');

        $solicitudActualizada = SupervisionSolicitud::find($solicitud->id);
        $this->assertEquals('aprobado', $solicitudActualizada->estado);
        $this->assertNotNull($solicitudActualizada->firma_digital);
        $this->assertEquals('FIRMA_DIGITAL_VALIDA', $solicitudActualizada->firma_digital['estatus']);
        $this->assertNotNull($solicitudActualizada->firma_digital['hash_seguridad']);
        $this->assertEquals(98, $solicitudActualizada->evaluacion_rubrica['nota_final']);
    }

    public function test_docente_emite_alerta_temprana_de_bajo_desempeno()
    {
        $response = $this->actingAs($this->docente)->post(route('supervision.alertas.store'), [
            'estudiante_id' => $this->estudiante->id,
            'asignatura' => 'Operatoria Dental II',
            'motivo_categoria' => 'bioseguridad',
            'motivo_detallado' => 'Problemas recurrentes en esterilización y colocación de campo estéril.',
            'medidas_sugeridas' => 'Tutoría de refuerzo en protocolo de bioseguridad.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('alertas_bajo_desempeno', [
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'motivo_categoria' => 'bioseguridad',
            'estado' => 'activa',
        ]);
    }

    public function test_coordinador_resuelve_alerta_temprana()
    {
        $alerta = AlertaBajoDesempeno::create([
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'asignatura' => 'Operatoria Dental II',
            'motivo_categoria' => 'destreza_manual',
            'motivo_detallado' => 'Dificultad en manejo de instrumental rotatorio.',
            'estado' => 'activa',
        ]);

        $response = $this->actingAs($this->admin)->post(route('supervision.alertas.resolver', $alerta->id), [
            'resolucion_coordinacion' => 'Estudiante completó 4 horas de práctica en fantoma de simulación bajo supervisión de tutor.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('alertas_bajo_desempeno', [
            'id' => $alerta->id,
            'estado' => 'resuelta',
            'resolucion_coordinacion' => 'Estudiante completó 4 horas de práctica en fantoma de simulación bajo supervisión de tutor.',
        ]);
    }

    public function test_coordinador_configura_cuota_obligatoria_de_procedimiento()
    {
        $response = $this->actingAs($this->admin)->post(route('supervision.cupos.store'), [
            'asignatura' => 'Periodoncia II',
            'semestre' => '6to Semestre',
            'procedimiento_clave' => 'Cirugía a Colgajo Periodontal',
            'cupos_minimos' => 3,
            'descripcion' => 'Tratamiento quirúrgico de bolsas periodontales profundas.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('asignaturas_cupos_requisitos', [
            'asignatura' => 'Periodoncia II',
            'procedimiento_clave' => 'Cirugía a Colgajo Periodontal',
            'cupos_minimos' => 3,
        ]);
    }

    public function test_coordinador_registra_programacion_horaria_de_supervision()
    {
        $response = $this->actingAs($this->admin)->post(route('supervision.programacion.store'), [
            'docente_id' => $this->docente->id,
            'asignatura' => 'Endodoncia I',
            'dia_semana' => 'Jueves',
            'turno' => 'Mañana (08:00 - 12:00)',
            'sala_clinica' => 'Clínica Quirúrgica Piso 1',
            'gabinetes_asignados' => 'Gabinetes 1 a 4',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('supervision_programaciones', [
            'docente_id' => $this->docente->id,
            'asignatura' => 'Endodoncia I',
            'dia_semana' => 'Jueves',
        ]);
    }
}
