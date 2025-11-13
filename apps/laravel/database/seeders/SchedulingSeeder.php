<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Scheduling;
use App\Models\Client;
use App\Models\Technician;

class SchedulingSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure there are clients and technicians to reference
        if (Client::count() === 0) {
            Client::factory()->count(50)->create();
        }

        if (Technician::count() === 0) {
            Technician::factory()->count(10)->create();
        }

        Scheduling::factory()->count(100)->create();
    }
}
