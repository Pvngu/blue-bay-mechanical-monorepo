<?php

namespace Database\Factories;

use App\Models\Scheduling;
use App\Models\Client;
use App\Models\Technician;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SchedulingFactory extends Factory
{
    protected $model = Scheduling::class;

    public function definition(): array
    {
        $client = Client::inRandomOrder()->first() ?? Client::factory()->create();
        $technician = null;
        if (Technician::count() > 0 && $this->faker->boolean(80)) {
            $technician = Technician::inRandomOrder()->first();
        } elseif ($this->faker->boolean(30)) {
            $technician = Technician::factory()->create();
        }

        $titles = [
            'Routine HVAC System Maintenance - Split System',
            'AC Compressor Inspection',
            'Heat Pump Seasonal Tune-up',
            'Ductwork Inspection and Leak Test',
            'New System Installation - 3 Ton Split',
        ];

        $descriptions = [
            'Perform routine maintenance: replace filters, check refrigerant, clean condenser coils, lubricate motors, and test thermostat calibration.',
            'Inspect compressor for wear and motor functionality. Verify pressures and perform leak check on refrigerant lines.',
            'Seasonal tune-up to optimize efficiency: check reversing valve, inspect defrost cycle, and verify electrical connections.',
            'Inspect ductwork for leaks and insulation gaps. Recommend sealing and R-value improvements where necessary.',
            'Install new split system: set outdoor unit pad, connect refrigerant lines, charge system, and commission thermostat and controls.',
        ];

        $notes = [
            'Customer requested filter replacement and thermostat calibration.',
            'Technician to bring replacement capacitor and contactor if needed.',
            'Access to attic required for duct inspection; please clear attic access panel.',
            'Outdoor unit location confirmed; ensure clearances are maintained.',
            'Customer requested quote for duct sealing after inspection.',
        ];

        return [
            'id' => (string) Str::uuid(),
            'job_number' => 'JOB-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 3, '0', STR_PAD_LEFT),
            'client_id' => $client->id,
            'technician_id' => $technician ? $technician->id : null,
            'title' => $this->faker->randomElement($titles),
            'description' => $this->faker->randomElement($descriptions),
            'service_type' => $this->faker->randomElement(['installation', 'repair', 'maintenance', 'inspection']),
            'status' => $this->faker->randomElement(['scheduled', 'in_progress', 'completed', 'cancelled']),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high', 'urgent']),
            'scheduled_date' => $this->faker->date(),
            'scheduled_time' => $this->faker->time('H:i'),
            'estimated_duration' => $this->faker->numberBetween(30, 240),
            'actual_start_time' => null,
            'actual_end_time' => null,
            'location_address' => $this->faker->address(),
            'location_lat' => $this->faker->latitude(32.5, 32.8),
            'location_lng' => $this->faker->longitude(-117.3, -117.0),
            'notes' => $this->faker->optional()->randomElement($notes),
        ];
    }
}
