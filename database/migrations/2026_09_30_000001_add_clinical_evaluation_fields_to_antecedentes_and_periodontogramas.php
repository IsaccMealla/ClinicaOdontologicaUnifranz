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
        Schema::table('antecedentes_medicos', function (Blueprint $table) {
            $table->jsonb('examen_clinico_fisico')->nullable()->default('{}')->comment('Signos vitales, examen fisico extraoral, ATM');
            $table->jsonb('habitos')->nullable()->default('{}')->comment('Habitos orales y elementos de higiene');
            $table->jsonb('historia_odontopediatrica')->nullable()->default('{}')->comment('Desarrollo psicomotor, habitos infantiles, oclusion y conducta');
            $table->jsonb('antecedentes_periodontales')->nullable()->default('{}')->comment('Sintomas periodontales, sangrado, movilidad');
            $table->jsonb('examen_periodontal')->nullable()->default('{}')->comment('Color, textura, consistencia y caracteristicas de la encia');
            $table->jsonb('procedimientos_tratamientos')->nullable()->default('[]')->comment('Historial de procedimientos y tratamientos planificados');
        });

        Schema::table('periodontogramas', function (Blueprint $table) {
            $table->foreignId('historia_clinica_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('antecedentes_medicos', function (Blueprint $table) {
            $table->dropColumn([
                'examen_clinico_fisico',
                'habitos',
                'historia_odontopediatrica',
                'antecedentes_periodontales',
                'examen_periodontal',
                'procedimientos_tratamientos',
            ]);
        });

        Schema::table('periodontogramas', function (Blueprint $table) {
            $table->foreignId('historia_clinica_id')->nullable(false)->change();
        });
    }
};
