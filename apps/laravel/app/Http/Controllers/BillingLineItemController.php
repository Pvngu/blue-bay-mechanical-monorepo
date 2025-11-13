<?php

namespace App\Http\Controllers;

use App\Http\Requests\BillingLineItemRequest;
use App\Http\Traits\HasPagination;
use App\Models\BillingLineItem;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class BillingLineItemController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $items = QueryBuilder::for(BillingLineItem::class)
            ->allowedFilters([
                AllowedFilter::exact('billing_id'),
                'item_type',
            ])
            ->allowedIncludes(['billing'])
            ->allowedSorts(['created_at', 'total_price'])
            ->paginate($this->getPageSize());

        return response()->json($items);
    }

    public function store(BillingLineItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $item = BillingLineItem::create($data);
        return response()->json($item, 201);
    }

    public function show(BillingLineItem $billing_line_item): JsonResponse
    {
        return response()->json($billing_line_item);
    }

    public function update(BillingLineItemRequest $request, BillingLineItem $billing_line_item): JsonResponse
    {
        $billing_line_item->update($request->validated());
        return response()->json($billing_line_item);
    }

    public function destroy(BillingLineItem $billing_line_item): JsonResponse
    {
        $billing_line_item->delete();
        return response()->json(null, 204);
    }
}
