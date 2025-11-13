<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryRequest;
use App\Http\Traits\HasPagination;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class InventoryController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $inventories = QueryBuilder::for(Inventory::class)
            ->allowedFilters([
                'inventory_code',
                AllowedFilter::partial('part_name'),
                'part_number',
                'category',
                'location',
                'supplier',
                AllowedFilter::exact('is_active'),
            ])
            ->allowedSorts(['inventory_code', 'part_name', 'stock', 'min_stock', 'unit_price', 'created_at'])
            ->paginate($this->getPageSize());

        return response()->json($inventories);
    }

    public function store(InventoryRequest $request): JsonResponse
    {
        $inventory = Inventory::create($request->validated());
        return response()->json($inventory, 201);
    }

    public function show(Inventory $inventory): JsonResponse
    {
        return response()->json($inventory);
    }

    public function update(InventoryRequest $request, Inventory $inventory): JsonResponse
    {
        $inventory->update($request->validated());
        return response()->json($inventory);
    }

    public function destroy(Inventory $inventory): JsonResponse
    {
        $inventory->delete();
        return response()->json(null, 204);
    }
}
