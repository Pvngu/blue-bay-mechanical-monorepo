<?php

namespace App\Http\Controllers;

use App\Http\Requests\TechnicianRequest;
use App\Http\Traits\HasPagination;
use App\Models\Technician;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class TechnicianController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $technicians = QueryBuilder::for(Technician::class)
            ->allowedFilters([
                'employee_id',
                'specialization',
                'location',
                'certification_level',
                AllowedFilter::exact('user_id'),
                AllowedFilter::exact('is_available'),
            ])
            ->allowedSorts(['employee_id', 'hourly_rate', 'created_at'])
            ->allowedIncludes(['user', 'jobs'])
            ->paginate($this->getPageSize());

        return response()->json($technicians);
    }

    public function store(TechnicianRequest $request): JsonResponse
    {
        $technician = Technician::create($request->validated());
        return response()->json($technician, 201);
    }

    public function show(Technician $technician): JsonResponse
    {
        return response()->json($technician);
    }

    public function update(TechnicianRequest $request, Technician $technician): JsonResponse
    {
        $technician->update($request->validated());
        return response()->json($technician);
    }

    public function destroy(Technician $technician): JsonResponse
    {
        $technician->delete();
        return response()->json(null, 204);
    }
}
