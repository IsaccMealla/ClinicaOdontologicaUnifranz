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
        Schema::create('auditoria_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('accion', 50)->index()->comment('CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN');
            $table->string('tabla', 100)->index();
            $table->string('registro_id', 50)->index();
            
            // JSONB para registrar diff estructurado de campos previos y posteriores
            $table->jsonb('payload_diff')->nullable()->comment('Snapshot de campos modificados {"antes": {...}, "despues": {...}}');
            
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('created_at')->useCurrent()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_logs');
    }
};
