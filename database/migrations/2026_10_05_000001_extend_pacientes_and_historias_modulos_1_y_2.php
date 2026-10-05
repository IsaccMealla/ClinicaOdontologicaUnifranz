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
        // 1. Ampliación del Módulo 1 en tabla `pacientes`
        Schema::table('pacientes', function (Blueprint $table) {
            $table->string('iup', 40)->nullable()->unique()->after('id')->comment('Identificador Único de Paciente (ej: UNIFRANZ-2026-000001)');
            $table->string('email', 150)->nullable()->after('celular')->comment('Correo electrónico para recordatorios');
            $table->string('nacionalidad', 60)->default('Boliviana')->after('estado_civil')->comment('Nacionalidad');
            $table->string('nivel_instruccion', 60)->nullable()->after('ocupacion')->comment('Nivel de instrucción del paciente');
            $table->string('fuente_referencia', 100)->nullable()->after('lugar_nacimiento')->comment('Cómo conoció la clínica');
            $table->string('seguro_convenio', 150)->nullable()->after('fuente_referencia')->comment('Convenio o aseguradora');
            $table->string('numero_poliza', 60)->nullable()->after('seguro_convenio')->comment('Número de póliza o carnet');
            $table->string('estado_paciente', 30)->default('activo')->after('parentesco_emergencia')->comment('activo, inactivo, referido, transferido');
            $table->string('estado_clinico', 30)->default('en_evaluacion')->after('estado_paciente')->comment('en_evaluacion, en_tratamiento, alta_clinica, abandono');
            $table->string('ci_documento_url', 255)->nullable()->after('ci_expedido')->comment('Ruta al documento o cédula escaneada');
            $table->jsonb('consentimiento_inicial')->nullable()->after('alerta_abandono')->comment('Consentimiento informado de privacidad y reglamento');
            $table->decimal('saldo_cuenta', 10, 2)->default(0.00)->after('consentimiento_inicial')->comment('Saldo de cuenta actual');

            $table->index(['iup']);
            $table->index(['estado_paciente', 'estado_clinico']);
        });

        // 2. Ampliación del Módulo 2 en tabla `antecedentes_medicos`
        Schema::table('antecedentes_medicos', function (Blueprint $table) {
            $table->text('motivo_consulta_paciente')->nullable()->after('ginecologicos')->comment('Motivo de consulta en palabras del paciente');
            $table->jsonb('antecedentes_odontologicos')->default('{}')->after('motivo_consulta_paciente')->comment('Visitas, antecedentes odontológicos, traumas');
            $table->jsonb('diagnosticos_codificados')->default('[]')->after('antecedentes_odontologicos')->comment('Diagnósticos codificados CIE-10 y CDT-2');
            $table->jsonb('plan_tratamiento_secuencia')->default('[]')->after('diagnosticos_codificados')->comment('Secuencia numerada de procedimientos');
            $table->jsonb('odontologia_legal_forense')->default('{}')->after('plan_tratamiento_secuencia')->comment('Características dentales únicas para identificación forense');
        });

        // 3. Ampliación en tabla `historias_clinicas` (HC-001)
        Schema::table('historias_clinicas', function (Blueprint $table) {
            $table->text('motivo_consulta_paciente')->nullable()->after('motivo_consulta');
            $table->jsonb('antecedentes_odontologicos')->default('{}')->after('motivo_consulta_paciente');
            $table->jsonb('diagnosticos_codificados')->default('[]')->after('diagnostico_definitivo');
            $table->jsonb('plan_tratamiento_secuencia')->default('[]')->after('plan_tratamiento');
            $table->jsonb('odontologia_legal_forense')->default('{}')->after('plan_tratamiento_secuencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('historias_clinicas', function (Blueprint $table) {
            $table->dropColumn([
                'motivo_consulta_paciente',
                'antecedentes_odontologicos',
                'diagnosticos_codificados',
                'plan_tratamiento_secuencia',
                'odontologia_legal_forense',
            ]);
        });

        Schema::table('antecedentes_medicos', function (Blueprint $table) {
            $table->dropColumn([
                'motivo_consulta_paciente',
                'antecedentes_odontologicos',
                'diagnosticos_codificados',
                'plan_tratamiento_secuencia',
                'odontologia_legal_forense',
            ]);
        });

        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropColumn([
                'iup',
                'email',
                'nacionalidad',
                'nivel_instruccion',
                'fuente_referencia',
                'seguro_convenio',
                'numero_poliza',
                'estado_paciente',
                'estado_clinico',
                'ci_documento_url',
                'consentimiento_inicial',
                'saldo_cuenta',
            ]);
        });
    }
};
