import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { FormFieldConfig } from '@/types/form';
import { FilterConfig } from '@/types/filters';
import { formatDateMX } from '@/lib/utils/dateFormat';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ImagePreviewDialog } from '@/components/common/ImagePreviewDialog';
import { ImageIcon } from 'lucide-react';

export type WorkOrder = {
  id: string;
  work_order_number: string;
  job_id?: string | null;
  client_id: number;
  technician_id?: number | null;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | null;
  scheduled_date?: string | null;
  completed_date?: string | null;
  technician_notes?: string | null;
  client_signature?: string | null;
  signature_date?: string | null;
  labor_hours?: number | null;
  labor_cost?: number | null;
  parts_cost?: number | null;
  total_cost?: number | null;
  photos?: Array<{
    id: string;
    photo_url: string;
    caption?: string;
  }>;
  created_at?: string;
  updated_at?: string;
};

export const WorkOrderIncludes: string[] = ['client', 'technician', 'job', 'photos'];

export const WorkOrderFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar por número, título...', type: 'search' },
  {
    id: 'status',
    label: 'Estado',
    type: 'multiselect',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  {
    id: 'priority',
    label: 'Prioridad',
    type: 'multiselect',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Normal', value: 'normal' },
      { label: 'High', value: 'high' },
    ],
  },
  {
    id: 'client_id',
    label: 'Cliente',
    type: 'dynamic-multiselect',
    resource: 'clients',
    optionLabelKey: 'name',
    optionValueKey: 'id',
  },
  {
    id: 'technician_id',
    label: 'Técnico',
    type: 'dynamic-multiselect',
    resource: 'technicians',
    optionLabelKey: 'first_name',
    optionValueKey: 'id',
  },
];

export const WorkOrderSchema = z.object({
  id: z.string().optional().nullable(),
  work_order_number: z.string().min(1, 'El número de orden es requerido'),
  job_id: z.string().optional().nullable(),
  client_id: z.number({ message: 'El cliente es requerido' }).min(1),
  technician_id: z.number().optional().nullable(),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high']).optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
  technician_notes: z.string().optional().nullable(),
  client_signature: z.string().optional().nullable(),
  signature_date: z.string().optional().nullable(),
  labor_hours: z.number().optional().nullable(),
  labor_cost: z.number().optional().nullable(),
  parts_cost: z.number().optional().nullable(),
  total_cost: z.number().optional().nullable(),
  // Photos will be handled separately via the photos API endpoint
  photos: z.array(z.any()).optional(),
});

export const WorkOrderColumns: ColumnDef<WorkOrder>[] = [
  { accessorKey: 'work_order_number', header: 'WO #' },
  { 
    accessorKey: 'client_id', 
    header: 'Client', 
    accessorFn: (row) => (row as any)?.client?.name ?? '-' 
  },
  { 
    accessorKey: 'technician_id', 
    header: 'Technician', 
    accessorFn: (row) => {
      const tech = (row as any)?.technician;
      if (!tech) return '-';
      return `${tech.first_name || ''} ${tech.last_name || ''}`.trim() || '-';
    }
  },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const value = String(info.getValue() ?? '');
      let className = '';

      switch (value) {
        case 'pending':
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

      return <Badge className={className}>{value}</Badge>;
    },
  },
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
          display = 'high';
          break;
        case 'normal':
          className = 'bg-yellow-500 text-black';
          display = 'normal';
          break;
        case 'low':
          className = 'bg-green-600 text-white';
          display = 'low';
          break;
        default:
          className = 'bg-gray-200 text-black';
          display = value || 'N/A';
      }

      return <Badge className={className}>{display}</Badge>;
    },
  },
  {
    accessorKey: 'scheduled_date',
    header: 'Scheduled',
    accessorFn: (row) => row.scheduled_date ? formatDateMX(row.scheduled_date) : '-',
  },
  {
    accessorKey: 'total_cost',
    header: 'Total Cost',
    accessorFn: (row) => row.total_cost ? `$${Number(row.total_cost).toFixed(2)}` : '-',
  },
  {
    accessorKey: 'photos',
    header: 'Photos',
    cell: (info) => {
      const row = info.row.original;
      const photos = row.photos || [];
      const [previewOpen, setPreviewOpen] = React.useState(false);
      
      if (photos.length === 0) {
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">0</span>
          </div>
        );
      }

      const imageData = photos.map(p => ({ url: p.photo_url, caption: p.caption }));

      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex -space-x-2">
              {photos.slice(0, 3).map((photo, idx) => (
                <div
                  key={photo.id}
                  className="w-8 h-8 rounded-md border-2 border-background overflow-hidden"
                  style={{ zIndex: 3 - idx }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-xs font-medium">{photos.length}</span>
          </button>
          
          <ImagePreviewDialog
            images={imageData}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        </>
      );
    },
  },
];

export const WorkOrderFormConfig: FormFieldConfig[] = [
  {
    name: 'work_order_number',
    label: 'Work Order Number',
    type: 'text',
    placeholder: 'WO-XXXX',
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
    name: 'job_id',
    label: 'Related Job (Scheduling)',
    type: 'dynamic-select',
    resource: 'scheduling',
    optionLabelKey: 'job_number',
    optionValueKey: 'id',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Work order title',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Detailed description of work',
    rows: 4,
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Pending', value: 'pending' },
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
    name: 'completed_date',
    label: 'Completed Date',
    type: 'datetime',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'labor_hours',
    label: 'Labor Hours',
    type: 'number',
    placeholder: '0.00',
    step: 0.25,
    min: 0,
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'labor_cost',
    label: 'Labor Cost ($)',
    type: 'number',
    placeholder: '0.00',
    step: 0.01,
    min: 0,
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'parts_cost',
    label: 'Parts Cost ($)',
    type: 'number',
    placeholder: '0.00',
    step: 0.01,
    min: 0,
    columns: { container: 4, label: 12, wrapper: 12 },
  },
  {
    name: 'total_cost',
    label: 'Total Cost ($)',
    type: 'number',
    placeholder: '0.00',
    step: 0.01,
    min: 0,
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'technician_notes',
    label: 'Technician Notes',
    type: 'textarea',
    placeholder: 'Internal notes for technicians',
    rows: 3,
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'photos',
    label: 'Work Order Photos',
    type: 'file',
    accept: 'image/*',
    multiple: true,
    description: 'Upload photos related to this work order (JPG, PNG, etc.)',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
];

export const createWorkOrderCustomActions = (router: any) => [
  {
    label: 'View Details',
    onClick: (row: WorkOrder) => {
      router.push(`/admin/work-orders/${row.id}`);
    },
  },
  {
    label: 'View Photos',
    onClick: (row: WorkOrder) => {
      router.push(`/admin/work-orders/${row.id}/photos`);
    },
  },
];

export default {} as WorkOrder;
