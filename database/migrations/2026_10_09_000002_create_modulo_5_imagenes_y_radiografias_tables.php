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
        Schema::create('imagenes_clinicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->string('iup', 50)->index()->comment('Identificador Único del Paciente');
            $table->foreignId('historia_clinica_id')->nullable()->constrained('historias_clinicas')->nullOnDelete();
            $table->foreignId('plan_tratamiento_id')->nullable()->constrained('planes_tratamiento')->nullOnDelete();
            $table->foreignId('tratamiento_fase_id')->nullable()->constrained('tratamiento_fases')->nullOnDelete();
            
            // Usuario que registró (Estudiante o Docente)
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_validador_id')->nullable()->constrained('users')->nullOnDelete();

            // Clasificación y Categorización
            // diagnostico_facial, diagnostico_intraoral, proceso_laboratorio, final_post_tratamiento, radiografia_psp, tomografia_cbct, dicom_original
            $table->string('categoria', 60)->index();
            
            // Tipo específico de imagen (ej: facial_perfil, intraoral_oclusal_sup, psp_periapical, cbct_axial, proceso_prueba_protesis)
            $table->string('tipo_imagen', 80)->index();
            
            // Fase clínica del caso: pre_tratamiento, trans_tratamiento, post_tratamiento
            $table->string('fase_caso', 40)->default('pre_tratamiento')->index();
            
            // Pieza dental o región (FDI 11..48, "Sextante V", "Arcada Superior", etc.)
            $table->string('pieza_dental', 50)->nullable()->index();

            // Atributos específicos para CBCT
            $table->string('plano_corte_cbct', 30)->nullable()->comment('axial, sagital, coronal, panoramica, 3d');

            // Atributos específicos para Escáner de Placas de Fósforo (PSP)
            $table->string('tipo_placa_psp', 50)->nullable()->comment('tamano_0_pediatrico, tamano_1, tamano_2_adulto, tamano_3, tamano_4_oclusal');

            // Información descriptiva
            $table->string('titulo', 255);
            $table->text('descripcion')->nullable();

            // Archivo y Almacenamiento
            $table->string('archivo_path', 255);
            $table->string('archivo_url', 255);
            $table->string('nombre_original', 255);
            $table->string('mime_type', 80);
            $table->bigInteger('tamano_bytes');
            $table->string('tamano_formateado', 30);
            $table->timestampTz('fecha_adquisicion');

            // Metadatos técnicos (resolución, scanner fabricante, calibración mm/px, etc.)
            $table->jsonb('metadatos')->default('{}');

            // Anotaciones diagnósticas vectoriales (líneas de medición mm, flechas, círculos, notas)
            $table->jsonb('anotaciones')->default('[]');

            // Evaluación y validación docente
            $table->boolean('validada_por_docente')->default(false)->index();
            $table->timestampTz('fecha_validacion')->nullable();
            $table->text('observaciones_docente')->nullable();
            $table->integer('calificacion_docente')->nullable()->comment('Escala 1 a 100 para fotos de proceso');

            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['paciente_id', 'categoria']);
            $table->index(['paciente_id', 'fase_caso']);
            $table->index(['fecha_adquisicion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imagenes_clinicas');
    }
};
