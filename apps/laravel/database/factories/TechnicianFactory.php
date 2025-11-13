<?php

namespace Database\Factories;

use App\Models\Technician;
use Illuminate\Database\Eloquent\Factories\Factory;

class TechnicianFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Technician::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'user_id' => null,
            'employee_id' => strtoupper('TECH' . $this->faker->unique()->numerify('####')),
            'specialization' => $this->faker->randomElement(['HVAC', 'Plumbing', 'Electrical', 'Mechanical', 'Carpentry', 'General']),
            'location' => $this->faker->randomElement(['San Diego', 'Tijuana', 'Both']),
            'certification_level' => $this->faker->randomElement(['Level 1', 'Level 2', 'Level 3', 'Master']),
            'hourly_rate' => $this->faker->randomFloat(2, 20, 120),
            'is_available' => $this->faker->boolean(80),
            'current_latitude' => $this->faker->optional()->latitude(),
            'current_longitude' => $this->faker->optional()->longitude(),
        ];
    }
}
