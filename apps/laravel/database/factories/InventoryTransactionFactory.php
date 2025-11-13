<?php

namespace Database\Factories;

use App\Models\InventoryTransaction;
use App\Models\Inventory;
use App\Models\WorkOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InventoryTransactionFactory extends Factory
{
    protected $model = InventoryTransaction::class;

    public function definition(): array
    {
        $inventory = Inventory::inRandomOrder()->first() ?? Inventory::factory()->create();
        $workOrder = WorkOrder::inRandomOrder()->first();
        $user = User::inRandomOrder()->first();

        $transactionType = $this->faker->randomElement(['deduction', 'restock', 'adjustment']);
        $quantity = $transactionType === 'restock' ? $this->faker->numberBetween(1, 100) : $this->faker->numberBetween(1, 20);
        $unitPrice = $inventory->unit_price ?? $this->faker->randomFloat(2, 1, 200);
        $totalCost = round($quantity * $unitPrice, 2);

        return [
            'id' => (string) Str::uuid(),
            'inventory_id' => $inventory->id,
            'work_order_id' => $workOrder ? $workOrder->id : null,
            'transaction_type' => $transactionType,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_cost' => $totalCost,
            'notes' => $this->faker->optional()->randomElement([
                'Used condenser fan motor from trunk stock for emergency replacement.',
                'Restocked filters after scheduled maintenance visit.',
                'Adjusted inventory counts after physical audit; reconciled differences.',
                'Issued copper line set for installation; tracked to WO.',
            ]),
            'created_by' => $user ? $user->id : null,
            'created_at' => $this->faker->dateTimeBetween('-60 days', 'now'),
        ];
    }
}
