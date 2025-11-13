<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BillingLineItem;
use App\Models\Billing;

class BillingLineItemSeeder extends Seeder
{
    public function run(): void
    {
        if (Billing::count() === 0) {
            Billing::factory()->count(50)->create();
        }

        BillingLineItem::factory()->count(300)->create();
    }
}
