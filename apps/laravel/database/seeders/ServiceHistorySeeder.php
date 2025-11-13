<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceHistory;
use App\Models\Client;

class ServiceHistorySeeder extends Seeder
{
    public function run(): void
    {
        if (Client::count() === 0) {
            Client::factory()->count(50)->create();
        }

        ServiceHistory::factory()->count(200)->create();
    }
}
