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
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->restrictOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('docente_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sillon_id')->nullable()->constrained('sillones')->nullOnDelete();
            
            $table->timestampTz('fecha_hora_inicio');
            $table->timestampTz('fecha_hora_fin');
            $table->integer('duracion_estimada_minutos')->default(60);
            
            $table->string('motivo', 255);
            $table->string('estado', 30)->default('programada')->index()->comment('programada, confirmada, en_atencion, completada, cancelada, no_asistio');
            
            $table->timestampTz('check_in_at')->nullable();
            $table->timestampTz('cancelada_en')->nullable();
            $table->foreignId('cancelada_por_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('motivo_cancelacion')->nullable();
            $table->text('observaciones')->nullable();
            
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['fecha_hora_inicio', 'fecha_hora_fin']);
            $table->index(['sillon_id', 'fecha_hora_inicio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
