<?php

namespace App\Http\Middleware;

use App\Models\Cita;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckClinicalShift
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check only for students performing mutation actions (POST, PUT, PATCH, DELETE)
        if ($user && $user->rol?->slug === 'estudiante' && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            
            // Allow if request has teacher authorization bypass
            $hasDocenteAuth = $request->filled('autorizacion_docente') 
                || $request->header('X-Docente-Auth') 
                || $request->session()->has('docente_override');

            if (! $hasDocenteAuth) {
                $now = now();

                $hasActiveShift = Cita::where('estudiante_id', $user->id)
                    ->whereIn('estado', ['confirmada', 'en_atencion', 'programada'])
                    ->where('fecha_hora_inicio', '<=', $now)
                    ->where('fecha_hora_fin', '>=', $now)
                    ->exists();

                if (! $hasActiveShift) {
                    abort(403, 'Acceso denegado: Los estudiantes únicamente pueden realizar registros clínicos durante su turno asignado o con autorización docente activa.');
                }
            }
        }

        return $next($request);
    }
}
