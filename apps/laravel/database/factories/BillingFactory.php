<?php

namespace Database\Factories;

use App\Models\Billing;
use App\Models\Client;
use App\Models\WorkOrder;
use App\Models\Scheduling;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BillingFactory extends Factory
{
    protected $model = Billing::class;

    public function definition(): array
    {
        $client = Client::inRandomOrder()->first() ?? Client::factory()->create();
        $workOrder = WorkOrder::inRandomOrder()->first();
        $job = Scheduling::inRandomOrder()->first();

        $subtotal = $this->faker->randomFloat(2, 50, 2000);
        $taxRate = $this->faker->randomElement([0, 7.5, 8.25]);
        $taxAmount = round($subtotal * ($taxRate / 100), 2);
        $discount = $this->faker->randomFloat(2, 0, 100);
        $total = round($subtotal + $taxAmount - $discount, 2);
        $paid = $this->faker->randomElement([0, $total, round($total * 0.5, 2)]);

        $notesSamples = [
            'Performed standard maintenance: replaced filters, cleaned coils, and calibrated thermostat.',
            'Replaced condenser fan motor and capacitor; verified cooling at rated capacity.',
            'Found refrigerant leak; provided estimate for line repair and recharge.',
            'Ductwork sealing performed for main trunk; improved airflow to 2nd floor.',
        ];

        $termsSamples = [
            'Payment due within 30 days of invoice date. Late payments may incur a 1.5% monthly finance charge.',
            'All parts are warrantied per manufacturer terms. Labor warranty: 90 days from date of service unless otherwise noted.',
            'Estimates are valid for 30 days. Additional work requires a signed authorization and will be billed separately.',
        ];

        return [
            'id' => (string) Str::uuid(),
            'invoice_number' => 'INV-' . str_pad($this->faker->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'client_id' => $client->id,
            'work_order_id' => $workOrder ? $workOrder->id : null,
            'job_id' => $job ? $job->id : null,
            'invoice_type' => $this->faker->randomElement(['invoice', 'quote']),
            'status' => $this->faker->randomElement(['draft', 'issued', 'paid', 'overdue', 'cancelled']),
            'issue_date' => $this->faker->dateTimeBetween('-60 days', 'now')->format('Y-m-d'),
            'due_date' => $this->faker->dateTimeBetween('now', '+60 days')->format('Y-m-d'),
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discount,
            'total_amount' => $total,
            'amount_paid' => $paid,
            'balance_due' => round($total - $paid, 2),
            'payment_method' => $paid > 0 ? $this->faker->randomElement(['card', 'cash', 'bank_transfer']) : null,
            'payment_date' => $paid > 0 ? $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d') : null,
            'notes' => $this->faker->optional()->randomElement($notesSamples),
            'terms_conditions' => $this->faker->optional()->randomElement($termsSamples),
        ];
    }
}
