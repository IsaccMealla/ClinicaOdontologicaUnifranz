<?php

use App\Models\Cita;
use App\Models\Paciente;
use App\Models\Role;
use App\Models\Sillon;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('dashboard central dispatcher redirects users to their role specific dashboard', function () {
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    $admision = User::where('email', 'admision@unifranz.edu.bo')->first();
    $paciente = User::where('email', 'paciente@unifranz.edu.bo')->first();

    $this->actingAs($admin)->get('/dashboard')
        ->assertRedirect(route('admin.dashboard'));

    $this->actingAs($docente)->get('/dashboard')
        ->assertRedirect(route('docente.dashboard'));

    $this->actingAs($estudiante)->get('/dashboard')
        ->assertRedirect(route('estudiante.dashboard'));

    $this->actingAs($admision)->get('/dashboard')
        ->assertRedirect(route('admision.dashboard'));

    $this->actingAs($paciente)->get('/dashboard')
        ->assertRedirect(route('paciente.dashboard'));
});

test('unauthorized users receive 403 when accessing protected role routes', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    $paciente = User::where('email', 'paciente@unifranz.edu.bo')->first();

    // Estudiante cannot access admin dashboard
    $this->actingAs($estudiante)->get('/admin/dashboard')
        ->assertStatus(403);

    // Estudiante cannot access docente dashboard
    $this->actingAs($estudiante)->get('/docente/dashboard')
        ->assertStatus(403);

    // Paciente cannot access admision dashboard
    $this->actingAs($paciente)->get('/admision/dashboard')
        ->assertStatus(403);
});

test('authorized users can access their respective dashboards', function () {
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    $this->actingAs($admin)->get('/admin/dashboard')
        ->assertStatus(200);

    $this->actingAs($docente)->get('/docente/dashboard')
        ->assertStatus(200);

    $this->actingAs($estudiante)->get('/estudiante/dashboard')
        ->assertStatus(200);
});

test('clinical shift middleware blocks student mutations outside authorized shift', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    // Delete any active appointments for current time
    Cita::where('estudiante_id', $estudiante->id)->delete();

    // Mutation outside shift must be rejected with 403
    $this->actingAs($estudiante)
        ->post('/clinica/registro-atencion', [
            'procedimiento' => 'Restauración Resina',
        ])
        ->assertStatus(403);
});

test('clinical shift middleware allows student mutations with teacher authorization bypass', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();

    // With explicit teacher authorization query or header
    $this->actingAs($estudiante)
        ->withHeaders(['X-Docente-Auth' => 'DOC-010'])
        ->post('/clinica/registro-atencion', [
            'procedimiento' => 'Restauración Resina',
            'autorizacion_docente' => true,
        ])
        ->assertStatus(200)
        ->assertJson([
            'status' => 'success',
        ]);
});

test('clinical shift middleware allows student mutations during active appointment shift', function () {
    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    $paciente = Paciente::first();
    $sillon = Sillon::first();

    // Create an active appointment happening right now
    Cita::create([
        'paciente_id' => $paciente->id,
        'estudiante_id' => $estudiante->id,
        'sillon_id' => $sillon->id,
        'fecha_hora_inicio' => now()->subMinutes(15),
        'fecha_hora_fin' => now()->addMinutes(45),
        'duracion_estimada_minutos' => 60,
        'motivo' => 'Turno activo de operatoria dental',
        'estado' => 'en_atencion',
    ]);

    // Mutation during active shift must succeed
    $this->actingAs($estudiante)
        ->post('/clinica/registro-atencion', [
            'procedimiento' => 'Restauración Resina',
        ])
        ->assertStatus(200)
        ->assertJson([
            'status' => 'success',
        ]);
});

test('clinical shift middleware does not block non-student roles', function () {
    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();

    $this->actingAs($docente)
        ->post('/clinica/registro-atencion', [
            'procedimiento' => 'Exodoncia realizada por docente',
        ])
        ->assertStatus(200);
});
