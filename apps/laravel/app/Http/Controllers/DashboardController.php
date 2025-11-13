<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\WorkOrder;
use App\Models\Technician;
use App\Models\Billing;
use App\Models\Scheduling;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        
        // Get date range from request or default to current month
        $startDate = $request->input('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->startOfMonth();
        
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfMonth();
        
        // For backwards compatibility, keep these variables
        $startOfMonth = $startDate;
        $endOfMonth = $endDate;

        // Today's jobs count
        $todaysJobs = Scheduling::whereDate('scheduled_date', $today)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->count();

        // Active technicians count (available technicians)
        $activeTechnicians = Technician::where('is_available', true)->count();

        // Revenue (this month)
        $revenue = Billing::whereBetween('issue_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid')
            ->sum('total_amount');

        // Completion rate (this month)
        $totalJobs = WorkOrder::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $completedJobs = WorkOrder::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'completed')
            ->count();
        $completionRate = $totalJobs > 0 ? round(($completedJobs / $totalJobs) * 100, 2) : 0;

        // Active jobs (in progress or pending)
        $activeJobs = WorkOrder::with(['client', 'technician'])
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('scheduled_date', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'work_order_number' => $job->work_order_number,
                    'title' => $job->title,
                    'client_name' => $job->client ? $job->client->name ?? $job->client->name : 'N/A',
                    'technician_name' => $job->technician->first_name ?? 'Unassigned',
                    'status' => $job->status,
                    'priority' => $job->priority,
                    'scheduled_date' => $job->scheduled_date ? Carbon::parse($job->scheduled_date)->format('Y-m-d') : null,
                ];
            });

        // Recent completions
        $recentCompletions = WorkOrder::with(['client', 'technician.user'])
            ->where('status', 'completed')
            ->orderBy('completed_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'work_order_number' => $job->work_order_number,
                    'title' => $job->title,
                    'client_name' => $job->client ? $job->client->name ?? $job->client->name : 'N/A',
                    'technician_name' => $job->technician->first_name ?? 'Unassigned',
                    'completed_date' => $job->completed_date ? Carbon::parse($job->completed_date)->format('Y-m-d') : null,
                    'total_cost' => $job->total_cost,
                ];
            });

        // Revenue over time (last 6 months)
        $revenueOverTime = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            
            $monthRevenue = Billing::whereBetween('issue_date', [$monthStart, $monthEnd])
                ->where('status', 'paid')
                ->sum('total_amount');
            
            $revenueOverTime[] = [
                'month' => $monthStart->format('M Y'),
                'revenue' => floatval($monthRevenue),
            ];
        }

        // Job status distribution
        $jobStatusDistribution = WorkOrder::select('status', DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                ];
            });

        // Top technicians by completed jobs (this month)
        $topTechnicians = WorkOrder::select('technician_id', DB::raw('count(*) as completed_jobs'))
            ->with('technician.user')
            ->where('status', 'completed')
            ->whereBetween('completed_date', [$startOfMonth, $endOfMonth])
            ->groupBy('technician_id')
            ->orderBy('completed_jobs', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->technician && $item->technician->user ? $item->technician->user->name : 'Unknown',
                    'completed_jobs' => $item->completed_jobs,
                ];
            });

        return response()->json([
            'stats' => [
                'todaysJobs' => $todaysJobs,
                'activeTechnicians' => $activeTechnicians,
                'revenue' => floatval($revenue),
                'completionRate' => $completionRate,
            ],
            'activeJobs' => $activeJobs,
            'recentCompletions' => $recentCompletions,
            'charts' => [
                'revenueOverTime' => $revenueOverTime,
                'jobStatusDistribution' => $jobStatusDistribution,
                'topTechnicians' => $topTechnicians,
            ],
        ]);
    }
}
