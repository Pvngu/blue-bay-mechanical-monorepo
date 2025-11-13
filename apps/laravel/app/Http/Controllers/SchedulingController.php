<?php

namespace App\Http\Controllers;

use App\Http\Requests\SchedulingRequest;
use App\Http\Traits\HasPagination;
use App\Models\Scheduling;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class SchedulingController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $schedules = QueryBuilder::for(Scheduling::class)
            ->allowedFilters([
                'job_number',
                AllowedFilter::partial('title'),
                'service_type',
                'status',
                'priority',
                AllowedFilter::exact('client_id'),
                AllowedFilter::exact('technician_id'),
                'scheduled_date',
            ])
            ->allowedIncludes(['client', 'technician'])
            ->allowedSorts(['job_number', 'scheduled_date', 'scheduled_time', 'priority', 'created_at'])
            ->paginate($this->getPageSize());

        return response()->json($schedules);
    }

    public function store(SchedulingRequest $request): JsonResponse
    {
        $schedule = Scheduling::create($request->validated());
        return response()->json($schedule, 201);
    }

    public function show(Scheduling $scheduling): JsonResponse
    {
        return response()->json($scheduling);
    }

    public function update(SchedulingRequest $request, Scheduling $scheduling): JsonResponse
    {
        $scheduling->update($request->validated());
        return response()->json($scheduling);
    }

    public function destroy(Scheduling $scheduling): JsonResponse
    {
        $scheduling->delete();
        return response()->json(null, 204);
    }
}
