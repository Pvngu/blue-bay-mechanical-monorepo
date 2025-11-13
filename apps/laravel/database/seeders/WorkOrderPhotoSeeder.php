<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkOrderPhoto;
use App\Models\WorkOrder;

class WorkOrderPhotoSeeder extends Seeder
{
    public function run(): void
    {
        if (WorkOrder::count() === 0) {
            WorkOrder::factory()->count(50)->create();
        }

        WorkOrderPhoto::factory()->count(200)->create();
    }
}
