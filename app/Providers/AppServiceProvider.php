<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // RBAC Gates
        Gate::define('access-admin', function (User $user) {
            return in_array($user->rol?->slug, ['admin', 'director_clinica']);
        });

        Gate::define('access-director', function (User $user) {
            return $user->rol?->slug === 'director_clinica';
        });

        Gate::define('access-docente', function (User $user) {
            return in_array($user->rol?->slug, ['docente', 'admin', 'director_clinica']);
        });

        Gate::define('access-estudiante', function (User $user) {
            return $user->rol?->slug === 'estudiante';
        });

        Gate::define('access-admision', function (User $user) {
            return in_array($user->rol?->slug, ['admision', 'admin']);
        });

        Gate::define('access-paciente', function (User $user) {
            return $user->rol?->slug === 'paciente';
        });

        // Clinical Action Gates
        Gate::define('aprobar-clinica', function (User $user) {
            return in_array($user->rol?->slug, ['docente', 'director_clinica', 'admin']);
        });

        Gate::define('modificar-odontograma', function (User $user) {
            return in_array($user->rol?->slug, ['estudiante', 'docente', 'admin']);
        });
    }
}
