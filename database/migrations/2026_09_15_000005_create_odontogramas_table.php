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
        Schema::create('odontogramas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('historia_clinica_id')->constrained('historias_clinicas')->cascadeOnDelete();
            $table->foreignId('paciente_id')->constrained('pacientes')->restrictOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('tipo', 30)->default('inicial')->comment('inicial, evolucion, final');
            $table->integer('version')->default(1);
            
            // JSONB para estado dinámico de piezas FDI y caras dentales
            $table->jsonb('hallazgos_piezas')->comment('Estructura JSONB FDI por pieza dental y superficies (vestibular, lingual, palatino, oclusal, mesial, distal)');
            $table->text('especificaciones')->nullable();
            
            // Aprobación docente
            $table->string('estado_aprobacion', 30)->default('borrador')->index()->comment('borrador, en_revision, aprobado, observado');
            $table->timestampTz('fecha_aprobacion')->nullable();
            $table->text('comentarios_docente')->nullable();
            
            $table->timestampsTz();

            $table->index(['paciente_id', 'tipo', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odontogramas');
    }
};
