<?php

namespace Database\Factories;

use App\Models\BillingLineItem;
use App\Models\Billing;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BillingLineItemFactory extends Factory
{
    protected $model = BillingLineItem::class;

    public function definition(): array
    {
        $billing = Billing::inRandomOrder()->first() ?? Billing::factory()->create();
        $quantity = $this->faker->randomFloat(2, 0.5, 10);
        $unit = $this->faker->randomFloat(2, 5, 200);
        $total = round($quantity * $unit, 2);

        $descriptions = [
            'Condenser fan motor (part) - replacement',
            'Filter set - MERV 8 (3 pack)',
            'Refrigerant line repair and recharge',
            'System diagnostic and tune-up (labor)',
            'Duct sealing and insulation material',
            'Thermostat replacement and programming',
        ];

        return [
            'id' => (string) Str::uuid(),
            'billing_id' => $billing->id,
            'description' => $this->faker->randomElement($descriptions),
            'quantity' => $quantity,
            'unit_price' => $unit,
            'total_price' => $total,
            'item_type' => $this->faker->randomElement(['labor', 'parts', 'service']),
            'created_at' => $this->faker->dateTimeBetween('-60 days', 'now'),
        ];
    }
}
