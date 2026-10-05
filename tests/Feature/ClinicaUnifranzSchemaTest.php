<?php

use App\Models\AuditoriaLog;
use App\Models\Cita;
use App\Models\HistoriaClinica;
use App\Models\Odontograma;
use App\Models\Paciente;
use App\Models\Periodontograma;
use App\Models\PlanTratamiento;
use App\Models\Role;
use App\Models\Sillon;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('database seeder generates all required roles and test users', function () {
    $this->seed(DatabaseSeeder::class);

    // 1. Roles indispensables
    $requiredRoles = ['admin', 'director_clinica', 'docente', 'estudiante', 'admision', 'paciente'];
    foreach ($requiredRoles as $slug) {
        expect(Role::where('slug', $slug)->exists())->toBeTrue();
    }

    // 2. Usuarios de prueba por rol
    $admin = User::where('email', 'admin@unifranz.edu.bo')->first();
    expect($admin)->not->toBeNull();
    expect($admin->hasRole('admin'))->toBeTrue();

    $docente = User::where('email', 'docente@unifranz.edu.bo')->first();
    expect($docente)->not->toBeNull();
    expect($docente->hasRole('docente'))->toBeTrue();

    $estudiante = User::where('email', 'estudiante@unifranz.edu.bo')->first();
    expect($estudiante)->not->toBeNull();
    expect($estudiante->hasRole('estudiante'))->toBeTrue();
});

test('sillones catalog is populated with capacity control units', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Sillon::count())->toBeGreaterThanOrEqual(8);
    $sillon1 = Sillon::where('codigo', 'SIL-01')->first();
    expect($sillon1)->not->toBeNull();
    expect($sillon1->estado)->toBe('disponible');
    expect($sillon1->activo)->toBeTrue();
});

test('clinical records support native JSONB structures for odontogram and periodontogram', function () {
    $this->seed(DatabaseSeeder::class);

    // Paciente demográfico
    $paciente = Paciente::where('ci', '8492014')->first();
    expect($paciente)->not->toBeNull();
    expect($paciente->nombre_completo)->toBe('Juan Carlos Pérez Mamani');

    // Historia Clínica HC-001
    $historia = HistoriaClinica::where('numero_expediente', 'HC-001-2026-0001')->first();
    expect($historia)->not->toBeNull();
    expect($historia->estado)->toBe('aprobada');

    // Odontograma JSONB
    $odontograma = Odontograma::where('historia_clinica_id', $historia->id)->first();
    expect($odontograma)->not->toBeNull();
    expect($odontograma->hallazgos_piezas)->toBeArray();
    expect($odontograma->hallazgos_piezas)->toHaveKey('46');
    expect(in_array($odontograma->hallazgos_piezas['46']['estado'], ['cariado', 'obturado']))->toBeTrue();

    // Periodontograma JSONB
    $periodontograma = Periodontograma::where('historia_clinica_id', $historia->id)->first();
    expect($periodontograma)->not->toBeNull();
    expect($periodontograma->mediciones_periodontales)->toBeArray();
    expect((float) $periodontograma->indice_placa_porcentaje)->toBeGreaterThan(0);

    // Plan de tratamiento y fases
    $plan = PlanTratamiento::where('historia_clinica_id', $historia->id)->first();
    expect($plan)->not->toBeNull();
    expect($plan->fases()->count())->toBeGreaterThanOrEqual(2);

    // Auditoría Log inmutable con JSONB diff
    $log = AuditoriaLog::where('tabla', 'historias_clinicas')->first();
    expect($log)->not->toBeNull();
    expect($log->payload_diff)->toBeArray();
    expect($log->payload_diff)->toHaveKey('nuevo');
});

test('soft deletes work properly on patients and clinical histories', function () {
    $this->seed(DatabaseSeeder::class);

    $paciente = Paciente::where('ci', '8492014')->first();
    $pacienteId = $paciente->id;

    $paciente->delete();

    expect(Paciente::find($pacienteId))->toBeNull();
    expect(Paciente::withTrashed()->find($pacienteId))->not->toBeNull();
    expect(Paciente::withTrashed()->find($pacienteId)->trashed())->toBeTrue();
});
