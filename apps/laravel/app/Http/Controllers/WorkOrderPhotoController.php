<?php

namespace App\Http\Controllers;

use App\Models\WorkOrderPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkOrderPhotoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WorkOrderPhoto::query();

        // Filter by work_order_id if provided
        if ($request->has('filter.work_order_id')) {
            $query->where('work_order_id', $request->input('filter.work_order_id'));
        }

        $photos = $query->orderBy('created_at', 'desc')->get();
        return response()->json($photos);
    }

    public function show(WorkOrderPhoto $work_order_photo): JsonResponse
    {
        return response()->json($work_order_photo);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Max 10MB
            'caption' => 'nullable|string',
        ]);

        // Store the uploaded file
        $file = $request->file('photo');
        $path = $file->store('work-order-photos', 'public');
        
        // Get the full URL
        $photoUrl = asset('storage/' . $path);

        // Create the photo record
        $photo = WorkOrderPhoto::create([
            'work_order_id' => $request->work_order_id,
            'photo_url' => $photoUrl,
            'caption' => $request->caption,
            'uploaded_by' => auth()->id(),
            'uploaded_at' => now(),
        ]);

        return response()->json($photo, 201);
    }

    public function destroy(WorkOrderPhoto $work_order_photo): JsonResponse
    {
        // Delete the physical file from storage
        $path = str_replace(asset('storage/'), '', $work_order_photo->photo_url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        // Delete the database record
        $work_order_photo->delete();
        
        return response()->json(null, 204);
    }
}
