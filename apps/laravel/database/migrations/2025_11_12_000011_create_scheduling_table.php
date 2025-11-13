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
            // ignore
        }

        Schema::create('scheduling', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('job_number', 50)->unique();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('service_type', 100);
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->string('priority', 50)->default('normal');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->integer('estimated_duration')->nullable();
            $table->timestampTz('actual_start_time')->nullable();
            $table->timestampTz('actual_end_time')->nullable();
            $table->text('location_address');
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('technician_id')->references('id')->on('technicians')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduling');
    }
};
