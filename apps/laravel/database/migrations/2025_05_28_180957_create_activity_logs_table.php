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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            // User who performed the action
            $table->bigInteger('user_id')->unsigned()->nullable()->default(null);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');
            
            // Model being logged (polymorphic)
            $table->string('loggable_type');
            $table->unsignedBigInteger('loggable_id');
            $table->index(['loggable_type', 'loggable_id']);
            
            // Activity details
            $table->string('action'); // CREATED, UPDATED, DELETED
            $table->string('entity'); // Table name or entity name for display
            $table->text('description'); // Human readable description
            $table->json('json_log'); // Complete log data including old/new values
            $table->dateTime('datetime'); // When the action occurred
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
