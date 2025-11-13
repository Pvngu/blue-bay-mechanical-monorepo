<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceHistoryRequest;
use App\Http\Traits\HasPagination;
use App\Models\ServiceHistory;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ServiceHistoryController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $records = QueryBuilder::for(ServiceHistory::class)
            ->allowedFilters([
                AllowedFilter::exact('client_id'),
                AllowedFilter::exact('job_id'),
                AllowedFilter::exact('work_order_id'),
                AllowedFilter::exact('technician_id'),
                'service_type',
            ])
            ->allowedIncludes(['client', 'job', 'workOrder', 'technician'])
            ->allowedSorts(['service_date', 'created_at'])
            ->paginate($this->getPageSize());

        return response()->json($records);
    }

    public function store(ServiceHistoryRequest $request): JsonResponse
    {
        $record = ServiceHistory::create($request->validated());
        return response()->json($record, 201);
    }

    public function show(ServiceHistory $service_history): JsonResponse
    {
        return response()->json($service_history);
    }

    public function update(ServiceHistoryRequest $request, ServiceHistory $service_history): JsonResponse
    {
        $service_history->update($request->validated());
        return response()->json($service_history);
    }

    public function destroy(ServiceHistory $service_history): JsonResponse
    {
        $service_history->delete();
        return response()->json(null, 204);
    }
}
