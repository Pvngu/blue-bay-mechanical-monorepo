'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Trash2, DollarSign } from 'lucide-react';
import { formatDateMX } from '@/lib/utils/dateFormat';
import { Billing } from '@/types/api';

export default function BillingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: invoice, isLoading } = useQuery<Billing>({
    queryKey: ['billing', id],
    queryFn: () => apiService.getBillingById(id),
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-600 text-white';
      case 'issued':
        return 'bg-blue-600 text-white';
      case 'overdue':
        return 'bg-red-600 text-white';
      case 'draft':
        return 'bg-gray-400 text-white';
      case 'cancelled':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
              window.open(`${baseURL}/api/v1/billing/${id}/pdf`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/billing?edit=${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card>
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{invoice.invoice_number}</h1>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Invoice Type</div>
              <div className="font-medium capitalize">{invoice.invoice_type}</div>
            </div>
          </div>

          {/* Client & Dates Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm">
                <p className="font-medium">{invoice.client?.name || 'Unknown Client'}</p>
              </div>
              {invoice.work_order && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    Work Order: {invoice.work_order.work_order_number}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Issue Date:</span>{' '}
                  <span className="font-medium">{formatDateMX(invoice.issue_date)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>{' '}
                  <span className="font-medium">{formatDateMX(invoice.due_date)}</span>
                </div>
                {invoice.payment_date && (
                  <div>
                    <span className="text-muted-foreground">Payment Date:</span>{' '}
                    <span className="font-medium">{formatDateMX(invoice.payment_date)}</span>
                  </div>
                )}
                {invoice.payment_method && (
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>{' '}
                    <span className="font-medium">{invoice.payment_method}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Description</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right py-3">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      No line items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Tax ({invoice.tax_rate}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold py-3 border-t">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
              {invoice.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium">{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold py-3 border-t">
                    <span>Balance Due:</span>
                    <span className="text-red-600">{formatCurrency(invoice.balance_due)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms_conditions) && (
            <div className="space-y-4 border-t pt-6">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms_conditions && (
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {invoice.terms_conditions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Thank You Note */}
          {invoice.status === 'paid' && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Thank you for your business!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
