<?php

namespace Database\Factories;

use App\Models\ServiceHistory;
use App\Models\Client;
use App\Models\Scheduling;
use App\Models\WorkOrder;
use App\Models\Technician;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceHistoryFactory extends Factory
{
    protected $model = ServiceHistory::class;

    public function definition(): array
    {
        $client = Client::inRandomOrder()->first() ?? Client::factory()->create();
        $job = Scheduling::inRandomOrder()->first();
        $workOrder = WorkOrder::inRandomOrder()->first();
        $technician = Technician::inRandomOrder()->first();

        return [
            'id' => (string) Str::uuid(),
            'client_id' => $client->id,
            'job_id' => $job ? $job->id : null,
            'work_order_id' => $workOrder ? $workOrder->id : null,
            'service_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'service_type' => $this->faker->randomElement(['installation','repair','maintenance','inspection']),
            'description' => $this->faker->optional()->paragraph(),
            'technician_id' => $technician ? $technician->id : null,
            'amount_charged' => $this->faker->optional()->randomFloat(2, 0, 2000),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
