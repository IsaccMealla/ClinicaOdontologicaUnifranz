<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'slug' => 'admin',
                'descripcion' => 'Acceso total al sistema, gestión de usuarios, auditoría y configuración general.',
            ],
            [
                'nombre' => 'Director Clínica',
                'slug' => 'director_clinica',
                'descripcion' => 'Supervisión global de actividades clínicas, reportes y control de aforo.',
            ],
            [
                'nombre' => 'Docente',
                'slug' => 'docente',
                'descripcion' => 'Supervisión y aprobación académica de historias clínicas, odontogramas y tratamientos.',
            ],
            [
                'nombre' => 'Estudiante',
                'slug' => 'estudiante',
                'descripcion' => 'Registro y ejecución de tratamientos clínicos, historias y odontogramas de pacientes asignados.',
            ],
            [
                'nombre' => 'Personal Admisión',
                'slug' => 'admision',
                'descripcion' => 'Registro de pacientes, triaje inicial, agenda de citas y asignación de sillones.',
            ],
            [
                'nombre' => 'Paciente',
                'slug' => 'paciente',
                'descripcion' => 'Consulta de citas programadas e historial clínico personal.',
            ],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['slug' => $r['slug']], $r);
        }

        $permisos = [
            // Pacientes
            ['nombre' => 'Ver Pacientes', 'slug' => 'pacientes.ver', 'modulo' => 'pacientes'],
            ['nombre' => 'Crear Pacientes', 'slug' => 'pacientes.crear', 'modulo' => 'pacientes'],
            ['nombre' => 'Editar Pacientes', 'slug' => 'pacientes.editar', 'modulo' => 'pacientes'],
            // Historias Clínicas
            ['nombre' => 'Crear Historia Clínica', 'slug' => 'historias.crear', 'modulo' => 'historias'],
            ['nombre' => 'Aprobar Historia Clínica', 'slug' => 'historias.aprobar', 'modulo' => 'historias'],
            // Odontogramas
            ['nombre' => 'Registrar Odontograma', 'slug' => 'odontogramas.crear', 'modulo' => 'odontogramas'],
            ['nombre' => 'Aprobar Odontograma', 'slug' => 'odontogramas.aprobar', 'modulo' => 'odontogramas'],
            // Periodontogramas
            ['nombre' => 'Registrar Periodontograma', 'slug' => 'periodontogramas.crear', 'modulo' => 'periodontogramas'],
            ['nombre' => 'Aprobar Periodontograma', 'slug' => 'periodontogramas.aprobar', 'modulo' => 'periodontogramas'],
            // Citas y Sillones
            ['nombre' => 'Gestionar Citas', 'slug' => 'citas.gestionar', 'modulo' => 'citas'],
            ['nombre' => 'Gestionar Sillones', 'slug' => 'sillones.gestionar', 'modulo' => 'sillones'],
            // Académico y Auditoría
            ['nombre' => 'Evaluar Estudiantes', 'slug' => 'academico.evaluar', 'modulo' => 'academico'],
            ['nombre' => 'Consultar Auditoría', 'slug' => 'auditoria.consultar', 'modulo' => 'auditoria'],
        ];

        foreach ($permisos as $p) {
            Permission::firstOrCreate(['slug' => $p['slug']], $p);
        }

        // Asignar todos los permisos a admin y director
        $adminRole = Role::where('slug', 'admin')->first();
        $directorRole = Role::where('slug', 'director_clinica')->first();
        $allPermissions = Permission::all();
        $adminRole->permisos()->sync($allPermissions->pluck('id'));
        $directorRole->permisos()->sync($allPermissions->pluck('id'));

        // Permisos para docente
        $docenteRole = Role::where('slug', 'docente')->first();
        $docentePermissions = Permission::whereIn('slug', [
            'pacientes.ver', 'historias.aprobar', 'odontogramas.aprobar',
            'periodontogramas.aprobar', 'citas.gestionar', 'academico.evaluar'
        ])->get();
        $docenteRole->permisos()->sync($docentePermissions->pluck('id'));

        // Permisos para estudiante
        $estudianteRole = Role::where('slug', 'estudiante')->first();
        $estudiantePermissions = Permission::whereIn('slug', [
            'pacientes.ver', 'historias.crear', 'odontogramas.crear',
            'periodontogramas.crear', 'citas.gestionar'
        ])->get();
        $estudianteRole->permisos()->sync($estudiantePermissions->pluck('id'));

        // Permisos para personal admisión
        $admisionRole = Role::where('slug', 'admision')->first();
        $admisionPermissions = Permission::whereIn('slug', [
            'pacientes.ver', 'pacientes.crear', 'pacientes.editar',
            'citas.gestionar', 'sillones.gestionar'
        ])->get();
        $admisionRole->permisos()->sync($admisionPermissions->pluck('id'));
    }
}
