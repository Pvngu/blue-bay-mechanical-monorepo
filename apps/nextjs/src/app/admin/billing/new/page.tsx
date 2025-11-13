'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  item_type: z.string().optional(),
});

const billingSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  client_id: z.coerce.number().min(1, 'Client is required'),
  work_order_id: z.string().optional().nullable(),
  invoice_type: z.string(),
  status: z.enum(['draft', 'issued', 'paid', 'overdue', 'cancelled']),
  issue_date: z.string(),
  due_date: z.string(),
  tax_rate: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0),
  payment_method: z.string().optional().nullable(),
  payment_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms_conditions: z.string().optional().nullable(),
});

type LineItem = z.infer<typeof lineItemSchema>;
type BillingForm = z.infer<typeof billingSchema>;

export default function NewBillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, item_type: 'service' },
  ]);

  const form = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      invoice_number: `INV-${Date.now()}`,
      invoice_type: 'invoice',
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_rate: 8,
      discount_amount: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const billing = await apiService.createBilling(data.billing);
      
      // Create line items
      for (const item of data.lineItems) {
        await apiService.createBillingLineItem({
          ...item,
          billing_id: billing.id,
          total_price: item.quantity * item.unit_price,
        });
      }
      
      return billing;
    },
    onSuccess: (billing) => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['billing-list'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      router.push(`/admin/billing/${billing.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to create invoice');
    },
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unit_price: 0, item_type: 'service' },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxRate = form.watch('tax_rate') || 0;
    const discountAmount = form.watch('discount_amount') || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      balance_due: total,
    };
  };

  const onSubmit = (data: BillingForm) => {
    const totals = calculateTotals();
    
    createMutation.mutate({
      billing: {
        ...data,
        ...totals,
        amount_paid: 0,
      },
      lineItems: lineItems.filter((item) => item.description.trim() !== ''),
    });
  };

  const totals = calculateTotals();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="issued">Issued</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="work_order_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-sm font-medium">Qty</label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, 'quantity', parseFloat(e.target.value))
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium">Rate ($)</label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateLineItem(index, 'unit_price', parseFloat(e.target.value))
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        value={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({form.watch('tax_rate')}%):</span>
                  <span>${totals.tax_amount.toFixed(2)}</span>
                </div>
                {totals.subtotal > 0 && form.watch('discount_amount') > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${form.watch('discount_amount').toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${totals.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
