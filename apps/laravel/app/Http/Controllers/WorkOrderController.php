<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkOrderRequest;
use App\Http\Traits\HasPagination;
use App\Models\WorkOrder;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class WorkOrderController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $workOrders = QueryBuilder::for(WorkOrder::class)
            ->allowedFilters([
                'work_order_number',
                AllowedFilter::partial('title'),
                'status',
                'priority',
                AllowedFilter::exact('client_id'),
                AllowedFilter::exact('technician_id'),
            ])
            ->allowedIncludes(['client', 'technician', 'job', 'photos'])
            ->allowedSorts(['work_order_number', 'scheduled_date', 'completed_date', 'created_at'])
            ->paginate($this->getPageSize());

        return response()->json($workOrders);
    }

    public function store(WorkOrderRequest $request): JsonResponse
    {
        $workOrder = WorkOrder::create($request->validated());
        return response()->json($workOrder, 201);
    }

    public function show(WorkOrder $work_order): JsonResponse
    {
        $workOrder = QueryBuilder::for(WorkOrder::class)
            ->where('id', $work_order->id)
            ->allowedIncludes(['client', 'technician', 'job', 'photos'])
            ->first();

        return response()->json($workOrder);
    }

    public function update(WorkOrderRequest $request, WorkOrder $work_order): JsonResponse
    {
        $work_order->update($request->validated());
        return response()->json($work_order);
    }

    public function destroy(WorkOrder $work_order): JsonResponse
    {
        $work_order->delete();
        return response()->json(null, 204);
    }
}
