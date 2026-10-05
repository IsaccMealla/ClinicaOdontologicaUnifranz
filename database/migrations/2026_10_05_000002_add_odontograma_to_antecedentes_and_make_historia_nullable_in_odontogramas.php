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
        // 1. Agregar campo odontograma JSONB en antecedentes_medicos para sincronización en vivo
        if (Schema::hasTable('antecedentes_medicos') && !Schema::hasColumn('antecedentes_medicos', 'odontograma')) {
            Schema::table('antecedentes_medicos', function (Blueprint $table) {
                $table->jsonb('odontograma')->default('{}')->after('antecedentes_odontologicos')->comment('Estado de hallazgos del odontograma FDI y superficies');
            });
        }

        // 2. Hacer historia_clinica_id nullable en tabla odontogramas para permitir odontogramas del expediente
        if (Schema::hasTable('odontogramas')) {
            Schema::table('odontogramas', function (Blueprint $table) {
                $table->foreignId('historia_clinica_id')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('odontogramas')) {
            Schema::table('odontogramas', function (Blueprint $table) {
                $table->foreignId('historia_clinica_id')->nullable(false)->change();
            });
        }

        if (Schema::hasTable('antecedentes_medicos') && Schema::hasColumn('antecedentes_medicos', 'odontograma')) {
            Schema::table('antecedentes_medicos', function (Blueprint $table) {
                $table->dropColumn('odontograma');
            });
        }
    }
};
