<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'notification_type' => ['required', 'in:sms,email,in-app'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'status' => ['nullable', 'in:pending,scheduled,sent,failed,read'],
            'scheduled_for' => ['nullable', 'date'],
            'sent_at' => ['nullable', 'date'],
            'read_at' => ['nullable', 'date'],
            'related_job_id' => ['nullable', 'exists:jobs,id'],
            'related_work_order_id' => ['nullable', 'exists:work_orders,id'],
            'metadata' => ['nullable', 'json'],
        ];
    }
}
