<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BillingLineItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['required', 'string'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'item_type' => ['nullable', 'in:labor,parts,service'],
        ];
    }
}
