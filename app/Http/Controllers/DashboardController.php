<?php

namespace App\Http\Controllers;

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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dispatch user to their role-specific dashboard.
     */
    public function index(Request $request): RedirectResponse|Response
    {
        $user = $request->user();
        $roleSlug = $user->rol?->slug;

        return match ($roleSlug) {
            'admin', 'director_clinica' => redirect()->route('admin.dashboard'),
            'docente' => redirect()->route('docente.dashboard'),
            'estudiante' => redirect()->route('estudiante.dashboard'),
            'admision' => redirect()->route('admision.dashboard'),
            'paciente' => redirect()->route('paciente.dashboard'),
            default => Inertia::render('Dashboard'),
        };
    }

    /**
     * Admin and Clinic Director Dashboard.
     */
    public function admin(): Response
    {
        $metrics = [
            'totalPacientes' => Paciente::count(),
            'alertasAbandono' => Paciente::where('alerta_abandono', true)->count(),
            'totalSillones' => Sillon::where('activo', true)->count(),
            'sillonesDisponibles' => Sillon::where('estado', 'disponible')->count(),
            'sillonesMantenimiento' => Sillon::where('estado', 'en_mantenimiento')->count(),
            'citasHoy' => Cita::whereDate('fecha_hora_inicio', today())->count(),
            'citasTotal' => Cita::count(),
            'estudiantesActivos' => User::whereHas('rol', fn ($q) => $q->where('slug', 'estudiante'))->where('is_active', true)->count(),
            'docentesActivos' => User::whereHas('rol', fn ($q) => $q->where('slug', 'docente'))->where('is_active', true)->count(),
        ];

        $sillones = Sillon::where('activo', true)->orderBy('codigo')->get();
        $auditoriasRecientes = AuditoriaLog::with('user:id,name,email')->latest('created_at')->limit(5)->get();

        return Inertia::render('Dashboards/AdminDashboard', [
            'metrics' => $metrics,
            'sillones' => $sillones,
            'auditorias' => $auditoriasRecientes,
        ]);
    }

    /**
     * Docente Dashboard - Approval Inbox & Student Supervision.
     */
    public function docente(Request $request): Response
    {
        $docenteId = $request->user()->id;

        // Pending items for review
        $historiasPendientes = HistoriaClinica::with(['paciente:id,nombres,apellido_paterno,apellido_materno,ci', 'estudiante:id,name'])
            ->whereIn('estado', ['en_revision', 'borrador'])
            ->latest()
            ->limit(10)
            ->get();

        $odontogramasPendientes = Odontograma::with(['paciente:id,nombres,apellido_paterno,ci', 'estudiante:id,name'])
            ->whereIn('estado_aprobacion', ['en_revision', 'borrador'])
            ->latest()
            ->limit(10)
            ->get();

        $fasesPendientes = TratamientoFase::with(['planTratamiento.paciente:id,nombres,apellido_paterno', 'planTratamiento.estudiante:id,name'])
            ->whereIn('estado', ['revision_solicitada', 'en_ejecucion'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Dashboards/DocenteDashboard', [
            'historiasPendientes' => $historiasPendientes,
            'odontogramasPendientes' => $odontogramasPendientes,
            'fasesPendientes' => $fasesPendientes,
        ]);
    }

    /**
     * Estudiante Dashboard - Quota Progress & Clinical Shift.
     */
    public function estudiante(Request $request): Response
    {
        $user = $request->user();
        $now = now();

        // Check if student has an active clinical shift right now
        $activeShift = Cita::with(['paciente:id,nombres,apellido_paterno', 'sillon:id,nombre,codigo,sala_clinica'])
            ->where('estudiante_id', $user->id)
            ->whereIn('estado', ['confirmada', 'en_atencion', 'programada'])
            ->where('fecha_hora_inicio', '<=', $now)
            ->where('fecha_hora_fin', '>=', $now)
            ->first();

        // Upcoming appointments
        $proximasCitas = Cita::with(['paciente:id,nombres,apellido_paterno', 'sillon:id,nombre,codigo'])
            ->where('estudiante_id', $user->id)
            ->where('fecha_hora_inicio', '>=', $now)
            ->orderBy('fecha_hora_inicio')
            ->limit(5)
            ->get();

        // Academic tracking & quota progress
        $seguimientos = SeguimientoAcademico::where('estudiante_id', $user->id)->get();

        return Inertia::render('Dashboards/EstudianteDashboard', [
            'activeShift' => $activeShift,
            'proximasCitas' => $proximasCitas,
            'seguimientos' => $seguimientos,
        ]);
    }

    /**
     * Personal Admisión Dashboard - Patient Intake & Chair Management.
     */
    public function admision(): Response
    {
        $sillones = Sillon::where('activo', true)->orderBy('sala_clinica')->orderBy('codigo')->get();

        $citasHoy = Cita::with(['paciente:id,nombres,apellido_paterno,ci,celular', 'estudiante:id,name', 'sillon:id,nombre,codigo'])
            ->whereDate('fecha_hora_inicio', today())
            ->orderBy('fecha_hora_inicio')
            ->get();

        $ultimosPacientes = Paciente::latest()->limit(8)->get();

        return Inertia::render('Dashboards/AdmisionDashboard', [
            'sillones' => $sillones,
            'citasHoy' => $citasHoy,
            'pacientes' => $ultimosPacientes,
        ]);
    }

    /**
     * Paciente Dashboard - Personal Appointments & Clinical History.
     */
    public function paciente(Request $request): Response
    {
        $user = $request->user();
        
        // Find matching patient by email or name
        $paciente = Paciente::where('celular', $user->telefono)
            ->orWhere('ci', $user->codigo_institucional)
            ->first();

        $citas = [];
        $historia = null;

        if ($paciente) {
            $citas = Cita::with('sillon:id,nombre,codigo,sala_clinica')
                ->where('paciente_id', $paciente->id)
                ->orderBy('fecha_hora_inicio', 'desc')
                ->limit(5)
                ->get();

            $historia = HistoriaClinica::where('paciente_id', $paciente->id)->latest()->first();
        }

        return Inertia::render('Dashboards/PacienteDashboard', [
            'paciente' => $paciente,
            'citas' => $citas,
            'historia' => $historia,
        ]);
    }
}
