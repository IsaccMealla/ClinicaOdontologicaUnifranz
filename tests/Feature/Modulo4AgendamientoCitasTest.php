<?php

namespace Tests\Feature;

use App\Models\ActaAbandono;
use App\Models\Cita;
use App\Models\HistoriaClinica;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\Sillon;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class Modulo4AgendamientoCitasTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected User $docente;
    protected User $estudiante;
    protected Paciente $paciente;
    protected Sillon $sillon;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        $rolAdmin = Role::where('slug', 'admin')->first();
        $rolDocente = Role::where('slug', 'docente')->first();
        $rolEstudiante = Role::where('slug', 'estudiante')->first();

        $this->admin = User::firstOrCreate(
            ['email' => 'admin.citas@unifranz.edu.bo'],
            ['name' => 'Admin Citas', 'password' => bcrypt('password123'), 'is_active' => true]
        );
        $this->admin->rol_id = $rolAdmin->id;
        $this->admin->is_active = true;
        $this->admin->save();
        $this->admin->load('rol');

        $this->docente = User::firstOrCreate(
            ['email' => 'docente.citas@unifranz.edu.bo'],
            ['name' => 'Dr. Supervisor Citas', 'password' => bcrypt('password123'), 'is_active' => true]
        );
        $this->docente->rol_id = $rolDocente->id;
        $this->docente->is_active = true;
        $this->docente->save();
        $this->docente->load('rol');

        $this->estudiante = User::firstOrCreate(
            ['email' => 'estudiante.citas@unifranz.edu.bo'],
            ['name' => 'Univ. Alumno Citas', 'password' => bcrypt('password123'), 'is_active' => true]
        );
        $this->estudiante->rol_id = $rolEstudiante->id;
        $this->estudiante->is_active = true;
        $this->estudiante->save();
        $this->estudiante->load('rol');

        $this->paciente = Paciente::firstOrCreate(
            ['ci' => '99887766'],
            [
                'nombres' => 'Juan',
                'apellido_paterno' => 'Perez',
                'apellido_materno' => 'Gomez',
                'fecha_nacimiento' => '1995-05-15',
                'sexo' => 'M',
                'celular' => '77788990',
                'iup' => 'UNIFRANZ-2026-998877',
                'activo' => true,
                'estudiante_asignado_id' => $this->estudiante->id,
            ]
        );

        $this->sillon = Sillon::firstOrCreate(
            ['codigo' => 'SIL-TEST-01'],
            [
                'nombre' => 'Gabinete Quirúrgico 1',
                'sala_clinica' => 'Clínica Integral A',
                'estado' => 'disponible',
                'activo' => true,
            ]
        );
    }

    public function test_agenda_multi_recurso_index_retorna_datos_y_vista(): void
    {
        $response = $this->actingAs($this->docente)->get(route('citas.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Citas/Index')
            ->has('citas')
            ->has('citasHoy')
            ->has('sillones')
            ->has('estudiantes')
            ->has('docentes')
            ->has('metricas')
        );
    }

    public function test_creacion_cita_con_vinculacion_obligatoria_multi_recurso(): void
    {
        $fechaInicio = Carbon::tomorrow()->setHour(10)->setMinute(0)->setSecond(0);

        $response = $this->actingAs($this->estudiante)->post(route('citas.store'), [
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => $fechaInicio->toDateTimeString(),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Evaluación de Operatoria Dental I',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('citas', [
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Evaluación de Operatoria Dental I',
            'estado' => 'programada',
        ]);
    }

    public function test_bloqueo_colision_fisica_de_gabinete(): void
    {
        $fechaInicio = Carbon::tomorrow()->setHour(14)->setMinute(0)->setSecond(0);

        // Crear primera cita
        Cita::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => $fechaInicio,
            'fecha_hora_fin' => (clone $fechaInicio)->addMinutes(60),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Cita previa ocupando sillón',
            'estado' => 'programada',
        ]);

        // Intentar programar otra cita en el mismo sillón a la misma hora con otro estudiante
        $rolEstudiante = Role::where('slug', 'estudiante')->first();
        $otroEstudiante = User::create([
            'name' => 'Otro Estudiante',
            'email' => 'otro.estudiante@unifranz.edu.bo',
            'password' => bcrypt('password123'),
            'rol_id' => $rolEstudiante->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->docente)->post(route('citas.store'), [
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $otroEstudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => $fechaInicio->toDateTimeString(),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Intento con colisión de sillón',
        ]);

        $response->assertSessionHasErrors('colision');
    }

    public function test_citas_recurrentes_programacion(): void
    {
        $fechaInicio = Carbon::today()->addDays(5)->setHour(9)->setMinute(0);

        $response = $this->actingAs($this->docente)->post(route('citas.store'), [
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => $fechaInicio->toDateTimeString(),
            'duracion_estimada_minutos' => 45,
            'motivo' => 'Tratamiento de Ortodoncia Sesiones 1 a 3',
            'es_recurrente' => true,
            'frecuencia_recurrencia' => 'semanal',
            'repeticiones' => 3,
        ]);

        $response->assertSessionHasNoErrors();

        $citasRecurrentes = Cita::where('motivo', 'Tratamiento de Ortodoncia Sesiones 1 a 3')->get();
        $this->assertCount(3, $citasRecurrentes);
        $this->assertNotNull($citasRecurrentes->first()->grupo_recurrencia_id);
    }

    public function test_protocolo_llegada_check_in_en_sala_de_espera(): void
    {
        $cita = Cita::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => now(),
            'fecha_hora_fin' => now()->addHour(),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Control de Cirugía',
            'estado' => 'programada',
        ]);

        $response = $this->actingAs($this->admin)->post(route('citas.check-in', $cita->id));

        $response->assertSessionHasNoErrors();
        $cita->refresh();
        $this->assertEquals('en_espera', $cita->estado);
        $this->assertNotNull($cita->check_in_at);
    }

    public function test_inicio_atencion_y_concluir_liberando_sillon(): void
    {
        $cita = Cita::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => now(),
            'fecha_hora_fin' => now()->addHour(),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Endodoncia Unirradicular',
            'estado' => 'en_espera',
            'check_in_at' => now()->subMinutes(10),
        ]);

        // Iniciar atención clínica
        $response1 = $this->actingAs($this->estudiante)->post(route('citas.iniciar-atencion', $cita->id));
        $response1->assertSessionHasNoErrors();

        $cita->refresh();
        $this->sillon->refresh();
        $this->assertEquals('en_atencion', $cita->estado);
        $this->assertEquals('ocupado', $this->sillon->estado);
        $this->assertNotNull($cita->inicio_atencion_at);

        // Concluir cita
        $response2 = $this->actingAs($this->estudiante)->post(route('citas.completar', $cita->id), [
            'observaciones' => 'Conductometría realizada conforme a protocolo.',
        ]);
        $response2->assertSessionHasNoErrors();

        $cita->refresh();
        $this->sillon->refresh();
        $this->assertEquals('asistio', $cita->estado);
        $this->assertEquals('disponible', $this->sillon->estado);
        $this->assertNotNull($cita->fin_atencion_at);
    }

    public function test_marcar_no_asistio_incrementa_contador_y_activa_alerta_abandono(): void
    {
        $this->paciente->update(['inasistencias_acumuladas' => 2, 'alerta_abandono' => false]);

        $cita = Cita::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => now()->subHour(),
            'fecha_hora_fin' => now(),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Control postoperatorio',
            'estado' => 'programada',
        ]);

        $response = $this->actingAs($this->docente)->post(route('citas.no-asistio', $cita->id));

        $response->assertSessionHasNoErrors();
        $this->paciente->refresh();
        $cita->refresh();

        $this->assertEquals('no_asistio', $cita->estado);
        $this->assertEquals(3, $this->paciente->inasistencias_acumuladas);
        $this->assertTrue($this->paciente->alerta_abandono);
    }

    public function test_protocolo_alta_por_abandono_emite_acta_formal_y_marca_inactivo(): void
    {
        $historia = HistoriaClinica::create([
            'numero_expediente' => 'HC-001-2026-9999',
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_supervisor_id' => $this->docente->id,
            'motivo_consulta' => 'Prótesis fija',
            'estado' => 'aprobado',
        ]);

        $this->paciente->update(['inasistencias_acumuladas' => 3, 'alerta_abandono' => true, 'activo' => true]);

        $response = $this->actingAs($this->docente)->post(route('citas.alta-abandono'), [
            'paciente_id' => $this->paciente->id,
            'motivo_abandono' => 'El paciente dejó de asistir a tres sesiones consecutivas sin contestar llamadas de seguimiento.',
            'acciones_previas' => 'Tres intentos telefónicos registrados en fecha 01/10 y 05/10.',
            'observaciones' => 'Se da de baja el caso en clínica docente.',
        ]);

        $response->assertSessionHasNoErrors();

        $this->paciente->refresh();
        $this->assertFalse($this->paciente->activo);
        $this->assertEquals('alta_abandono', $this->paciente->estado_paciente);
        $this->assertEquals('abandono', $this->paciente->estado_clinico);

        $this->assertDatabaseHas('actas_abandono', [
            'paciente_id' => $this->paciente->id,
            'docente_id' => $this->docente->id,
            'numero_inasistencias' => 3,
        ]);
    }

    public function test_recordatorio_automatico_registro_y_envio(): void
    {
        $cita = Cita::create([
            'paciente_id' => $this->paciente->id,
            'estudiante_id' => $this->estudiante->id,
            'docente_id' => $this->docente->id,
            'sillon_id' => $this->sillon->id,
            'fecha_hora_inicio' => Carbon::tomorrow()->setHour(15)->setMinute(0),
            'fecha_hora_fin' => Carbon::tomorrow()->setHour(16)->setMinute(0),
            'duracion_estimada_minutos' => 60,
            'motivo' => 'Periodoncia Fase 1',
            'estado' => 'programada',
        ]);

        $response = $this->actingAs($this->estudiante)->post(route('citas.recordatorio', $cita->id), [
            'canal' => 'whatsapp',
        ]);

        $response->assertSessionHasNoErrors();
        $cita->refresh();

        $this->assertTrue($cita->recordatorio_enviado);
        $this->assertEquals('whatsapp', $cita->recordatorio_canal);
        $this->assertStringContainsString('Clínica Odontológica UNIFRANZ', $cita->recordatorio_mensaje);
    }
}
