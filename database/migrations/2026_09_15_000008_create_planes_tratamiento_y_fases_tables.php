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
        Schema::create('planes_tratamiento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('historia_clinica_id')->constrained('historias_clinicas')->cascadeOnDelete();
            $table->foreignId('paciente_id')->constrained('pacientes')->restrictOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            $table->decimal('costo_total_estimado', 10, 2)->default(0.00);
            $table->string('estado', 30)->default('propuesto')->index()->comment('propuesto, aprobado_docente, en_progreso, completado, cancelado');
            $table->timestampTz('fecha_aprobacion_docente')->nullable();
            $table->text('observaciones_docente')->nullable();
            $table->timestampsTz();
        });

        Schema::create('tratamiento_fases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_tratamiento_id')->constrained('planes_tratamiento')->cascadeOnDelete();
            $table->integer('numero_fase')->default(1);
            $table->string('nombre_fase', 150);
            $table->string('procedimiento', 255);
            $table->integer('pieza_fdi')->nullable()->comment('Código de pieza dental según norma FDI (11-85)');
            $table->string('estado', 30)->default('pendiente')->index()->comment('pendiente, en_ejecucion, revision_solicitada, aprobado_docente, rechazado');
            $table->text('observaciones_estudiante')->nullable();
            $table->text('observaciones_docente')->nullable();
            $table->integer('calificacion')->nullable()->comment('Escala 0 - 100 puntos');
            $table->foreignId('docente_aprobador_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('fecha_aprobacion')->nullable();
            $table->timestampsTz();

            $table->index(['plan_tratamiento_id', 'numero_fase']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tratamiento_fases');
        Schema::dropIfExists('planes_tratamiento');
    }
};
