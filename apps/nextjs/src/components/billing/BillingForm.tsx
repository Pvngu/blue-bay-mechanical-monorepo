'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '@/services/apiService';
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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Billing } from '@/types/api';
import { DynamicSelect } from '@/components/common/DynamicSelect';

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  item_type: z.string().optional(),
});

const billingSchema = z.object({
  id: z.string().optional(),
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

interface BillingFormProps {
  invoice?: Billing | null;
  onSuccess?: () => void;
}

export default function BillingFormComponent({ invoice, onSuccess }: BillingFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!invoice;

  const [lineItems, setLineItems] = React.useState<LineItem[]>(
    invoice?.line_items?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      item_type: item.item_type || 'service',
    })) || [{ description: '', quantity: 1, unit_price: 0, item_type: 'service' }]
  );

  const form = useForm<BillingForm>({
    // resolver: zodResolver(billingSchema),
    defaultValues: invoice
      ? {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          work_order_id: invoice.work_order_id || '',
          invoice_type: invoice.invoice_type,
          status: invoice.status,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          tax_rate: Number(invoice.tax_rate),
          discount_amount: Number(invoice.discount_amount),
          payment_method: invoice.payment_method || '',
          payment_date: invoice.payment_date || '',
          notes: invoice.notes || '',
          terms_conditions: invoice.terms_conditions || '',
        }
      : {
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
    onSuccess: () => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: ['billing-list'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to create invoice');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const billing = await apiService.updateBilling(invoice!.id, data.billing);

      // Delete removed line items and update/create line items
      const existingIds = new Set(data.lineItems.map((item: any) => item.id).filter(Boolean));
      const oldIds = invoice?.line_items?.map((item) => item.id) || [];

      for (const oldId of oldIds) {
        if (!existingIds.has(oldId)) {
          await apiService.deleteBillingLineItem(oldId);
        }
      }

      for (const item of data.lineItems) {
        if (item.id) {
          await apiService.updateBillingLineItem(item.id, {
            ...item,
            total_price: item.quantity * item.unit_price,
          });
        } else {
          await apiService.createBillingLineItem({
            ...item,
            billing_id: invoice!.id,
            total_price: item.quantity * item.unit_price,
          });
        }
      }

      return billing;
    },
    onSuccess: () => {
      toast.success('Invoice updated successfully');
      queryClient.invalidateQueries({ queryKey: ['billing-list'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['billing', invoice?.id] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to update invoice');
    },
  });

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, item_type: 'service' }]);
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

    const payload = {
      billing: {
        ...data,
        ...totals,
        amount_paid: invoice?.amount_paid || 0,
      },
      lineItems: lineItems.filter((item) => item.description.trim() !== ''),
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const totals = calculateTotals();
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-4">
        <div className="space-y-4">
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
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <DynamicSelect
                      resource="clients"
                      optionLabelKey="name"
                      optionValueKey="id"
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      placeholder="Select a client"
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
                  <FormLabel>Work Order (Optional)</FormLabel>
                  <FormControl>
                    <DynamicSelect
                      resource="work-orders"
                      optionLabelKey="work_order_number"
                      optionValueKey="id"
                      value={field.value || null}
                      onValueChange={field.onChange}
                      placeholder="Select a work order"
                    />
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
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
        </div>

        {/* Line Items */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
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
                <div className="w-20">
                  <label className="text-sm font-medium">Qty</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-28">
                  <label className="text-sm font-medium">Rate ($)</label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-28">
                  <label className="text-sm font-medium">Amount</label>
                  <Input value={`$${(item.quantity * item.unit_price).toFixed(2)}`} disabled />
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

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({form.watch('tax_rate')}%):</span>
              <span>${totals.tax_amount.toFixed(2)}</span>
            </div>
            {form.watch('discount_amount') > 0 && (
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
        </div>

        <div className="flex justify-end space-x-2 border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
