<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        if (app()->runningUnitTests() || env('APP_ENV') === 'testing' || (isset($_SERVER['APP_ENV']) && $_SERVER['APP_ENV'] === 'testing')) {
            $middleware->validateCsrfTokens(except: ['*']);
        }

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'clinical.shift' => \App\Http\Middleware\CheckClinicalShift::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
