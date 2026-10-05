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
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->string('ci', 30)->unique()->comment('Documento de Identidad');
            $table->string('ci_expedido', 10)->nullable()->comment('Lugar de expedición (LP, SC, CB, etc.)');
            $table->string('nombres', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100)->nullable();
            $table->date('fecha_nacimiento');
            $table->string('sexo', 20)->comment('M, F, Otro');
            $table->string('estado_civil', 30)->nullable();
            $table->string('ocupacion', 100)->nullable();
            $table->string('lugar_nacimiento', 100)->nullable();
            $table->text('direccion')->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('celular', 30)->nullable();
            $table->string('contacto_emergencia', 150)->nullable();
            $table->string('telefono_emergencia', 30)->nullable();
            $table->string('parentesco_emergencia', 50)->nullable();
            $table->foreignId('estudiante_asignado_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('fecha_ultima_consulta')->nullable();
            $table->text('motivo_ultima_consulta')->nullable();
            $table->integer('inasistencias_acumuladas')->default(0);
            $table->boolean('alerta_abandono')->default(false);
            $table->boolean('activo')->default(true);
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['apellido_paterno', 'apellido_materno']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
