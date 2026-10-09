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
        // 1. Ampliación de la tabla `citas` para Módulo 4
        Schema::table('citas', function (Blueprint $table) {
            if (!Schema::hasColumn('citas', 'plan_tratamiento_id')) {
                $table->foreignId('plan_tratamiento_id')->nullable()->after('sillon_id')->constrained('planes_tratamiento')->nullOnDelete();
            }
            if (!Schema::hasColumn('citas', 'tratamiento_fase_id')) {
                $table->foreignId('tratamiento_fase_id')->nullable()->after('plan_tratamiento_id')->constrained('tratamiento_fases')->nullOnDelete();
            }
            if (!Schema::hasColumn('citas', 'es_recurrente')) {
                $table->boolean('es_recurrente')->default(false)->after('duracion_estimada_minutos');
            }
            if (!Schema::hasColumn('citas', 'frecuencia_recurrencia')) {
                $table->string('frecuencia_recurrencia', 30)->nullable()->after('es_recurrente')->comment('semanal, quincenal, mensual');
            }
            if (!Schema::hasColumn('citas', 'grupo_recurrencia_id')) {
                $table->string('grupo_recurrencia_id', 60)->nullable()->index()->after('frecuencia_recurrencia');
            }
            if (!Schema::hasColumn('citas', 'inicio_atencion_at')) {
                $table->timestampTz('inicio_atencion_at')->nullable()->after('check_in_at');
            }
            if (!Schema::hasColumn('citas', 'fin_atencion_at')) {
                $table->timestampTz('fin_atencion_at')->nullable()->after('inicio_atencion_at');
            }
            if (!Schema::hasColumn('citas', 'minutos_espera_reales')) {
                $table->integer('minutos_espera_reales')->nullable()->after('fin_atencion_at');
            }
            if (!Schema::hasColumn('citas', 'alerta_espera_prolongada')) {
                $table->boolean('alerta_espera_prolongada')->default(false)->after('minutos_espera_reales');
            }
            if (!Schema::hasColumn('citas', 'recordatorio_enviado')) {
                $table->boolean('recordatorio_enviado')->default(false)->after('alerta_espera_prolongada');
            }
            if (!Schema::hasColumn('citas', 'recordatorio_enviado_at')) {
                $table->timestampTz('recordatorio_enviado_at')->nullable()->after('recordatorio_enviado');
            }
            if (!Schema::hasColumn('citas', 'recordatorio_canal')) {
                $table->string('recordatorio_canal', 30)->nullable()->after('recordatorio_enviado_at')->comment('whatsapp, email, sms');
            }
            if (!Schema::hasColumn('citas', 'recordatorio_mensaje')) {
                $table->text('recordatorio_mensaje')->nullable()->after('recordatorio_canal');
            }
        });

        // 2. Tabla de Actas / Notas de Abandono de Tratamiento
        if (!Schema::hasTable('actas_abandono')) {
            Schema::create('actas_abandono', function (Blueprint $table) {
                $table->id();
                $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
                $table->foreignId('historia_clinica_id')->nullable()->constrained('historias_clinicas')->nullOnDelete();
                $table->foreignId('docente_id')->constrained('users')->restrictOnDelete()->comment('Docente o Coordinador que emite el acta');
                $table->foreignId('estudiante_id')->nullable()->constrained('users')->nullOnDelete();
                $table->integer('numero_inasistencias')->default(0);
                $table->date('fecha_declaracion');
                $table->string('codigo_acta', 50)->unique();
                $table->text('motivo_abandono');
                $table->text('acciones_previas')->nullable()->comment('Intentos de contacto, llamadas, mensajes');
                $table->text('observaciones')->nullable();
                $table->timestampsTz();

                $table->index(['paciente_id', 'fecha_declaracion']);
            });
        }

        // 3. Tabla de Configuraciones Operativas de la Clínica (tiempos de espera, alertas de abandono)
        if (!Schema::hasTable('configuraciones_clinica')) {
            Schema::create('configuraciones_clinica', function (Blueprint $table) {
                $table->id();
                $table->string('clave', 60)->unique();
                $table->string('valor', 255);
                $table->string('descripcion', 255)->nullable();
                $table->timestamps();
            });

            DB::table('configuraciones_clinica')->insert([
                [
                    'clave' => 'tiempo_max_espera_minutos',
                    'valor' => '15',
                    'descripcion' => 'Minutos máximos en sala de espera antes de activar Alerta Roja',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'clave' => 'max_inasistencias_abandono',
                    'valor' => '3',
                    'descripcion' => 'Número de inasistencias consecutivas para activar Protocolo de Abandono',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'clave' => 'horario_apertura',
                    'valor' => '08:00',
                    'descripcion' => 'Hora de apertura de gabinetes clínicos',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'clave' => 'horario_cierre',
                    'valor' => '19:00',
                    'descripcion' => 'Hora de cierre de gabinetes clínicos',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actas_abandono');
        Schema::dropIfExists('configuraciones_clinica');

        Schema::table('citas', function (Blueprint $table) {
            $table->dropForeign(['plan_tratamiento_id']);
            $table->dropForeign(['tratamiento_fase_id']);
            $table->dropColumn([
                'plan_tratamiento_id',
                'tratamiento_fase_id',
                'es_recurrente',
                'frecuencia_recurrencia',
                'grupo_recurrencia_id',
                'inicio_atencion_at',
                'fin_atencion_at',
                'minutos_espera_reales',
                'alerta_espera_prolongada',
                'recordatorio_enviado',
                'recordatorio_enviado_at',
                'recordatorio_canal',
                'recordatorio_mensaje',
            ]);
        });
    }
};
