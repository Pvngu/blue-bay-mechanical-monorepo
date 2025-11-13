<?php

namespace App\Http\Controllers;

use App\Http\Requests\NotificationRequest;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = QueryBuilder::for(Notification::class)
            ->allowedFilters([
                AllowedFilter::exact('user_id'),
                AllowedFilter::exact('client_id'),
                'notification_type',
                'status',
            ])
            ->allowedSorts(['created_at', 'scheduled_for', 'sent_at'])
            ->paginate(25);

        return response()->json($notifications);
    }

    public function show(Notification $notification): JsonResponse
    {
        return response()->json($notification);
    }

    public function store(NotificationRequest $request): JsonResponse
    {
        $notification = Notification::create($request->validated());
        return response()->json($notification, 201);
    }

    public function update(NotificationRequest $request, Notification $notification): JsonResponse
    {
        $notification->update($request->validated());
        return response()->json($notification);
    }

    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();
        return response()->json(null, 204);
    }
}
