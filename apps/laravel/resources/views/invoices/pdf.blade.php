<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $billing->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
        }
        .container {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 40px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .company-info {
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            text-align: right;
        }
        .invoice-meta {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .invoice-meta-left, .invoice-meta-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .invoice-meta-right {
            text-align: right;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e40af;
        }
        .info-row {
            margin-bottom: 5px;
        }
        .label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-issued {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .status-draft {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        .status-cancelled {
            background-color: #e5e7eb;
            color: #374151;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background-color: #2563eb;
            color: white;
        }
        th {
            padding: 12px 10px;
            text-align: left;
            font-weight: bold;
        }
        th.text-right, td.text-right {
            text-align: right;
        }
        tbody tr {
            border-bottom: 1px solid #e5e7eb;
        }
        tbody tr:last-child {
            border-bottom: none;
        }
        td {
            padding: 10px;
        }
        .totals {
            margin-top: 30px;
            float: right;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .totals-row.subtotal {
            font-size: 13px;
        }
        .totals-row.total {
            background-color: #2563eb;
            color: white;
            font-size: 16px;
            font-weight: bold;
            border: none;
            margin-top: 5px;
        }
        .totals-row.balance {
            background-color: #dc2626;
            color: white;
            font-size: 15px;
            font-weight: bold;
            border: none;
        }
        .notes {
            clear: both;
            margin-top: 80px;
            padding: 15px;
            background-color: #f9fafb;
            border-left: 4px solid #2563eb;
        }
        .notes-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #1e40af;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
        }
        .thank-you {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background-color: #dbeafe;
            color: #1e40af;
            font-size: 14px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">Blue Bay Mechanical</div>
                <div>Professional HVAC & Mechanical Services</div>
            </div>
            <div class="invoice-title">INVOICE</div>
        </div>

        <!-- Invoice Meta Info -->
        <div class="invoice-meta">
            <div class="invoice-meta-left">
                <div class="section-title">Bill To:</div>
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
                    {{ $billing->client->name ?? 'N/A' }}
                </div>
                @if($billing->workOrder)
                <div style="margin-top: 10px; color: #6b7280;">
                    Work Order: {{ $billing->workOrder->work_order_number }}
                </div>
                @endif
            </div>
            <div class="invoice-meta-right">
                <div class="info-row">
                    <span class="label">Invoice #:</span>
                    <strong>{{ $billing->invoice_number }}</strong>
                </div>
                <div class="info-row">
                    <span class="label">Status:</span>
                    <span class="status-badge status-{{ $billing->status }}">
                        {{ ucfirst($billing->status) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">Issue Date:</span>
                    {{ \Carbon\Carbon::parse($billing->issue_date)->format('M d, Y') }}
                </div>
                <div class="info-row">
                    <span class="label">Due Date:</span>
                    {{ \Carbon\Carbon::parse($billing->due_date)->format('M d, Y') }}
                </div>
                @if($billing->payment_date)
                <div class="info-row">
                    <span class="label">Payment Date:</span>
                    {{ \Carbon\Carbon::parse($billing->payment_date)->format('M d, Y') }}
                </div>
                @endif
                @if($billing->payment_method)
                <div class="info-row">
                    <span class="label">Payment Method:</span>
                    {{ $billing->payment_method }}
                </div>
                @endif
            </div>
        </div>

        <!-- Line Items Table -->
        <div class="section-title" style="margin-top: 30px;">Description</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 50%;">Item Description</th>
                    <th class="text-right" style="width: 15%;">Quantity</th>
                    <th class="text-right" style="width: 17.5%;">Rate</th>
                    <th class="text-right" style="width: 17.5%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @forelse($billing->lineItems as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">${{ number_format($item->total_price, 2) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #9ca3af;">
                        No line items
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row subtotal">
                <span>Subtotal:</span>
                <span>${{ number_format($billing->subtotal, 2) }}</span>
            </div>
            @if($billing->discount_amount > 0)
            <div class="totals-row subtotal">
                <span>Discount:</span>
                <span>-${{ number_format($billing->discount_amount, 2) }}</span>
            </div>
            @endif
            @if($billing->tax_amount > 0)
            <div class="totals-row subtotal">
                <span>Tax ({{ number_format($billing->tax_rate, 2) }}%):</span>
                <span>${{ number_format($billing->tax_amount, 2) }}</span>
            </div>
            @endif
            <div class="totals-row total">
                <span>Total:</span>
                <span>${{ number_format($billing->total_amount, 2) }}</span>
            </div>
            @if($billing->amount_paid > 0)
            <div class="totals-row subtotal">
                <span>Amount Paid:</span>
                <span>${{ number_format($billing->amount_paid, 2) }}</span>
            </div>
            <div class="totals-row balance">
                <span>Balance Due:</span>
                <span>${{ number_format($billing->balance_due, 2) }}</span>
            </div>
            @endif
        </div>

        <!-- Notes -->
        @if($billing->notes)
        <div class="notes">
            <div class="notes-title">Notes</div>
            <div>{{ $billing->notes }}</div>
        </div>
        @endif

        @if($billing->terms_conditions)
        <div class="notes" style="margin-top: 15px;">
            <div class="notes-title">Terms & Conditions</div>
            <div>{{ $billing->terms_conditions }}</div>
        </div>
        @endif

        <!-- Thank You Message -->
        @if($billing->status === 'paid')
        <div class="thank-you">
            Thank you for your business!
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div>Generated on {{ now()->format('F d, Y \a\t h:i A') }}</div>
            <div style="margin-top: 5px;">Blue Bay Mechanical - All Rights Reserved</div>
        </div>
    </div>
</body>
</html>
