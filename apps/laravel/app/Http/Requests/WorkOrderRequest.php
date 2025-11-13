<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $workOrder = $this->route('work_order') ?? $this->route('work-order') ?? $this->route('workOrder');
        $workOrderId = $workOrder ? (is_object($workOrder) ? $workOrder->id : $workOrder) : null;

        return [
            'work_order_number' => ['required', 'string', 'max:50', 'unique:work_orders,work_order_number' . ($workOrderId ? ',' . $workOrderId : '')],
            'job_id' => ['required', 'exists:scheduling,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'technician_id' => ['nullable', 'exists:technicians,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['nullable', 'in:pending,in_progress,completed,cancelled'],
            'priority' => ['nullable', 'string', 'max:50'],
            'scheduled_date' => ['nullable', 'date'],
            'completed_date' => ['nullable', 'date'],
            'technician_notes' => ['nullable', 'string'],
            'client_signature' => ['nullable', 'string'],
            'signature_date' => ['nullable', 'date'],
            'labor_hours' => ['nullable', 'numeric', 'min:0'],
            'labor_cost' => ['nullable', 'numeric', 'min:0'],
            'parts_cost' => ['nullable', 'numeric', 'min:0'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
