import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { FormFieldConfig } from '@/types/form';
import { FilterConfig } from '@/types/filters';
import { formatDateMX } from '@/lib/utils/dateFormat';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export type Inventory = {
  id: string;
  inventory_code: string;
  part_name: string;
  part_number: string;
  category: 'hvac' | 'electrical' | 'plumbing' | 'tools' | 'filters' | 'other';
  stock: number;
  min_stock: number;
  location?: 'San Diego' | 'Tijuana' | 'Both' | null;
  unit_price: number;
  supplier?: string | null;
  supplier_contact?: string | null;
  last_restocked?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export const InventoryIncludes: string[] = [];

export const InventoryFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar por nombre o número de parte...', type: 'search' },
  {
    id: 'category',
    label: 'Categoría',
    type: 'multiselect',
    options: [
      { label: 'HVAC', value: 'hvac' },
      { label: 'Electrical', value: 'electrical' },
      { label: 'Plumbing', value: 'plumbing' },
      { label: 'Tools', value: 'tools' },
      { label: 'Filters', value: 'filters' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    type: 'multiselect',
    options: [
      { label: 'San Diego', value: 'San Diego' },
      { label: 'Tijuana', value: 'Tijuana' },
      { label: 'Both', value: 'Both' },
    ],
  },
  { id: 'is_active', label: 'Activo', type: 'multiselect', options: [{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }] },
];

export const InventorySchema = z.object({
  id: z.string().optional().nullable(),
  inventory_code: z.string().min(1, 'El código es requerido'),
  part_name: z.string().min(1, 'El nombre de la pieza es requerido'),
  part_number: z.string().optional().nullable(),
  category: z.enum(['hvac', 'electrical', 'plumbing', 'tools', 'filters', 'other']),
  stock: z.number().int().min(0).optional(),
  min_stock: z.number().int().min(0).optional(),
  location: z.string().optional().nullable(),
  unit_price: z.number().optional().nullable(),
  supplier: z.string().optional().nullable(),
  supplier_contact: z.string().optional().nullable(),
  last_restocked: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const InventoryColumns: ColumnDef<Inventory>[] = [
  { accessorKey: 'inventory_code', header: 'Code' },
  { accessorKey: 'part_name', header: 'Part Name' },
  { accessorKey: 'part_number', header: 'Part #' },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: (info) => {
      const v = String(info.getValue() ?? 'other');
      return <Badge className="capitalize">{v}</Badge>;
    },
  },
  { accessorKey: 'stock', header: 'Stock' },
  { accessorKey: 'min_stock', header: 'Min Stock' },
  { accessorKey: 'location', header: 'Location' },
  {
    accessorKey: 'unit_price',
    header: 'Unit Price',
    accessorFn: (row) => (row.unit_price != null ? `$${Number(row.unit_price).toFixed(2)}` : '-'),
  },
  { accessorKey: 'supplier', header: 'Supplier' },
  {
    accessorKey: 'last_restocked',
    header: 'Last Restocked',
    accessorFn: (row) => (row.last_restocked ? formatDateMX(row.last_restocked) : '-'),
  },
  {
    accessorKey: 'is_active',
    header: 'Active',
    cell: (info) => {
      const v = Boolean(info.getValue());
      return <Badge className={v ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}>{v ? 'Yes' : 'No'}</Badge>;
    },
  },
];

export const InventoryFormConfig: FormFieldConfig[] = [
  {
    name: 'inventory_code',
    label: 'Inventory Code',
    type: 'text',
    placeholder: 'Code',
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'part_name',
    label: 'Part Name',
    type: 'text',
    placeholder: 'Part name',
    columns: { container: 8, label: 12, wrapper: 12 },
  },
  {
    name: 'part_number',
    label: 'Part Number',
    type: 'text',
    placeholder: 'Part #',
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'HVAC', value: 'hvac' },
      { label: 'Electrical', value: 'electrical' },
      { label: 'Plumbing', value: 'plumbing' },
      { label: 'Tools', value: 'tools' },
      { label: 'Filters', value: 'filters' },
      { label: 'Other', value: 'other' },
    ],
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'stock',
    label: 'Stock',
    type: 'number',
    min: 0,
    columns: { container: 2, label: 12, wrapper: 12 },
  },
  {
    name: 'min_stock',
    label: 'Min Stock',
    type: 'number',
    min: 0,
    columns: { container: 2, label: 12, wrapper: 12 },
  },
  {
    name: 'location',
    label: 'Location',
    type: 'select',
    options: [
      { label: 'San Diego', value: 'San Diego' },
      { label: 'Tijuana', value: 'Tijuana' },
      { label: 'Both', value: 'Both' },
    ],
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'unit_price',
    label: 'Unit Price ($)',
    type: 'number',
    step: 0.01,
    min: 0,
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'supplier',
    label: 'Supplier',
    type: 'text',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'supplier_contact',
    label: 'Supplier Contact',
    type: 'text',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'last_restocked',
    label: 'Last Restocked',
    type: 'date',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'is_active',
    label: 'Active',
    type: 'checkbox',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
];

export const createInventoryCustomActions = (router: any) => [
  {
    label: 'View Inventory',
    onClick: (row: Inventory) => {
      router.push(`/admin/inventory/${row.id}`);
    },
  },
];

export default {} as Inventory;
