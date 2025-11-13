<?php

namespace App\Http\Controllers;

use App\Http\Requests\BillingRequest;
use App\Http\Traits\HasPagination;
use App\Models\Billing;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class BillingController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $bills = QueryBuilder::for(Billing::class)
            ->allowedFilters([
                'invoice_number',
                AllowedFilter::exact('client_id'),
                AllowedFilter::exact('work_order_id'),
                AllowedFilter::exact('job_id'),
                'status',
            ])
            ->allowedIncludes(['client', 'workOrder', 'job', 'lineItems'])
            ->allowedSorts(['invoice_number', 'issue_date', 'due_date', 'total_amount', 'created_at'])
            ->paginate($this->getPageSize());

        return response()->json($bills);
    }

    /**
     * Get billing statistics
     */
    public function stats(): JsonResponse
    {
        $totalRevenue = Billing::whereIn('status', ['paid', 'issued'])->sum('total_amount');
        $pendingAmount = Billing::whereIn('status', ['issued', 'overdue'])->sum('balance_due');
        $totalDocuments = Billing::count();
        $paidInvoices = Billing::where('status', 'paid')->count();
        $overdueInvoices = Billing::where('status', 'overdue')->count();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'pending_amount' => $pendingAmount,
            'total_documents' => $totalDocuments,
            'paid_invoices' => $paidInvoices,
            'overdue_invoices' => $overdueInvoices,
        ]);
    }

    public function store(BillingRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Calculate totals if missing
        if (empty($data['total_amount'])) {
            $subtotal = $data['subtotal'] ?? 0;
            $taxAmount = isset($data['tax_rate']) ? round(($subtotal * ($data['tax_rate'] / 100)), 2) : ($data['tax_amount'] ?? 0);
            $total = round($subtotal + $taxAmount - ($data['discount_amount'] ?? 0), 2);
            $data['tax_amount'] = $taxAmount;
            $data['total_amount'] = $total;
            $data['balance_due'] = $total - ($data['amount_paid'] ?? 0);
        }

        $bill = Billing::create($data);
        return response()->json($bill, 201);
    }

    public function show(Billing $billing): JsonResponse
    {
        $billing->load(['client', 'workOrder', 'job', 'lineItems']);
        return response()->json($billing);
    }

    public function update(BillingRequest $request, Billing $billing): JsonResponse
    {
        $billing->update($request->validated());
        return response()->json($billing);
    }

    public function destroy(Billing $billing): JsonResponse
    {
        $billing->delete();
        return response()->json(null, 204);
    }

    /**
     * Download invoice as PDF
     */
    public function downloadPdf(Billing $billing)
    {
        $billing->load(['client', 'workOrder', 'job', 'lineItems']);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.pdf', [
            'billing' => $billing
        ]);

        return $pdf->download('invoice-' . $billing->invoice_number . '.pdf');
    }
}
