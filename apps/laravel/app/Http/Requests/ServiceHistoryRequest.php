<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'job_id' => ['nullable', 'exists:scheduling,id'],
            'work_order_id' => ['nullable', 'exists:work_orders,id'],
            'service_date' => ['required', 'date'],
            'service_type' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'technician_id' => ['nullable', 'exists:technicians,id'],
            'amount_charged' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
