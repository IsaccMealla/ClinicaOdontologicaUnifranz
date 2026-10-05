<?php

use App\Models\AuditoriaLog;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('admin can view users list and crud interface', function () {
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    expect($admin)->not->toBeNull();

    $response = $this->actingAs($admin)->get(route('usuarios.index'));
    $response->assertStatus(200);
});

test('usuarios module strictly excludes paciente role from listings and creation', function () {
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    $rolPaciente = Role::where('slug', 'paciente')->first();

    // 1. Listings do not include users with paciente role
    $response = $this->actingAs($admin)->get(route('usuarios.index'));
    $response->assertStatus(200);
    $usuariosProp = $response->viewData('page')['props']['usuarios']['data'];
    $emails = array_column($usuariosProp, 'email');
    expect($emails)->not->toContain('paciente@unifranz.edu.bo');

    // 2. Roles prop sent to the view does not contain 'paciente'
    $rolesProp = $response->viewData('page')['props']['roles'];
    $roleSlugs = array_column(is_array($rolesProp) ? $rolesProp : $rolesProp->toArray(), 'slug');
    expect($roleSlugs)->not->toContain('paciente');

    // 3. Trying to create a user with paciente role fails validation
    $this->actingAs($admin)->post(route('usuarios.store'), [
        'name' => 'Intento Paciente En Usuarios',
        'email' => 'paciente_en_usuarios@unifranz.edu.bo',
        'password' => 'password123',
        'rol_id' => $rolPaciente->id,
    ])->assertSessionHasErrors('rol_id');
});

test('non-admin users cannot access users crud', function () {
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $this->actingAs($docente)->get(route('usuarios.index'))->assertStatus(403);
    $this->actingAs($estudiante)->get(route('usuarios.index'))->assertStatus(403);
});

test('admin can create and toggle active status of a user', function () {
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    $rolDocente = Role::where('slug', 'docente')->first();

    $response = $this->actingAs($admin)->post(route('usuarios.store'), [
        'name' => 'Dr. Marcelo Quiroga Santa Cruz',
        'email' => 'mquiroga@unifranz.edu.bo',
        'password' => 'secret12345',
        'rol_id' => $rolDocente->id,
        'codigo_institucional' => 'DOC-9901',
        'telefono' => '71122334',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('usuarios.index'));

    $nuevoUsuario = User::where('email', 'mquiroga@unifranz.edu.bo')->first();
    expect($nuevoUsuario)->not->toBeNull();
    expect($nuevoUsuario->is_active)->toBeTrue();

    // Toggle active status
    $toggleResponse = $this->actingAs($admin)->patch(route('usuarios.toggle-active', $nuevoUsuario->id));
    $toggleResponse->assertRedirect();

    $nuevoUsuario->refresh();
    expect($nuevoUsuario->is_active)->toBeFalse();
});

test('docente and admin can access asignaciones module', function () {
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $this->actingAs($admin)->get(route('asignaciones.index'))->assertStatus(200);
    $this->actingAs($docente)->get(route('asignaciones.index'))->assertStatus(200);
    $this->actingAs($estudiante)->get(route('asignaciones.index'))->assertStatus(403);
});

test('docente can assign and unassign a patient to a student', function () {
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $paciente = Paciente::create([
        'ci' => '77889900',
        'nombres' => 'Juana',
        'apellido_paterno' => 'Azurduy',
        'apellido_materno' => 'Bermúdez',
        'fecha_nacimiento' => '1995-07-12',
        'sexo' => 'F',
        'estudiante_asignado_id' => null,
    ]);

    // Asignar al estudiante
    $asignarResponse = $this->actingAs($docente)->post(route('asignaciones.asignar'), [
        'paciente_id' => $paciente->id,
        'estudiante_id' => $estudiante->id,
        'motivo' => 'Asignación para práctica clínica IV',
    ]);

    $asignarResponse->assertRedirect();
    $paciente->refresh();
    expect($paciente->estudiante_asignado_id)->toBe($estudiante->id);

    // Desasignar paciente
    $desasignarResponse = $this->actingAs($docente)->post(route('asignaciones.desasignar'), [
        'paciente_id' => $paciente->id,
        'motivo' => 'Fin de rotación clínica',
    ]);

    $desasignarResponse->assertRedirect();
    $paciente->refresh();
    expect($paciente->estudiante_asignado_id)->toBeNull();
});

test('student can only see their assigned patients in pacientes module', function () {
    $estudiante1 = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $estudiante2 = User::create([
        'name' => 'Otro Estudiante',
        'email' => 'otro_estudiante@unifranz.edu.bo',
        'password' => bcrypt('password'),
        'rol_id' => $estudiante1->rol_id,
        'is_active' => true,
    ]);

    $pacienteAsignado = Paciente::create([
        'ci' => '11111111',
        'nombres' => 'Paciente',
        'apellido_paterno' => 'Asignado',
        'fecha_nacimiento' => '2000-01-01',
        'sexo' => 'M',
        'estudiante_asignado_id' => $estudiante1->id,
    ]);

    $pacienteAjeno = Paciente::create([
        'ci' => '22222222',
        'nombres' => 'Paciente',
        'apellido_paterno' => 'DeOtroEstudiante',
        'fecha_nacimiento' => '2001-02-02',
        'sexo' => 'F',
        'estudiante_asignado_id' => $estudiante2->id,
    ]);

    // Estudiante 1 puede ver el expediente de su paciente asignado
    $this->actingAs($estudiante1)
        ->get(route('pacientes.show', $pacienteAsignado->id))
        ->assertStatus(200);

    // Estudiante 1 es bloqueado con 403 al intentar acceder al paciente del Estudiante 2
    $this->actingAs($estudiante1)
        ->get(route('pacientes.show', $pacienteAjeno->id))
        ->assertStatus(403);

    // Estudiante 1 no puede modificar datos del paciente ajeno
    $this->actingAs($estudiante1)
        ->put(route('pacientes.update', $pacienteAjeno->id), [
            'ci' => '22222222',
            'nombres' => 'Intento Hack',
            'apellido_paterno' => 'DeOtroEstudiante',
            'fecha_nacimiento' => '2001-02-02',
            'sexo' => 'F',
        ])
        ->assertStatus(403);
});
