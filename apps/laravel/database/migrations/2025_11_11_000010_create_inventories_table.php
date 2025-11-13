<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Try to enable uuid extension for Postgres if available. Silently ignore if not supported.
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        } catch (\Throwable $e) {
            // ignore - extension may not be available or DB not Postgres
        }

        Schema::create('inventories', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('inventory_code', 50)->unique();
            $table->string('part_name', 255);
            $table->string('part_number', 100);
            $table->enum('category', ['hvac', 'electrical', 'plumbing', 'tools', 'filters', 'other']);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->enum('location', ['San Diego', 'Tijuana', 'Both'])->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->string('supplier')->nullable();
            $table->string('supplier_contact')->nullable();
            $table->date('last_restocked')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
