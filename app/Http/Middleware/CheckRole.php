<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            abort(403, 'Acceso denegado: Usuario no autenticado o inactivo.');
        }

        $userRole = $user->rol?->slug;

        if (! empty($roles) && ! in_array($userRole, $roles, true)) {
            abort(403, 'Acceso denegado: No cuenta con el rol requerido para acceder a este módulo.');
        }

        return $next($request);
    }
}
