<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Total users in database: " . \App\Models\User::count() . PHP_EOL;

foreach (\App\Models\User::with('rol')->get() as $u) {
    $pass123 = \Illuminate\Support\Facades\Hash::check('password123', $u->password) ? 'OK' : 'FAIL';
    $docPass = \Illuminate\Support\Facades\Hash::check('Docente2026!*', $u->password) ? 'OK' : 'FAIL';
    echo sprintf(
        "ID: %d | Email: %s | Rol: %s | Active: %s | 'password123': %s | 'Docente2026!*': %s\n",
        $u->id,
        $u->email,
        $u->rol ? $u->rol->slug : 'SIN ROL',
        $u->is_active ? 'SI' : 'NO',
        $pass123,
        $docPass
    );
}
