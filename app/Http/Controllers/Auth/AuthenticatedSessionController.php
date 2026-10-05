<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $intended = $request->session()->pull('url.intended');
        if ($intended && !str_contains($intended, '/login') && !str_contains($intended, '/register')) {
            return redirect()->to($intended);
        }

        $user = Auth::user();
        $roleSlug = $user->rol?->slug;

        return match ($roleSlug) {
            'admin', 'director_clinica' => redirect()->route('admin.dashboard'),
            'docente' => redirect()->route('docente.dashboard'),
            'estudiante' => redirect()->route('estudiante.dashboard'),
            'admision' => redirect()->route('admision.dashboard'),
            'paciente' => redirect()->route('paciente.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
