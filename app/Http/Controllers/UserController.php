<?php

namespace App\Http\Controllers;

use App\Models\AuditoriaLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Listado general de usuarios (docentes, estudiantes, admin, admisión, etc.)
     */
    public function index(Request $request): Response
    {
        $buscar = $request->input('buscar');
        $rolSlug = $request->input('rol');
        $estado = $request->input('estado'); // 'activo', 'inactivo'

        // Excluir rol paciente: los pacientes tienen su módulo clínico independiente
        $query = User::with('rol')
            ->withCount('pacientesAsignados')
            ->whereHas('rol', function ($q) {
                $q->where('slug', '!=', 'paciente');
            })
            ->latest('id');

        if ($buscar) {
            $query->where(function ($q) use ($buscar) {
                $q->where('name', 'ilike', "%{$buscar}%")
                    ->orWhere('email', 'ilike', "%{$buscar}%")
                    ->orWhere('codigo_institucional', 'ilike', "%{$buscar}%");
            });
        }

        if ($rolSlug && $rolSlug !== 'paciente') {
            $query->whereHas('rol', function ($q) use ($rolSlug) {
                $q->where('slug', $rolSlug);
            });
        }

        if ($estado === 'activo') {
            $query->where('is_active', true);
        } elseif ($estado === 'inactivo') {
            $query->where('is_active', false);
        }

        $usuarios = $query->paginate(12)->withQueryString();
        $roles = Role::where('slug', '!=', 'paciente')
            ->select('id', 'nombre', 'slug', 'descripcion')
            ->orderBy('id')
            ->get();

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'filtros' => [
                'buscar' => $buscar,
                'rol' => $rolSlug,
                'estado' => $estado,
            ],
        ]);
    }

    /**
     * Formulario para crear un nuevo usuario.
     */
    public function create(): Response
    {
        $roles = Role::where('slug', '!=', 'paciente')
            ->select('id', 'nombre', 'slug', 'descripcion')
            ->orderBy('id')
            ->get();

        return Inertia::render('Usuarios/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Guarda un nuevo usuario en la base de datos.
     */
    public function store(Request $request): RedirectResponse
    {
        $rolPaciente = Role::where('slug', 'paciente')->first();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'string', 'min:8'],
            'rol_id' => [
                'required',
                'exists:roles,id',
                Rule::notIn($rolPaciente ? [$rolPaciente->id] : []),
            ],
            'codigo_institucional' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ], [
            'rol_id.not_in' => 'Los pacientes se gestionan de forma independiente en el Padrón de Pacientes.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'rol_id' => $validated['rol_id'],
            'codigo_institucional' => $validated['codigo_institucional'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'usuario_creado',
            'tabla' => 'users',
            'registro_id' => $user->id,
            'payload_diff' => [
                'name' => $user->name,
                'email' => $user->email,
                'rol_id' => $user->rol_id,
                'codigo_institucional' => $user->codigo_institucional,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', "Usuario {$user->name} creado exitosamente.");
    }

    /**
     * Formulario para editar un usuario existente.
     */
    public function edit(int $id): Response
    {
        $usuario = User::with('rol')
            ->whereHas('rol', function ($q) {
                $q->where('slug', '!=', 'paciente');
            })
            ->findOrFail($id);

        $roles = Role::where('slug', '!=', 'paciente')
            ->select('id', 'nombre', 'slug', 'descripcion')
            ->orderBy('id')
            ->get();

        return Inertia::render('Usuarios/Edit', [
            'usuario' => $usuario,
            'roles' => $roles,
        ]);
    }

    /**
     * Actualiza los datos del usuario.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $usuario = User::whereHas('rol', function ($q) {
            $q->where('slug', '!=', 'paciente');
        })->findOrFail($id);

        $rolPaciente = Role::where('slug', 'paciente')->first();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'rol_id' => [
                'required',
                'exists:roles,id',
                Rule::notIn($rolPaciente ? [$rolPaciente->id] : []),
            ],
            'codigo_institucional' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ], [
            'rol_id.not_in' => 'Los pacientes se gestionan de forma independiente en el Padrón de Pacientes.',
        ]);

        $datosActualizar = [
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'rol_id' => $validated['rol_id'],
            'codigo_institucional' => $validated['codigo_institucional'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (!empty($validated['password'])) {
            $datosActualizar['password'] = Hash::make($validated['password']);
        }

        $usuario->update($datosActualizar);

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'usuario_actualizado',
            'tabla' => 'users',
            'registro_id' => $usuario->id,
            'payload_diff' => $datosActualizar,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', "Datos de {$usuario->name} actualizados correctamente.");
    }

    /**
     * Alterna el estado activo / inactivo del usuario.
     */
    public function toggleActive(Request $request, int $id): RedirectResponse
    {
        $usuario = User::findOrFail($id);

        if ($usuario->id === Auth::id()) {
            return back()->with('error', 'No puedes desactivar tu propia cuenta en sesión.');
        }

        $usuario->is_active = !$usuario->is_active;
        $usuario->save();

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => $usuario->is_active ? 'usuario_activado' : 'usuario_desactivado',
            'tabla' => 'users',
            'registro_id' => $usuario->id,
            'payload_diff' => ['is_active' => $usuario->is_active],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        $estadoTexto = $usuario->is_active ? 'activado' : 'desactivado';
        return back()->with('success', "Usuario {$usuario->name} {$estadoTexto}.");
    }

    /**
     * Elimina el usuario del sistema.
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $usuario = User::findOrFail($id);

        if ($usuario->id === Auth::id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta en sesión.');
        }

        if ($usuario->email === 'admin@unifranz.edu.bo') {
            return back()->with('error', 'La cuenta administrativa principal no puede ser eliminada.');
        }

        // Si tiene pacientes asignados, desasignar antes de eliminar
        $usuario->pacientesAsignados()->update(['estudiante_asignado_id' => null]);

        $nombre = $usuario->name;
        $usuario->delete();

        AuditoriaLog::create([
            'user_id' => Auth::id(),
            'accion' => 'usuario_eliminado',
            'tabla' => 'users',
            'registro_id' => $id,
            'payload_diff' => ['nombre' => $nombre],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', "Usuario {$nombre} eliminado del sistema.");
    }
}
