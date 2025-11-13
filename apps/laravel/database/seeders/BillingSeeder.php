<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Billing;
use App\Models\Client;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        if (Client::count() === 0) {
            Client::factory()->count(50)->create();
        }

        Billing::factory()->count(100)->create();
    }
}
