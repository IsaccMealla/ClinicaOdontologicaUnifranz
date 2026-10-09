<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Catálogo Central de Cupos Obligatorios por Asignatura Clínica
        if (!Schema::hasTable('asignaturas_cupos_requisitos')) {
            Schema::create('asignaturas_cupos_requisitos', function (Blueprint $table) {
                $table->id();
                $table->string('asignatura', 150)->index();
                $table->string('semestre', 30)->nullable();
                $table->string('procedimiento_clave', 200)->index();
                $table->integer('cupos_minimos')->default(2);
                $table->text('descripcion')->nullable();
                $table->boolean('activo')->default(true)->index();
                $table->timestamps();

                $table->unique(['asignatura', 'procedimiento_clave'], 'unique_asignatura_procedimiento');
            });

            // Seed inicial de cupos estándar Odontología UNIFRANZ
            DB::table('asignaturas_cupos_requisitos')->insert([
                [
                    'asignatura' => 'Endodoncia I',
                    'semestre' => '6to Semestre',
                    'procedimiento_clave' => 'Tratamiento de Conducto en Sector Anterior',
                    'cupos_minimos' => 2,
                    'descripcion' => 'Apertura, conductometría, instrumentación y obturación en dientes anteriores.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'asignatura' => 'Endodoncia I',
                    'semestre' => '6to Semestre',
                    'procedimiento_clave' => 'Tratamiento de Conducto en Premolar',
                    'cupos_minimos' => 2,
                    'descripcion' => 'Tratamiento birradicular o unirradicular premolar.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'asignatura' => 'Operatoria Dental II',
                    'semestre' => '5to Semestre',
                    'procedimiento_clave' => 'Restauración Estética con Resina Clase II',
                    'cupos_minimos' => 5,
                    'descripcion' => 'Reconstrucción proximal con matriz seccional y estratificación.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'asignatura' => 'Periodoncia II',
                    'semestre' => '6to Semestre',
                    'procedimiento_clave' => 'Raspado y Alisado Radicular por Cuadrante',
                    'cupos_minimos' => 4,
                    'descripcion' => 'Terapia periodontal básica manual y ultrasónica.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'asignatura' => 'Cirugía Bucal I',
                    'semestre' => '6to Semestre',
                    'procedimiento_clave' => 'Exodoncia Simple de Pieza Erupcionada',
                    'cupos_minimos' => 4,
                    'descripcion' => 'Sindesmotomía, luxación y prensión atraumática con fórceps.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'asignatura' => 'Prótesis Fija',
                    'semestre' => '7mo Semestre',
                    'procedimiento_clave' => 'Corona Individual Metal-Porcelana / Zirconio',
                    'cupos_minimos' => 2,
                    'descripcion' => 'Tallado con línea de terminación chamfer, provisional e impresión.',
                    'activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // 2. Flujo de Supervisión Clínica Obligatoria (Solicitudes Digitales y Firmas)
        if (!Schema::hasTable('supervision_solicitudes')) {
            Schema::create('supervision_solicitudes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('docente_id')->constrained('users')->restrictOnDelete();
                $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
                $table->foreignId('historia_clinica_id')->nullable()->constrained('historias_clinicas')->nullOnDelete();
                $table->foreignId('plan_tratamiento_id')->nullable()->constrained('planes_tratamiento')->nullOnDelete();
                $table->foreignId('tratamiento_fase_id')->nullable()->constrained('tratamiento_fases')->nullOnDelete();
                $table->foreignId('sillon_id')->nullable()->constrained('sillones')->nullOnDelete();
                
                $table->string('asignatura', 150)->index();
                // Hitos obligatorios: diagnostico_pdt, inicio_procedimiento_critico, cierre_alta_tecnica
                $table->string('tipo_hito', 60)->index();
                $table->string('procedimiento', 255);
                $table->string('pieza_dental', 30)->nullable();
                
                // Estado: pendiente, aprobado, rechazado
                $table->string('estado', 30)->default('pendiente')->index();
                $table->text('comentarios_estudiante')->nullable();
                $table->text('comentarios_docente')->nullable();
                
                // Firma electrónica de responsabilidad clínica y trazabilidad
                $table->jsonb('firma_digital')->nullable();
                
                // Rúbrica de evaluación clínica (bioseguridad, destreza, criterio, trato_paciente, nota_final)
                $table->jsonb('evaluacion_rubrica')->nullable();
                
                $table->timestampTz('solicitado_at');
                $table->timestampTz('respondido_at')->nullable();
                $table->timestampsTz();

                $table->index(['estudiante_id', 'asignatura']);
                $table->index(['docente_id', 'estado']);
                $table->index(['paciente_id', 'estado']);
            });
        }

        // 3. Alertas Tempranas de Bajo Desempeño Clínico
        if (!Schema::hasTable('alertas_bajo_desempeno')) {
            Schema::create('alertas_bajo_desempeno', function (Blueprint $table) {
                $table->id();
                $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('docente_id')->constrained('users')->restrictOnDelete();
                $table->string('asignatura', 150)->index();
                // bioseguridad, destreza_manual, rendimiento_teorico, manejo_paciente, puntualidad
                $table->string('motivo_categoria', 80)->index();
                $table->text('motivo_detallado');
                $table->text('medidas_sugeridas')->nullable()->comment('Tutoría, simulador fantoma, refuerzo');
                $table->string('estado', 30)->default('activa')->index()->comment('activa, en_seguimiento, resuelta');
                $table->text('resolucion_coordinacion')->nullable();
                $table->timestampsTz();

                $table->index(['estudiante_id', 'estado']);
            });
        }

        // 4. Programación de Supervisión Docente por Horario / Turno / Gabinetes
        if (!Schema::hasTable('supervision_programaciones')) {
            Schema::create('supervision_programaciones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('docente_id')->constrained('users')->cascadeOnDelete();
                $table->string('asignatura', 150);
                $table->string('dia_semana', 30)->comment('Lunes, Martes, Miércoles, Jueves, Viernes, Sábado');
                $table->string('turno', 30)->comment('Mañana (08:00-12:00), Tarde (14:00-18:00)');
                $table->string('sala_clinica', 100)->nullable();
                $table->text('gabinetes_asignados')->nullable()->comment('Ej: SIL-01 a SIL-08');
                $table->boolean('activo')->default(true);
                $table->timestampsTz();

                $table->index(['docente_id', 'dia_semana']);
            });

            // Seed inicial de programación de turnos
            $docenteUser = DB::table('users')->where('email', 'like', '%docente%')->first();
            if ($docenteUser) {
                DB::table('supervision_programaciones')->insert([
                    [
                        'docente_id' => $docenteUser->id,
                        'asignatura' => 'Endodoncia I',
                        'dia_semana' => 'Lunes',
                        'turno' => 'Mañana (08:00 - 12:00)',
                        'sala_clinica' => 'Clínica Integral A',
                        'gabinetes_asignados' => 'SIL-01 a SIL-05',
                        'activo' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'docente_id' => $docenteUser->id,
                        'asignatura' => 'Operatoria Dental II',
                        'dia_semana' => 'Miércoles',
                        'turno' => 'Tarde (14:00 - 18:00)',
                        'sala_clinica' => 'Clínica Integral B',
                        'gabinetes_asignados' => 'SIL-06 a SIL-10',
                        'activo' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervision_programaciones');
        Schema::dropIfExists('alertas_bajo_desempeno');
        Schema::dropIfExists('supervision_solicitudes');
        Schema::dropIfExists('asignaturas_cupos_requisitos');
    }
};
