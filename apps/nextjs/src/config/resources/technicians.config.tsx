import React from 'react';
import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { FormFieldConfig } from '@/types/form';
import { FilterConfig } from '@/types/filters';
import { Badge } from '@/components/ui/badge';

export type Technician = {
  id: number;
  user_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  employee_id: string;
  specialization?: string | null;
  location?: 'San Diego' | 'Tijuana' | 'Both' | null;
  certification_level?: string | null;
  hourly_rate?: number | null;
  is_available?: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
};

export const TechnicianIncludes: string[] = [];

export const TechnicianFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar por nombre, empleado o especialidad...', type: 'search' },
  {
    id: 'location',
    label: 'Ubicación',
    type: 'multiselect',
    options: [
      { label: 'San Diego', value: 'San Diego' },
      { label: 'Tijuana', value: 'Tijuana' },
      { label: 'Both', value: 'Both' },
    ],
  },
  { id: 'is_available', label: 'Disponible', type: 'multiselect', options: [ { label: 'Sí', value: 'true' }, { label: 'No', value: 'false' } ] },
];

export const TechnicianSchema = z.object({
  id: z.number().optional().nullable(),
  user_id: z.number().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  employee_id: z.string().min(1, 'El ID de empleado es requerido'),
  specialization: z.string().optional().nullable(),
  location: z.union([z.literal('San Diego'), z.literal('Tijuana'), z.literal('Both')]).optional().nullable(),
  certification_level: z.string().optional().nullable(),
  hourly_rate: z.number().optional().nullable(),
  is_available: z.boolean().optional(),
  current_latitude: z.number().optional().nullable(),
  current_longitude: z.number().optional().nullable(),
});

export const TechnicianColumns: ColumnDef<Technician>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'first_name', header: 'First name' },
  { accessorKey: 'last_name', header: 'Last name' },
  { accessorKey: 'employee_id', header: 'Empleado' },
  { accessorKey: 'specialization', header: 'Especialidad' },
  { accessorKey: 'location', header: 'Ubicación' },
  { accessorKey: 'certification_level', header: 'Certificación' },
  {
    accessorKey: 'hourly_rate',
    header: 'Tarifa/h',
    cell: ({ row }) => {
      const val = row.getValue('hourly_rate') as number | null | undefined;
      if (val === null || typeof val === 'undefined') return '-';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    },
  },
  {
    accessorKey: 'is_available',
    header: 'Disponible',
    cell: ({ row }) => {
      const val = row.getValue('is_available') as boolean | null | undefined;
      return val ? (
        <Badge className="bg-green-600 text-white">Sí</Badge>
      ) : (
        <Badge className="bg-red-600 text-white">No</Badge>
      );
    },
  },
];

export const TechnicianFormConfig: FormFieldConfig[] = [
  { name: 'user_id', label: 'Usuario (ID)', type: 'number', placeholder: 'ID del usuario (opcional)', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'first_name', label: 'First name', type: 'text', placeholder: 'First name', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'last_name', label: 'Last name', type: 'text', placeholder: 'Last name', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'employee_id', label: 'ID Empleado', type: 'text', placeholder: 'ID de empleado', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'specialization', label: 'Especialidad', type: 'text', placeholder: 'Especialidad (opcional)', columns: { container: 6, label: 12, wrapper: 12 } },
  {
    name: 'location',
    label: 'Ubicación',
    type: 'select',
    options: [
      { label: 'San Diego', value: 'San Diego' },
      { label: 'Tijuana', value: 'Tijuana' },
      { label: 'Both', value: 'Both' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  { name: 'certification_level', label: 'Nivel de certificación', type: 'text', placeholder: 'Nivel de certificación (opcional)', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'hourly_rate', label: 'Tarifa/h', type: 'number', placeholder: 'Tarifa por hora', columns: { container: 6, label: 12, wrapper: 12 } },
  { name: 'is_available', label: 'Disponible', type: 'checkbox', columns: { container: 6, label: 12, wrapper: 12 } },
];

export const createTechnicianCustomActions = (router: any) => [
  {
    label: 'Ver Técnico',
    onClick: (row: Technician) => {
      router.push(`/admin/technicians/${row.id}`);
    },
  },
];

export default {} as Technician;
