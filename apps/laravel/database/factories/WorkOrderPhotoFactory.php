<?php

namespace Database\Factories;

use App\Models\WorkOrderPhoto;
use App\Models\WorkOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WorkOrderPhotoFactory extends Factory
{
    protected $model = WorkOrderPhoto::class;

    public function definition(): array
    {
        $workOrder = WorkOrder::inRandomOrder()->first() ?? WorkOrder::factory()->create();
        $user = User::inRandomOrder()->first();

        $captions = [
            'Condenser coil cleaned and free of debris.',
            'New condenser fan motor installed; wiring tidy and secure.',
            'Duct main trunk before sealing; visible gaps at seam.',
            'Indoor air handler coil after cleaning.',
            'Outdoor unit placement and clearance verified.',
        ];

        return [
            'id' => (string) Str::uuid(),
            'work_order_id' => $workOrder->id,
            'photo_url' => $this->faker->imageUrl(1280, 720, 'business'),
            'caption' => $this->faker->optional()->randomElement($captions),
            'uploaded_by' => $user ? $user->id : null,
            'uploaded_at' => $this->faker->dateTimeBetween('-90 days', 'now'),
        ];
    }
}
