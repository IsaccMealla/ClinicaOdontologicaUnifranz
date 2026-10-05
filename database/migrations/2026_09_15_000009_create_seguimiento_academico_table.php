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
        Schema::create('seguimiento_academico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('docente_tutor_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('asignatura', 150)->index()->comment('Ej: Periodoncia I, Operatoria II, Cirugía Bucal');
            $table->string('periodo_academico', 20)->index()->comment('Ej: 2026-I, 2026-II');
            $table->string('procedimiento_clave', 200)->comment('Ej: Profilaxis, Exodoncia simple, Endodoncia unirradicular');
            $table->integer('cupos_requeridos')->default(10);
            $table->integer('cupos_completados')->default(0);
            $table->string('estado', 30)->default('en_curso')->index()->comment('en_curso, completado, reprobado');
            
            $table->timestampsTz();

            $table->unique(['estudiante_id', 'asignatura', 'periodo_academico', 'procedimiento_clave'], 'unique_seguimiento_estudiante');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seguimiento_academico');
    }
};
