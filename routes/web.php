<?php

use App\Http\Controllers\AsignacionController;
use App\Http\Controllers\CitaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HistoriaClinicaController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PlanTratamientoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Central intelligent dispatcher
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

// Protected role-based dashboard routes
Route::middleware(['auth'])->group(function () {
    // Admin & Director
    Route::get('/admin/dashboard', [DashboardController::class, 'admin'])
        ->middleware('role:admin,director_clinica')
        ->name('admin.dashboard');

    // Docente
    Route::get('/docente/dashboard', [DashboardController::class, 'docente'])
        ->middleware('role:docente,admin,director_clinica')
        ->name('docente.dashboard');

    // Estudiante
    Route::get('/estudiante/dashboard', [DashboardController::class, 'estudiante'])
        ->middleware('role:estudiante,admin')
        ->name('estudiante.dashboard');

    // Personal de Admisión
    Route::get('/admision/dashboard', [DashboardController::class, 'admision'])
        ->middleware('role:admision,admin')
        ->name('admision.dashboard');

    // Paciente
    Route::get('/paciente/dashboard', [DashboardController::class, 'paciente'])
        ->middleware('role:paciente,admin')
        ->name('paciente.dashboard');

    // --- MÓDULO DE PACIENTES ---
    Route::middleware('role:admin,director_clinica,docente,estudiante,admision')->group(function () {
        Route::get('/pacientes', [PacienteController::class, 'index'])->name('pacientes.index');
        Route::get('/pacientes/buscar-rapido', [PacienteController::class, 'buscarRapido'])->name('pacientes.buscar-rapido');
        Route::get('/pacientes/crear', [PacienteController::class, 'create'])->name('pacientes.create');
        Route::post('/pacientes', [PacienteController::class, 'store'])->name('pacientes.store');
        Route::get('/pacientes/{id}', [PacienteController::class, 'show'])->name('pacientes.show');
        Route::put('/pacientes/{id}', [PacienteController::class, 'update'])->name('pacientes.update');
        Route::delete('/pacientes/{id}', [PacienteController::class, 'destroy'])->name('pacientes.destroy');
        Route::post('/pacientes/{id}/consentimiento', [PacienteController::class, 'guardarConsentimiento'])->name('pacientes.consentimiento.guardar');
        Route::post('/pacientes/{id}/documento-ci', [PacienteController::class, 'subirDocumentoCi'])->name('pacientes.documento-ci.subir');
        Route::post('/pacientes/{id}/antecedentes', [PacienteController::class, 'guardarAntecedentes'])->name('pacientes.antecedentes.guardar');
        Route::post('/pacientes/{id}/tratamientos/evidencias', [PacienteController::class, 'subirEvidenciaTratamiento'])->name('pacientes.tratamientos.subir-evidencia');
        Route::post('/pacientes/{id}/periodontograma', [PacienteController::class, 'guardarPeriodontograma'])->name('pacientes.periodontograma.guardar');
        Route::get('/pacientes/{id}/periodontograma', [PacienteController::class, 'obtenerPeriodontograma'])->name('pacientes.periodontograma.obtener');
        Route::post('/pacientes/{id}/asignar-estudiante', [PacienteController::class, 'asignarEstudiante'])->name('pacientes.asignar-estudiante');

        // --- MÓDULO DE HISTORIAS CLÍNICAS (HC-001) ---
        Route::get('/historias-clinicas', [HistoriaClinicaController::class, 'index'])->name('historias-clinicas.index');
        Route::get('/historias-clinicas/crear', [HistoriaClinicaController::class, 'create'])->name('historias-clinicas.create');
        Route::post('/historias-clinicas', [HistoriaClinicaController::class, 'store'])->name('historias-clinicas.store');
        Route::get('/historias-clinicas/{id}', [HistoriaClinicaController::class, 'show'])->name('historias-clinicas.show');
        Route::put('/historias-clinicas/{id}', [HistoriaClinicaController::class, 'update'])->name('historias-clinicas.update');
        Route::match(['post', 'patch'], '/historias-clinicas/{id}/estado', [HistoriaClinicaController::class, 'cambiarEstado'])->name('historias-clinicas.estado');

        // --- MÓDULO 3: PLANES DE TRATAMIENTO, PROCEDIMIENTOS Y REMISIONES ---
        Route::get('/aranceles/catalogo', [PlanTratamientoController::class, 'aranceles'])->name('aranceles.catalogo');
        Route::post('/pacientes/{id}/planes-tratamiento', [PlanTratamientoController::class, 'store'])->name('planes-tratamiento.store');
        Route::post('/planes-tratamiento/{id}/validar-docente', [PlanTratamientoController::class, 'validarDocente'])->name('planes-tratamiento.validar-docente');
        Route::post('/planes-tratamiento/{id}/aceptar-paciente', [PlanTratamientoController::class, 'aceptarPaciente'])->name('planes-tratamiento.aceptar-paciente');
        Route::post('/planes-tratamiento/{plan_id}/fases/{fase_id}/actualizar', [PlanTratamientoController::class, 'actualizarProcedimiento'])->name('planes-tratamiento.fases.actualizar');
        Route::post('/planes-tratamiento/{id}/alta-clinica', [PlanTratamientoController::class, 'altaClinica'])->name('planes-tratamiento.alta-clinica');
        Route::post('/pacientes/{id}/remisiones', [PlanTratamientoController::class, 'crearRemision'])->name('remisiones.store');
        Route::post('/remisiones/{id}/resolver', [PlanTratamientoController::class, 'resolverRemision'])->name('remisiones.resolver');
        Route::post('/pacientes/{id}/transferir-estudiante-formal', [PlanTratamientoController::class, 'transferirPaciente'])->name('pacientes.transferir-formal');
        Route::get('/tratamientos/reportes-produccion', [PlanTratamientoController::class, 'reportesProduccion'])->name('tratamientos.reportes-produccion');

        // --- MÓDULO 4: AGENDAMIENTO DE CITAS, SALA DE ESPERA Y PROTOCOLO DE ABANDONO ---
        Route::get('/citas', [CitaController::class, 'index'])->name('citas.index');
        Route::post('/citas', [CitaController::class, 'store'])->name('citas.store');
        Route::post('/citas/{id}/check-in', [CitaController::class, 'checkIn'])->name('citas.check-in');
        Route::post('/citas/{id}/iniciar-atencion', [CitaController::class, 'iniciarAtencion'])->name('citas.iniciar-atencion');
        Route::post('/citas/{id}/completar', [CitaController::class, 'completar'])->name('citas.completar');
        Route::post('/citas/{id}/no-asistio', [CitaController::class, 'marcarNoAsistio'])->name('citas.no-asistio');
        Route::post('/citas/{id}/cancelar', [CitaController::class, 'cancelar'])->name('citas.cancelar');
        Route::post('/citas/{id}/recordatorio', [CitaController::class, 'enviarRecordatorio'])->name('citas.recordatorio');
        Route::post('/citas/alta-abandono', [CitaController::class, 'darAltaAbandono'])->name('citas.alta-abandono');
        Route::post('/citas/configuracion', [CitaController::class, 'guardarConfiguracion'])->name('citas.configuracion');
    });

    // --- MÓDULO DE ASIGNACIÓN CLÍNICA (ESTUDIANTES <-> PACIENTES) ---
    Route::middleware('role:admin,director_clinica,docente,admision')->group(function () {
        Route::get('/asignaciones', [AsignacionController::class, 'index'])->name('asignaciones.index');
        Route::post('/asignaciones/asignar', [AsignacionController::class, 'asignar'])->name('asignaciones.asignar');
        Route::post('/asignaciones/desasignar', [AsignacionController::class, 'desasignar'])->name('asignaciones.desasignar');
        Route::post('/asignaciones/asignar-masivo', [AsignacionController::class, 'asignarMasivo'])->name('asignaciones.asignar-masivo');
    });

    // --- MÓDULO DE GESTIÓN DE USUARIOS (CRUD COMPLETO) ---
    Route::middleware('role:admin,director_clinica')->group(function () {
        Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
        Route::get('/usuarios/crear', [UserController::class, 'create'])->name('usuarios.create');
        Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
        Route::get('/usuarios/{id}/editar', [UserController::class, 'edit'])->name('usuarios.edit');
        Route::put('/usuarios/{id}', [UserController::class, 'update'])->name('usuarios.update');
        Route::patch('/usuarios/{id}/toggle-active', [UserController::class, 'toggleActive'])->name('usuarios.toggle-active');
        Route::delete('/usuarios/{id}', [UserController::class, 'destroy'])->name('usuarios.destroy');
    });

    // Profile management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Clinical mutation endpoint protected by CheckClinicalShift middleware
    Route::post('/clinica/registro-atencion', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'Registro clínico autorizado y procesado.',
            'timestamp' => now()->toIso8601String(),
        ]);
    })->middleware('clinical.shift')->name('clinica.registro');
});

require __DIR__.'/auth.php';
