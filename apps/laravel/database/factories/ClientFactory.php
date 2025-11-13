<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Client::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $preferredContact = $this->faker->optional(0.7)->randomElement(['email', 'phone', 'sms']);

        return [
            'client_code' => strtoupper('CLT' . $this->faker->unique()->bothify('??###')),
            'name' => $this->faker->name(),
            'email' => $this->faker->optional()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => 'US',
            'preferred_contact' => $preferredContact,
            'preferred_language' => $this->faker->randomElement(['en', 'es']),
            'service_history_count' => $this->faker->numberBetween(0, 20),
            'last_service_date' => $this->faker->optional(0.6)->date(),
            'notes' => $this->faker->optional()->paragraph(),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}
