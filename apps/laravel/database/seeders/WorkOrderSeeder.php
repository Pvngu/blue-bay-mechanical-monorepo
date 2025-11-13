<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkOrder;
use App\Models\Scheduling;
use App\Models\Client;
use App\Models\Technician;

class WorkOrderSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure scheduling, clients and technicians exist
        if (Scheduling::count() === 0) {
            Scheduling::factory()->count(50)->create();
        }

        if (Client::count() === 0) {
            Client::factory()->count(50)->create();
        }

        if (Technician::count() === 0) {
            Technician::factory()->count(10)->create();
        }

        WorkOrder::factory()->count(100)->create();
    }
}
