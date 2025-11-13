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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_code', 50)->unique();
            $table->string('name', 255);
            $table->string('email', 255)->nullable();
            $table->string('phone', 20);
            $table->text('address');
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 2)->default('US');
            $table->enum('preferred_contact', ['email', 'phone', 'sms'])->nullable();
            $table->enum('preferred_language', ['en', 'es'])->default('en');
            $table->integer('service_history_count')->default(0);
            $table->date('last_service_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('name');
            $table->index('email');
            $table->index('phone');
            $table->index('client_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
