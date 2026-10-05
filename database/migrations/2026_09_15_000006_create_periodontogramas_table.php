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
        Schema::create('periodontogramas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('historia_clinica_id')->constrained('historias_clinicas')->cascadeOnDelete();
            $table->foreignId('paciente_id')->constrained('pacientes')->restrictOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->integer('version')->default(1);
            
            // JSONB para coordenadas de sondaje, margen gingival y niveles de inserción
            $table->jsonb('mediciones_periodontales')->comment('Estructura JSONB con cuadrantes (superior/inferior, vestibular/palatino/lingual), profundidad sondaje, margen gingival e inserción');
            
            $table->decimal('indice_placa_porcentaje', 5, 2)->default(0.00);
            $table->decimal('indice_sangrado_porcentaje', 5, 2)->default(0.00);
            $table->text('diagnostico_periodontal')->nullable();
            $table->text('pronostico_periodontal')->nullable();
            
            // Aprobación docente
            $table->string('estado_aprobacion', 30)->default('borrador')->index()->comment('borrador, en_revision, aprobado, observado');
            $table->timestampTz('fecha_aprobacion')->nullable();
            $table->text('comentarios_docente')->nullable();
            
            $table->timestampsTz();

            $table->index(['paciente_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periodontogramas');
    }
};
