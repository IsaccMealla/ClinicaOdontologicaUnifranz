<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleAdmin = Role::firstOrCreate(['slug' => 'admin'], [
            'nombre' => 'Administrador',
            'descripcion' => 'Acceso total al sistema, gestión de usuarios, auditoría y configuración general.',
        ]);

        $roleDirector = Role::firstOrCreate(['slug' => 'director_clinica'], [
            'nombre' => 'Director Clínica',
            'descripcion' => 'Supervisión global de actividades clínicas, reportes y control de aforo.',
        ]);

        $roleDocente = Role::firstOrCreate(['slug' => 'docente'], [
            'nombre' => 'Docente',
            'descripcion' => 'Supervisión y aprobación académica de historias clínicas, odontogramas y tratamientos.',
        ]);

        $roleEstudiante = Role::firstOrCreate(['slug' => 'estudiante'], [
            'nombre' => 'Estudiante',
            'descripcion' => 'Registro y ejecución de tratamientos clínicos, historias y odontogramas de pacientes asignados.',
        ]);

        $roleAdmision = Role::firstOrCreate(['slug' => 'admision'], [
            'nombre' => 'Personal Admisión',
            'descripcion' => 'Registro de pacientes, triaje inicial, agenda de citas y asignación de sillones.',
        ]);

        $rolePaciente = Role::firstOrCreate(['slug' => 'paciente'], [
            'nombre' => 'Paciente',
            'descripcion' => 'Consulta de citas programadas e historial clínico personal.',
        ]);

        $defaultPassword = Hash::make('password123');

        $users = [
            [
                'name' => 'Dr. Carlos Mendoza (Admin)',
                'email' => 'admin@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleAdmin->id,
                'codigo_institucional' => 'ADM-001',
                'telefono' => '70011223',
                'is_active' => true,
            ],
            [
                'name' => 'Dra. Patricia Vaca Rivero (Directora)',
                'email' => 'director@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleDirector->id,
                'codigo_institucional' => 'DIR-002',
                'telefono' => '70022334',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Roberto Fernández (Docente)',
                'email' => 'docente@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleDocente->id,
                'codigo_institucional' => 'DOC-010',
                'telefono' => '70033445',
                'is_active' => true,
            ],
            [
                'name' => 'Dra. Valeria Morales Quiroga (Docente)',
                'email' => 'valeria.morales@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleDocente->id,
                'codigo_institucional' => 'DOC-011',
                'telefono' => '71239845',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Rodrigo Salazar Céspedes (Docente)',
                'email' => 'rodrigo.salazar@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleDocente->id,
                'codigo_institucional' => 'DOC-012',
                'telefono' => '72098412',
                'is_active' => true,
            ],
            // Estudiantes Operadores Clínicos
            [
                'name' => 'Gabriela Morales (Estudiante)',
                'email' => 'estudiante@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-10492',
                'telefono' => '70044556',
                'is_active' => true,
            ],
            [
                'name' => 'Mateo Fernández Quispe',
                'email' => 'mateo.fernandez@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-2024-041',
                'telefono' => '76512390',
                'is_active' => true,
            ],
            [
                'name' => 'Sofía Valentina Torrico Paz',
                'email' => 'sofia.torrico@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-2024-089',
                'telefono' => '78901234',
                'is_active' => true,
            ],
            [
                'name' => 'Alejandro Siles Montaño',
                'email' => 'alejandro.siles@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-2024-114',
                'telefono' => '75432198',
                'is_active' => true,
            ],
            [
                'name' => 'Camila Andrea Beltrán Roca',
                'email' => 'camila.beltran@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-2025-042',
                'telefono' => '71190823',
                'is_active' => true,
            ],
            [
                'name' => 'Gabriel Ignacio Mercado Luna',
                'email' => 'gabriel.mercado@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleEstudiante->id,
                'codigo_institucional' => 'EST-2023-019',
                'telefono' => '79812345',
                'is_active' => true,
            ],
            // Personal de Admisión & Triaje
            [
                'name' => 'Mariana Rojas (Admisión)',
                'email' => 'admision@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleAdmision->id,
                'codigo_institucional' => 'ADM-201',
                'telefono' => '70055667',
                'is_active' => true,
            ],
            [
                'name' => 'Lic. Fernando Ugarte Vaca',
                'email' => 'fernando.ugarte@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $roleAdmision->id,
                'codigo_institucional' => 'ADM-202',
                'telefono' => '72233445',
                'is_active' => true,
            ],
            // Paciente de acceso al portal
            [
                'name' => 'Juan Pérez Mamani (Paciente)',
                'email' => 'paciente@unifranz.edu.bo',
                'password' => $defaultPassword,
                'rol_id' => $rolePaciente->id,
                'codigo_institucional' => 'PAC-501',
                'telefono' => '70066778',
                'is_active' => true,
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }
    }
}
