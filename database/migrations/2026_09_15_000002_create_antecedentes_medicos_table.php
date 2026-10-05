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
        Schema::create('antecedentes_medicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->unique()->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('estudiante_registra_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('docente_supervisor_id')->nullable()->constrained('users')->nullOnDelete();

            // Los 4 Bloques de Antecedentes (JSONB en PostgreSQL para flexibilidad total)
            $table->jsonb('patologicos_personales')->default('{}')->comment('Alergias, hematológicos, sistémicos, cirugías, tratamientos');
            $table->jsonb('patologicos_familiares')->default('{}')->comment('Diabetes, HTA, cáncer, cardiológicos, renales de familiares');
            $table->jsonb('no_patologicos')->default('{}')->comment('Hábitos orales, tabaquismo, alcohol, higiene dental');
            $table->jsonb('ginecologicos')->default('{}')->comment('Embarazo, lactancia, ciclo menstrual, anticonceptivos');

            // Banderas de alerta rápida calculadas para triaje y vistas
            $table->boolean('alerta_alergia')->default(false);
            $table->boolean('alerta_hipertension')->default(false);
            $table->boolean('alerta_coagulacion')->default(false);
            $table->boolean('alerta_diabetes')->default(false);
            $table->boolean('alerta_embarazo')->default(false);

            // Flujo de supervisión académica
            $table->string('estado_revision', 30)->default('borrador')->comment('borrador, en_revision, aprobado, rechazado');
            $table->text('comentarios_docente')->nullable();
            $table->timestampTz('fecha_aprobacion')->nullable();
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antecedentes_medicos');
    }
};
