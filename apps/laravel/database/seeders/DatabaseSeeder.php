<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            // Application data
            ClientSeeder::class,
            TechnicianSeeder::class,
              InventorySeeder::class,
              SchedulingSeeder::class,
            WorkOrderSeeder::class,
            WorkOrderPhotoSeeder::class,
            InventoryTransactionSeeder::class,
            BillingSeeder::class,
            BillingLineItemSeeder::class,
            NotificationSeeder::class,
            ServiceHistorySeeder::class,
        ]);
    }
}