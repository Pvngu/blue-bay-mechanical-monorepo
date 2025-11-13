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
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        } catch (\Throwable $e) {
            // ignore if not supported
        }

        Schema::create('work_orders', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('work_order_number', 50)->unique();
            $table->uuid('job_id');
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->string('title', 255);
            $table->text('description');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->string('priority', 50)->default('normal');
            $table->date('scheduled_date')->nullable();
            $table->timestampTz('completed_date')->nullable();
            $table->text('technician_notes')->nullable();
            $table->text('client_signature')->nullable();
            $table->timestampTz('signature_date')->nullable();
            $table->decimal('labor_hours', 5, 2)->nullable();
            $table->decimal('labor_cost', 10, 2)->nullable();
            $table->decimal('parts_cost', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->timestampsTz();

            $table->foreign('job_id')->references('id')->on('scheduling')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('technician_id')->references('id')->on('technicians')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
