<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SchedulingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $scheduling = $this->route('scheduling');
        $schedulingId = $scheduling ? (is_object($scheduling) ? $scheduling->id : $scheduling) : null;

        return [
            'job_number' => ['required', 'string', 'max:50', 'unique:scheduling,job_number' . ($schedulingId ? ',' . $schedulingId : '')],
            'client_id' => ['required', 'exists:clients,id'],
            'technician_id' => ['nullable', 'exists:technicians,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'service_type' => ['required', 'string', 'max:100'],
            'status' => ['nullable', 'in:scheduled,in_progress,completed,cancelled'],
            'priority' => ['nullable', 'string', 'max:50'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'estimated_duration' => ['nullable', 'integer', 'min:0'],
            'actual_start_time' => ['nullable', 'date'],
            'actual_end_time' => ['nullable', 'date'],
            'location_address' => ['required', 'string'],
            'location_lat' => ['nullable', 'numeric'],
            'location_lng' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
