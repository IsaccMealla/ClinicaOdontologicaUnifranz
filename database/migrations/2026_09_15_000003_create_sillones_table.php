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
        Schema::create('sillones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique()->comment('Identificador físico único: SIL-01, etc.');
            $table->string('nombre', 100);
            $table->string('sala_clinica', 100)->comment('Clínica Odontológica Integral A, B, Quirófano, etc.');
            $table->string('marca', 100)->nullable();
            $table->string('modelo', 100)->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->string('estado', 30)->default('disponible')->index()->comment('disponible, ocupado, en_mantenimiento, fuera_servicio');
            $table->double('posicion_x')->nullable();
            $table->double('posicion_y')->nullable();
            $table->timestampTz('ultima_revision')->nullable();
            $table->integer('frecuencia_mantenimiento_dias')->default(30);
            $table->text('notas_tecnicas')->nullable();
            $table->boolean('activo')->default(true)->index();
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sillones');
    }
};
