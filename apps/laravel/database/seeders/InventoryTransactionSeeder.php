<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryTransaction;
use App\Models\Inventory;

class InventoryTransactionSeeder extends Seeder
{
    public function run(): void
    {
        if (Inventory::count() === 0) {
            Inventory::factory()->count(50)->create();
        }

        InventoryTransaction::factory()->count(200)->create();
    }
}
