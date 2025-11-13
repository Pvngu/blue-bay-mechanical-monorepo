<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Http\Traits\HasPagination;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ActivityLogController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $activityLogs = QueryBuilder::for(ActivityLog::class)
            ->allowedFilters([
                'entity',
                'action',
                'description',
                AllowedFilter::exact('user_id'),
                AllowedFilter::exact('loggable_type'),
                AllowedFilter::exact('loggable_id'),
                AllowedFilter::scope('datetime_from', 'whereDatetimeFrom'),
                AllowedFilter::scope('datetime_to', 'whereDatetimeTo'),
            ])
            ->allowedSorts(['datetime', 'action', 'entity', 'created_at'])
            ->allowedIncludes(['user', 'loggable'])
            ->defaultSort('-datetime')
            ->paginate($this->getPageSize());

        return response()->json($activityLogs);
    }
}
