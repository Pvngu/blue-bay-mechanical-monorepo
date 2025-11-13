import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { FormFieldConfig } from '@/types/form';
import { FilterConfig } from '@/types/filters';

export type Client = {
  id: number;
  client_code: string;
  name: string;
  email?: string | null;
  phone: string;
  address: string;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  preferred_contact?: 'email' | 'phone' | 'sms' | null;
  preferred_language?: 'en' | 'es' | null;
  service_history_count?: number;
  last_service_date?: string | null;
  notes?: string | null;
  is_active?: boolean;
};

export const ClientIncludes: string[] = [];

export const ClientFilters: FilterConfig[] = [
  { id: 'search', label: 'Buscar por nombre, email o teléfono...', type: 'search' },
  {
    id: 'preferred_contact',
    label: 'Preferencia de contacto',
    type: 'multiselect',
    options: [
      { label: 'Email', value: 'email' },
      { label: 'Teléfono', value: 'phone' },
      { label: 'SMS', value: 'sms' },
    ],
  },
  {
    id: 'preferred_language',
    label: 'Idioma',
    type: 'multiselect',
    options: [
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ],
  },
  { id: 'is_active', label: 'Activo', type: 'multiselect', options: [ { label: 'Sí', value: 'true' }, { label: 'No', value: 'false' } ] },
];

export const ClientSchema = z.object({
  id: z.number().optional().nullable(),
  client_code: z.string().min(1, 'El código del cliente es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  preferred_contact: z.union([z.literal('email'), z.literal('phone'), z.literal('sms')]).optional().nullable(),
  preferred_language: z.union([z.literal('en'), z.literal('es')]).optional().nullable(),
  service_history_count: z.number().int().optional().nullable(),
  last_service_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const ClientColumns: ColumnDef<Client>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'client_code', header: 'Código' },
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Teléfono' },
  { accessorKey: 'city', header: 'Ciudad' },
  { accessorKey: 'state', header: 'Estado' },
  { accessorKey: 'is_active', header: 'Activo' },
];

export const ClientFormConfig: FormFieldConfig[] = [
  {
    name: 'client_code',
    label: 'Código',
    type: 'text',
    placeholder: 'Código del cliente',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Nombre completo',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Correo electrónico (opcional)',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'phone',
    label: 'Teléfono',
    type: 'text',
    placeholder: 'Teléfono',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'address',
    label: 'Dirección',
    type: 'textarea',
    placeholder: 'Dirección completa',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  {
    name: 'city',
    label: 'Ciudad',
    type: 'text',
    placeholder: 'Ciudad (opcional)',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'state',
    label: 'Estado',
    type: 'text',
    placeholder: 'Estado (opcional)',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'postal_code',
    label: 'Código Postal',
    type: 'text',
    placeholder: 'Código postal (opcional)',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'country',
    label: 'País',
    type: 'select',
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Mexico', value: 'MX' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'preferred_contact',
    label: 'Preferencia de contacto',
    type: 'select',
    options: [
      { label: 'Email', value: 'email' },
      { label: 'Teléfono', value: 'phone' },
      { label: 'SMS', value: 'sms' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'preferred_language',
    label: 'Idioma',
    type: 'select',
    options: [
      { label: 'English', value: 'en' },
      { label: 'Español', value: 'es' },
    ],
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'service_history_count',
    label: 'Historial de servicios',
    type: 'number',
    placeholder: '0',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'last_service_date',
    label: 'Último servicio',
    type: 'date',
    placeholder: 'Última fecha de servicio',
    columns: { container: 6, label: 12, wrapper: 12 },
  },
  {
    name: 'notes',
    label: 'Notas',
    type: 'textarea',
    placeholder: 'Notas (opcional)',
    columns: { container: 12, label: 12, wrapper: 12 },
  },
  { name: 'is_active', label: 'Activo', type: 'checkbox', columns: { container: 6, label: 12, wrapper: 12 } },
];

export const createClientCustomActions = (router: any) => [
  {
    label: 'Ver Cliente',
    onClick: (row: Client) => {
      router.push(`/admin/clients/${row.id}`);
    },
  },
];

export default {} as Client;
