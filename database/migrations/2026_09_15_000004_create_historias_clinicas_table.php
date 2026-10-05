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
        Schema::create('historias_clinicas', function (Blueprint $table) {
            $table->id();
            $table->string('numero_expediente', 50)->unique()->comment('Código único HC-001 (ej: HC-001-2026-0001)');
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Motivo y Enfermedad Actual
            $table->text('motivo_consulta');
            $table->text('enfermedad_actual')->nullable();

            // Examen Físico / Signos Vitales (JSONB)
            // temperatura_c, presion_arterial, pulso, frecuencia_respiratoria, peso_kg, talla_m, estado_general, nutricional, hidratacion, actitud, etc.
            $table->jsonb('signos_vitales')->default('{}')->comment('Signos vitales y examen físico general');

            // Examen Estomatológico Regional (JSONB)
            // craneo, cara_simetria, perfil, ojos, nariz, oidos, cuello, ganglios; labios, carrillos, paladar, lengua, piso_boca, encias, atm, oclusion
            $table->jsonb('examen_estomatologico')->default('{}')->comment('Examen clínico extraoral e intraoral');

            // Diagnóstico y Pronóstico
            $table->text('diagnostico_presuntivo')->nullable();
            $table->text('diagnostico_definitivo')->nullable();
            $table->text('pronostico')->nullable();
            $table->text('plan_tratamiento')->nullable();
            
            // Workflow académico
            $table->string('estado', 30)->default('borrador')->index()->comment('borrador, en_revision, aprobado, rechazado');
            $table->timestampTz('fecha_aprobacion')->nullable();
            $table->text('observaciones_docente')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historias_clinicas');
    }
};
