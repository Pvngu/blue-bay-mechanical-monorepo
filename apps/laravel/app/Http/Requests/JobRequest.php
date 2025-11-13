<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $jobId = $this->route('job');
        
        return [
            'job_code' => [
                'required',
                'string',
                'max:50',
                'unique:jobs,job_code' . ($jobId ? ',' . $jobId : ''),
            ],
            'client_id' => 'required|exists:clients,id',
            'technician_id' => 'nullable|exists:technicians,id',
            'address' => 'required|string',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|date_format:H:i:s',
            'estimated_duration_minutes' => 'nullable|integer|min:0',
            'status' => 'required|in:scheduled,in-progress,completed,urgent,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'description' => 'required|string',
            'completion_notes' => 'nullable|string',
            'completed_at' => 'nullable|date',
        ];
    }
}
