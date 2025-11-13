<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InventoryRequest extends FormRequest
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
        $inventory = $this->route('inventory');
        $inventoryId = $inventory ? (is_object($inventory) ? $inventory->id : $inventory) : null;

        return [
            'inventory_code' => ['required', 'string', 'max:50', 'unique:inventories,inventory_code' . ($inventoryId ? ',' . $inventoryId : '')],
            'part_name' => ['required', 'string', 'max:255'],
            'part_number' => ['required', 'string', 'max:100'],
            'category' => ['required', 'in:hvac,electrical,plumbing,tools,filters,other'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'in:San Diego,Tijuana,Both'],
            'unit_price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'supplier' => ['nullable', 'string', 'max:255'],
            'supplier_contact' => ['nullable', 'string', 'max:255'],
            'last_restocked' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
