'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, FileText, AlertCircle, Download, Edit, Trash2 } from 'lucide-react';
import { formatDateMX } from '@/lib/utils/dateFormat';
import { Billing, BillingStats } from '@/types/api';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import BillingForm from '@/components/billing/BillingForm';

export default function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Billing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<Billing | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<BillingStats>({
    queryKey: ['billing-stats'],
    queryFn: () => apiService.getBillingStats(),
  });

  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: ['billing-list', page],
    queryFn: () => apiService.getBillingList({ page, per_page: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteBilling(id),
    onSuccess: () => {
      toast.success('Invoice deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['billing-list'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });

  const invoices: Billing[] = billingData?.data || [];

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setSheetOpen(true);
  };

  const handleEditInvoice = (invoice: Billing) => {
    setEditingInvoice(invoice);
    setSheetOpen(true);
  };

  const handleDeleteInvoice = (invoice: Billing) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDownloadPDF = async (invoice: Billing) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      window.open(`${baseURL}/api/v1/billing/${invoice.id}/pdf`, '_blank');
      toast.success('Opening PDF...');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleFormSuccess = () => {
    setSheetOpen(false);
    setEditingInvoice(null);
    queryClient.invalidateQueries({ queryKey: ['billing-list'] });
    queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Quotes</h1>
          <p className="text-muted-foreground">Manage invoices and quotes</p>
        </div>
        <Button onClick={handleNewInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : formatCurrency(stats?.pending_amount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.total_documents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {billingLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices found</div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/billing/${invoice.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{invoice.client?.name || 'Unknown Client'}</p>
                      {invoice.work_order && (
                        <p className="text-sm text-muted-foreground">
                          Work Order: {invoice.work_order.work_order_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(invoice.total_amount)}</p>
                      {invoice.balance_due > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(invoice.balance_due)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Line Items Preview */}
                  {invoice.line_items && invoice.line_items.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium border-t pt-3 mb-2">Description</div>
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-2 text-right">Qty</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                      </div>
                      {invoice.line_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 text-sm">
                          <div className="col-span-6">{item.description}</div>
                          <div className="col-span-2 text-right">{item.quantity}</div>
                          <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
                          <div className="col-span-2 text-right">{formatCurrency(item.total_price)}</div>
                        </div>
                      ))}
                      {invoice.line_items.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{invoice.line_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="mt-4 space-y-1 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax ({invoice.tax_rate}%):</span>
                        <span>{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total_amount)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                    <div>
                      <span>Created: {formatDateMX(invoice.issue_date)}</span>
                      {invoice.due_date && (
                        <span className="ml-4">Due: {formatDateMX(invoice.due_date)}</span>
                      )}
                      {invoice.payment_date && (
                        <span className="ml-4">Paid: {formatDateMX(invoice.payment_date)}</span>
                      )}
                    </div>
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                        title="Edit Invoice"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice)}
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <p className="text-muted-foreground">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {billingData && billingData.last_page > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {page} of {billingData.last_page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(billingData.last_page, p + 1))}
                disabled={page === billingData.last_page}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Invoice Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</SheetTitle>
            <SheetDescription>
              {editingInvoice
                ? 'Update invoice details and line items.'
                : 'Fill in the invoice details and add line items.'}
            </SheetDescription>
          </SheetHeader>
          <BillingForm invoice={editingInvoice} onSuccess={handleFormSuccess} />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice{' '}
              <span className="font-semibold">{invoiceToDelete?.invoice_number}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invoiceToDelete && deleteMutation.mutate(invoiceToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
