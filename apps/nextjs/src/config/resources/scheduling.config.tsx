import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { FormFieldConfig } from '@/types/form';
import { FilterConfig } from '@/types/filters';
import { formatDateMX } from '@/lib/utils/dateFormat';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export type Scheduling = {
  id: string;
  job_number: string;
  client_id: number;
  technician_id?: number | null;
  title: string;
  description?: string | null;
  service_type: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string | null;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration?: number | null;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  location_address: string;
  location_lat?: number | null;
  location_lng?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const SchedulingIncludes: string[] = ['client', 'technician'];

export const SchedulingFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar por título, cliente o técnico...', type: 'search' },
  {
    id: 'status',
    label: 'Estado',
    type: 'multiselect',
    options: [
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  {
    id: 'technician_id',
    label: 'Técnico',
    type: 'dynamic-multiselect',
    resource: 'technicians',
    optionLabelKey: 'first_name',
    optionValueKey: 'id',
  },
  { id: 'scheduled_date', label: 'Fecha programada', type: 'search' },
];

export const SchedulingSchema = z.object({
  id: z.string().optional().nullable(),
  job_number: z.string().min(1, 'El número de trabajo es requerido'),
  client_id: z.number({ message: 'El cliente es requerido' }).min(1),
  technician_id: z.number().optional().nullable(),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional().nullable(),
  service_type: z.string().min(1, 'El tipo de servicio es requerido'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  priority: z.string().optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  scheduled_time: z.string().optional().nullable(),
  estimated_duration: z.number().optional().nullable(),
  actual_start_time: z.string().optional().nullable(),
  actual_end_time: z.string().optional().nullable(),
  location_address: z.string().min(1, 'La dirección es requerida'),
  location_lat: z.number().optional().nullable(),
  location_lng: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const SchedulingColumns: ColumnDef<Scheduling>[] = [
  { accessorKey: 'job_number', header: 'Job #' },
  { accessorKey: 'client_id', header: 'Client', accessorFn: (row) => (row as any)?.client?.name ?? '' },
  { accessorKey: 'technician_id', header: 'Technician', accessorFn: (row) => (row as any)?.technician?.first_name ?? '-' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const value = String(info.getValue() ?? '');
      let className = '';

      switch (value) {
        case 'scheduled':
          className = 'bg-gray-200 text-black';
          break;
        case 'in_progress':
          className = 'bg-yellow-500 text-black';
          break;
        case 'completed':
          className = 'bg-green-600 text-white';
          break;
        case 'cancelled':
          className = 'bg-red-600 text-white';
          break;
        default:
          className = 'bg-gray-200 text-black';
      }

      // Show raw status value (underscores preserved). Example: "in_progress"
      return <Badge className={className}>{value}</Badge>;
    },
  },
  {
    accessorKey: 'scheduled_date',
    header: 'Date',
    accessorFn: (row) => formatDateMX((row as any)?.scheduled_date),
  },
  { accessorKey: 'scheduled_time', header: 'Time' },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: (info) => {
      const value = String(info.getValue() ?? '').toLowerCase();
      let className = '';
      let display = value || 'N/A';

      switch (value) {
        case 'high':
          className = 'bg-red-600 text-white';
          display = 'High';
          break;
        case 'normal':
        case 'medium':
          className = 'bg-yellow-500 text-black';
          display = value === 'medium' ? 'Medium' : 'Normal';
          break;
        case 'low':
          className = 'bg-green-600 text-white';
          display = 'Low';
          break;
        default:
          className = 'bg-gray-200 text-black';
          display = value || 'N/A';
      }

      return <Badge className={className}>{display}</Badge>;
    },
  },
];

export const SchedulingFormConfig: FormFieldConfig[] = [
  {
    name: 'job_number',
    label: 'Job Number',
    type: 'text',
    placeholder: 'Job number',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'client_id',
    label: 'Client',
    type: 'dynamic-select',
    resource: 'clients',
    optionLabelKey: 'name',
    optionValueKey: 'id',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'technician_id',
    label: 'Technician',
    type: 'dynamic-select',
    resource: 'technicians',
    optionLabelKey: 'first_name',
    optionValueKey: 'id',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Job title',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'service_type',
    label: 'Service Type',
    type: 'text',
    placeholder: 'Service type',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Job description',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Normal', value: 'normal' },
      { label: 'High', value: 'high' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'scheduled_date',
    label: 'Scheduled Date',
    type: 'date',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'scheduled_time',
    label: 'Scheduled Time',
    type: 'text',
    placeholder: 'HH:MM',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'estimated_duration',
    label: 'Estimated Duration (mins)',
    type: 'number',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'location_address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Job address',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
];

export const createSchedulingCustomActions = (router: any) => [
  {
    label: 'View Job',
    onClick: (row: Scheduling) => {
      router.push(`/admin/scheduling/${row.id}`);
    },
  },
];

export default {} as Scheduling;
