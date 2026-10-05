<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Catálogo de Aranceles Odontológicos UNIFRANZ
        if (!Schema::hasTable('aranceles')) {
            Schema::create('aranceles', function (Blueprint $table) {
                $table->id();
                $table->string('codigo', 30)->unique()->comment('Código de arancel (ej: AR-OP-01)');
                $table->string('categoria', 60)->comment('Especialidad o área clínica');
                $table->string('nombre', 200)->comment('Nombre del procedimiento');
                $table->text('descripcion')->nullable();
                $table->decimal('precio_base', 10, 2)->default(0.00)->comment('Precio oficial en Bolivianos (Bs)');
                $table->integer('tiempo_estimado_minutos')->default(45)->comment('Duración estimada');
                $table->boolean('activo')->default(true);
                $table->timestamps();

                $table->index(['categoria', 'activo']);
            });
        }

        // 2. Ampliación de tabla `planes_tratamiento`
        Schema::table('planes_tratamiento', function (Blueprint $table) {
            $table->foreignId('historia_clinica_id')->nullable()->change();
            if (!Schema::hasColumn('planes_tratamiento', 'fase_actual')) {
                $table->string('fase_actual', 60)->default('Fase I: Control de Infección')->after('descripcion');
            }
            if (!Schema::hasColumn('planes_tratamiento', 'porcentaje_avance')) {
                $table->integer('porcentaje_avance')->default(0)->after('costo_total_estimado');
            }
            if (!Schema::hasColumn('planes_tratamiento', 'aceptacion_paciente')) {
                $table->jsonb('aceptacion_paciente')->nullable()->after('observaciones_docente')->comment('Registro formal de aceptación del paciente (firma/escaneo)');
            }
            if (!Schema::hasColumn('planes_tratamiento', 'alta_clinica')) {
                $table->jsonb('alta_clinica')->nullable()->after('aceptacion_paciente')->comment('Datos de alta clínica definitiva e indicaciones de mantenimiento');
            }
            if (!Schema::hasColumn('planes_tratamiento', 'requiere_validacion_docente')) {
                $table->boolean('requiere_validacion_docente')->default(true)->after('alta_clinica');
            }
        });

        // 3. Ampliación de tabla `tratamiento_fases` (Procedimientos específicos del PdT)
        Schema::table('tratamiento_fases', function (Blueprint $table) {
            if (!Schema::hasColumn('tratamiento_fases', 'fase_categoria')) {
                $table->string('fase_categoria', 60)->default('fase_1_control_infeccion')->after('numero_fase')->comment('fase_1_control_infeccion, fase_2_restauradora, fase_3_mantenimiento');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'especialidad')) {
                $table->string('especialidad', 80)->default('Operatoria Dental')->after('fase_categoria');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'diagnostico_codigo')) {
                $table->string('diagnostico_codigo', 60)->nullable()->after('procedimiento');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'arancel_codigo')) {
                $table->string('arancel_codigo', 40)->nullable()->after('diagnostico_codigo');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'costo_arancel')) {
                $table->decimal('costo_arancel', 10, 2)->default(0.00)->after('arancel_codigo');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'prioridad')) {
                $table->string('prioridad', 30)->default('Prioritario')->after('costo_arancel')->comment('Urgente, Prioritario, Electivo');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'tiempo_estimado_minutos')) {
                $table->integer('tiempo_estimado_minutos')->default(45)->after('prioridad');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'tiempo_empleado_minutos')) {
                $table->integer('tiempo_empleado_minutos')->nullable()->after('tiempo_estimado_minutos');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'materiales_consumidos')) {
                $table->jsonb('materiales_consumidos')->default('[]')->after('tiempo_empleado_minutos')->comment('Insumos utilizados');
            }
            if (!Schema::hasColumn('tratamiento_fases', 'sesiones_clinicas')) {
                $table->jsonb('sesiones_clinicas')->default('[]')->after('materiales_consumidos')->comment('Historial de sesiones y notas de progreso');
            }
        });

        // 4. Tabla de Remisiones Inter-Cátedra / Especialidad
        if (!Schema::hasTable('remisiones_intercatedra')) {
            Schema::create('remisiones_intercatedra', function (Blueprint $table) {
                $table->id();
                $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
                $table->foreignId('estudiante_emisor_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('docente_autoriza_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('estudiante_receptor_id')->nullable()->constrained('users')->nullOnDelete();
                
                $table->string('catedra_origen', 100)->comment('Cátedra o materia que deriva');
                $table->string('catedra_receptora', 100)->comment('Cátedra o materia de destino');
                $table->string('pieza_dental', 20)->nullable();
                $table->string('procedimiento_solicitado', 255);
                $table->text('motivo_remision');
                $table->string('estado', 30)->default('activa')->index()->comment('activa, en_atencion, completada, cancelada');
                
                $table->timestampTz('fecha_atencion')->nullable();
                $table->text('observaciones_resolucion')->nullable();
                $table->timestampsTz();

                $table->index(['paciente_id', 'estado']);
                $table->index(['catedra_receptora', 'estado']);
            });
        }

        // 5. Tabla de Transferencias de Pacientes con Motivos Estandarizados
        if (!Schema::hasTable('transferencias_pacientes')) {
            Schema::create('transferencias_pacientes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
                $table->foreignId('estudiante_anterior_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('estudiante_nuevo_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('docente_autoriza_id')->constrained('users')->cascadeOnDelete();
                
                $table->string('motivo_estandarizado', 80)->comment('Fin de semestre, Necesidad de experiencia, etc.');
                $table->text('justificacion_detallada')->nullable();
                $table->string('estado', 30)->default('aprobada')->comment('aprobada, pendiente, rechazada');
                
                $table->timestampsTz();

                $table->index(['paciente_id', 'created_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transferencias_pacientes');
        Schema::dropIfExists('remisiones_intercatedra');

        Schema::table('tratamiento_fases', function (Blueprint $table) {
            $table->dropColumn([
                'fase_categoria',
                'especialidad',
                'diagnostico_codigo',
                'arancel_codigo',
                'costo_arancel',
                'prioridad',
                'tiempo_estimado_minutos',
                'tiempo_empleado_minutos',
                'materiales_consumidos',
                'sesiones_clinicas',
            ]);
        });

        Schema::table('planes_tratamiento', function (Blueprint $table) {
            $table->dropColumn([
                'fase_actual',
                'porcentaje_avance',
                'aceptacion_paciente',
                'alta_clinica',
                'requiere_validacion_docente',
            ]);
        });

        Schema::dropIfExists('aranceles');
    }
};
