<?php

namespace Database\Factories;

use App\Models\Inventory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InventoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Inventory::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $parts = [
            'Condenser Fan Motor',
            'Evaporator Coil',
            'Programmable Thermostat',
            'Filter - MERV 8 (3 pack)',
            'Compressor - 2.5 Ton',
            'Start/Run Capacitor 35/5 µF',
            'Contactor 24V',
            'Copper Line Set 3/8-5/8',
            'Reversing Valve',
            'Blower Motor - ECM',
        ];

    // Keep categories aligned with DB check constraint
    $categories = ['hvac', 'electrical', 'plumbing', 'tools', 'filters', 'other'];
        $suppliers = [
            'National HVAC Supply Co.',
            'Coastal Mechanical Parts',
            'Carrier Pro Distributors',
            'Trane Supply Solutions',
            'Local Plumbing & HVAC',
        ];

        $partName = $this->faker->randomElement($parts);
        $pattern = $this->faker->randomElement(['PN-#####', 'HV-#####', 'FT-#####', 'CP-#####']);

        return [
            'id' => (string) Str::uuid(),
            'inventory_code' => 'INV-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'part_name' => $partName,
            'part_number' => strtoupper($this->faker->bothify($pattern)),
            'category' => $this->faker->randomElement($categories),
            'stock' => $this->faker->numberBetween(0, 200),
            'min_stock' => $this->faker->numberBetween(0, 20),
            // keep locations aligned with DB check constraint
            'location' => $this->faker->randomElement(['San Diego', 'Tijuana', 'Both']),
            'unit_price' => $this->faker->randomFloat(2, 5, 800),
            'supplier' => $this->faker->randomElement($suppliers),
            'supplier_contact' => $this->faker->phoneNumber(),
            'last_restocked' => $this->faker->dateTimeBetween('-180 days', 'now')->format('Y-m-d'),
            'is_active' => $this->faker->boolean(95),
        ];
    }
}
