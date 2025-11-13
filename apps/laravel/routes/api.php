<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\TechnicianController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SchedulingController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\WorkOrderPhotoController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BillingLineItemController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ServiceHistoryController;
use App\Http\Controllers\DashboardController;

//create group for middleware auth:sanctum
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('activity-logs', [App\Http\Controllers\ActivityLogController::class, 'index']);
    
    // Rutas para Roles y Permisos
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('inventories', InventoryController::class);
    Route::apiResource('scheduling', SchedulingController::class);
    Route::apiResource('work-orders', WorkOrderController::class);
    Route::apiResource('work-order-photos', WorkOrderPhotoController::class)->only(['index','show','store','destroy']);
    Route::apiResource('inventory-transactions', InventoryTransactionController::class);
    Route::prefix('billing')->group(function () {
        Route::get('stats', [BillingController::class, 'stats']);
        Route::get('{billing}/pdf', [BillingController::class, 'downloadPdf']);
    });
    Route::apiResource('billing', BillingController::class);
    Route::apiResource('billing-line-items', BillingLineItemController::class);
    Route::apiResource('notifications', NotificationController::class);
    Route::apiResource('service-history', ServiceHistoryController::class);
    Route::post('users/{user}/assign-role', [UserController::class, 'assignRole']);
    Route::post('users/{user}/remove-role', [UserController::class, 'removeRole']);

    Route::apiResource('technicians', TechnicianController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('inventory', InventoryController::class);


});

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});