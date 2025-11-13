<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use App\Models\Scheduling;
use App\Models\Client;
use App\Models\Technician;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WorkOrderFactory extends Factory
{
    protected $model = WorkOrder::class;

    public function definition(): array
    {
        $job = Scheduling::inRandomOrder()->first() ?? Scheduling::factory()->create();
        $client = Client::find($job->client_id) ?? Client::inRandomOrder()->first() ?? Client::factory()->create();

        $technician = null;
        if (Technician::count() > 0 && $this->faker->boolean(70)) {
            $technician = Technician::inRandomOrder()->first();
        } elseif ($this->faker->boolean(30)) {
            $technician = Technician::factory()->create();
        }

        $laborHours = $this->faker->randomFloat(2, 0, 12);
        $laborRate = $this->faker->randomFloat(2, 20, 120);
        $laborCost = round($laborHours * $laborRate, 2);
        $partsCost = $this->faker->randomFloat(2, 0, 500);
        $totalCost = round($laborCost + $partsCost, 2);

        $titles = [
            'Replace Condenser Fan Motor and Test',
            'Install 3-Ton Split System',
            'Duct Sealing and Insulation',
            'Compressor Diagnosis and Repair',
            'Seasonal Tune-Up and Filter Replacement',
        ];

        $descriptions = [
            'Replace failed condenser fan motor, verify electrical connections, test startup current, and confirm adequate airflow through system.',
            'Full installation of 3-ton split system, including mounting outdoor unit, connecting refrigerant lines, evacuating, charging, and system commissioning.',
            'Seal identified duct leaks in attic, re-insulate main trunk, and balance registers to improve system efficiency.',
            'Diagnose compressor failure: inspect contactor and start capacitor, verify refrigerant pressures, and recommend repair or replacement.',
            'Perform seasonal maintenance: replace filters, clean coils, lubricate motors, verify thermostat and safety controls, and record baseline operating parameters.',
        ];

        $techNotes = [
            'Replaced fan motor and capacitor; verified proper operation and amperage within spec.',
            'System charged to manufacturer spec. Recorded static pressures and temperatures for handoff.',
            'Found minor duct leak at main trunk; applied mastic and resumed airflow test.',
            'Compressor shows signs of mechanical failure; recommended replacement and provided estimate.',
            'Performed standard tune-up; advised customer on filter schedule and thermostat setback for energy savings.',
        ];

        return [
            'id' => (string) Str::uuid(),
            'work_order_number' => 'WO-' . str_pad($this->faker->unique()->numberBetween(1, 99999), 3, '0', STR_PAD_LEFT),
            'job_id' => $job->id,
            'client_id' => $client->id,
            'technician_id' => $technician ? $technician->id : null,
            'title' => $this->faker->randomElement($titles),
            'description' => $this->faker->randomElement($descriptions),
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'completed', 'cancelled']),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high', 'urgent']),
            'scheduled_date' => $job->scheduled_date ?? $this->faker->date(),
            'completed_date' => null,
            'technician_notes' => $this->faker->optional()->randomElement($techNotes),
            'client_signature' => null,
            'signature_date' => null,
            'labor_hours' => $laborHours,
            'labor_cost' => $laborCost,
            'parts_cost' => $partsCost,
            'total_cost' => $totalCost,
        ];
    }
}
