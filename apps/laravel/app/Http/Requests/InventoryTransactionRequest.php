<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InventoryTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $transaction = $this->route('inventory_transaction') ?? $this->route('inventory-transaction') ?? $this->route('id');

        return [
            'inventory_id' => ['required', 'exists:inventories,id'],
            'work_order_id' => ['nullable', 'exists:work_orders,id'],
            'transaction_type' => ['required', 'in:deduction,restock,adjustment'],
            'quantity' => ['required', 'integer'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'created_by' => ['nullable', 'exists:users,id'],
        ];
    }
}
