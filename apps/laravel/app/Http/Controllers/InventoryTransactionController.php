<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryTransactionRequest;
use App\Http\Traits\HasPagination;
use App\Models\InventoryTransaction;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class InventoryTransactionController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $transactions = QueryBuilder::for(InventoryTransaction::class)
            ->allowedFilters([
                AllowedFilter::exact('inventory_id'),
                AllowedFilter::exact('work_order_id'),
                'transaction_type',
                'created_by',
            ])
            ->allowedIncludes(['inventory', 'workOrder', 'createdBy'])
            ->allowedSorts(['created_at', 'quantity', 'total_cost'])
            ->paginate($this->getPageSize());

        return response()->json($transactions);
    }

    public function store(InventoryTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Calculate total cost if not provided
        if (empty($data['total_cost']) && isset($data['quantity']) && isset($data['unit_price'])) {
            $data['total_cost'] = round($data['quantity'] * $data['unit_price'], 2);
        }

        $tx = InventoryTransaction::create($data);
        return response()->json($tx, 201);
    }

    public function show(InventoryTransaction $inventory_transaction): JsonResponse
    {
        return response()->json($inventory_transaction);
    }

    public function update(InventoryTransactionRequest $request, InventoryTransaction $inventory_transaction): JsonResponse
    {
        $inventory_transaction->update($request->validated());
        return response()->json($inventory_transaction);
    }

    public function destroy(InventoryTransaction $inventory_transaction): JsonResponse
    {
        $inventory_transaction->delete();
        return response()->json(null, 204);
    }
}
