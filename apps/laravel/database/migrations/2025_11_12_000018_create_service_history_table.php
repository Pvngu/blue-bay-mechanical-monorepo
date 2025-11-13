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

        Schema::create('service_history', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->unsignedBigInteger('client_id');
            $table->uuid('job_id')->nullable();
            $table->uuid('work_order_id')->nullable();
            $table->date('service_date');
            $table->string('service_type', 100)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->decimal('amount_charged', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('job_id')->references('id')->on('scheduling')->onDelete('cascade');
            $table->foreign('work_order_id')->references('id')->on('work_orders')->onDelete('cascade');
            $table->foreign('technician_id')->references('id')->on('technicians')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_history');
    }
};
