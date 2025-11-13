<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use App\Models\Client;
use App\Models\Job;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        $user = User::inRandomOrder()->first();
        $client = Client::inRandomOrder()->first();
        $job = Job::inRandomOrder()->first();
        $workOrder = WorkOrder::inRandomOrder()->first();

        $subjects = [
            'HVAC Maintenance Reminder',
            'Service Quote Available',
            'Work Order Update',
            'Inspection Report Ready',
            'Installation Scheduled',
        ];

        $messages = [
            'Reminder: Your scheduled HVAC maintenance is set for the scheduled date. Our technician will perform a full system tune-up, clean filters, check refrigerant levels, and verify thermostat operation.',
            'Your service quote is ready. It includes parts, labor, and any recommended upgrades for optimal efficiency. Reply to confirm if you would like to proceed.',
            'The technician has updated the work order: completed diagnostics, replaced the condenser fan motor, and verified proper cooling performance. See attached photos and invoice.',
            'Inspection complete. Minor duct leaks found in the attic. We recommend sealing and re-insulating to improve airflow and efficiency.',
            'Installation scheduled: our crew will arrive on-site to install the new split system. Please ensure clear access to the outdoor unit and interior air handler.',
        ];

        return [
            'id' => (string) Str::uuid(),
            'user_id' => $user ? $user->id : null,
            'client_id' => $client ? $client->id : null,
            'notification_type' => $this->faker->randomElement(['sms', 'email', 'in-app']),
            'subject' => $this->faker->optional()->randomElement($subjects),
            'message' => $this->faker->randomElement($messages),
            'status' => $this->faker->randomElement(['pending', 'scheduled', 'sent', 'failed', 'read']),
            'scheduled_for' => $this->faker->optional()->dateTimeBetween('-2 days', '+7 days'),
            'sent_at' => null,
            'read_at' => null,
            'related_job_id' => $job ? $job->id : null,
            'related_work_order_id' => $workOrder ? $workOrder->id : null,
            'metadata' => null,
        ];
    }
}
