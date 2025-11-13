<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BillingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $billing = $this->route('billing') ?? $this->route('id');
        $billingId = $billing ? (is_object($billing) ? $billing->id : $billing) : null;

        return [
            'invoice_number' => ['required', 'string', 'max:50', 'unique:billing,invoice_number' . ($billingId ? ',' . $billingId : '')],
            'client_id' => ['required', 'exists:clients,id'],
            'work_order_id' => ['nullable', 'exists:work_orders,id'],
            'job_id' => ['nullable', 'exists:scheduling,id'],
            'invoice_type' => ['nullable', 'in:quote,invoice'],
            'status' => ['nullable', 'in:draft,issued,paid,overdue,cancelled'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'balance_due' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'payment_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
        ];
    }
}
