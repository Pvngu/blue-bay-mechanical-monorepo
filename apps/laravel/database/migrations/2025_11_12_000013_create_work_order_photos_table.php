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

        Schema::create('work_order_photos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('work_order_id');
            $table->text('photo_url');
            $table->text('caption')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestampTz('uploaded_at')->useCurrent();
            $table->timestampsTz();

            $table->foreign('work_order_id')->references('id')->on('work_orders')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_photos');
    }
};
