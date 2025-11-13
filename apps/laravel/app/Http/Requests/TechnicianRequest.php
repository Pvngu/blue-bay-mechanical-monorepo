<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TechnicianRequest extends FormRequest
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
        $technicianId = $this->route('technician');
        
        return [
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'user_id' => 'nullable|exists:users,id',
            'employee_id' => [
                'required',
                'string',
                'max:50',
                'unique:technicians,employee_id' . ($technicianId ? ',' . $technicianId : ''),
            ],
            'specialization' => 'nullable|string|max:100',
            'location' => 'nullable|in:San Diego,Tijuana,Both',
            'certification_level' => 'nullable|string|max:50',
            'hourly_rate' => 'nullable|numeric|min:0|max:99999999.99',
            'is_available' => 'boolean',
            'current_latitude' => 'nullable|numeric|between:-90,90',
            'current_longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}
