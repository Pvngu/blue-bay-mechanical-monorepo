import { z } from 'zod';
import { FilterConfig } from '@/types/filters';
import { FormFieldConfig } from '@/types/form';

import * as GruposConfig from './grupos.config';
import * as ClientsConfig from './clients.config';
import * as TechniciansConfig from './technicians.config';
import * as SchedulingConfig from './scheduling.config';
import * as WorkOrdersConfig from './workOrders.config';
import * as InventoryConfig from './inventory.config';

// Define the structure of a resource configuration
export interface ResourceConfig<T = any> {
    columns: any;
    type: T;
    includes?: string[];
    filters?: FilterConfig[];
    schema?: z.ZodTypeAny;
    formConfig?: FormFieldConfig[];
    csvHeaders?: string[];
    customActions?: Array<{
        label: string;
        onClick: (row: T) => void;
        className?: string;
    }>;
}

// Build the resource config map automatically
export const resourceConfigMap: { [key: string]: ResourceConfig } = {
    grupos: {
        columns: GruposConfig.GrupoColumns,
        type: {} as GruposConfig.Grupo,
        includes: GruposConfig.GrupoIncludes,
        filters: GruposConfig.GrupoFilters,
        schema: GruposConfig.GrupoSchema,
        formConfig: GruposConfig.GrupoFormConfig,
    },
    clients: {
        columns: ClientsConfig.ClientColumns,
        type: {} as ClientsConfig.Client,
        includes: ClientsConfig.ClientIncludes,
        filters: ClientsConfig.ClientFilters,
        schema: ClientsConfig.ClientSchema,
        formConfig: ClientsConfig.ClientFormConfig,
    },
    technicians: {
        columns: TechniciansConfig.TechnicianColumns,
        type: {} as TechniciansConfig.Technician,
        includes: TechniciansConfig.TechnicianIncludes,
        filters: TechniciansConfig.TechnicianFilters,
        schema: TechniciansConfig.TechnicianSchema,
        formConfig: TechniciansConfig.TechnicianFormConfig,
    },
    scheduling: {
        columns: SchedulingConfig.SchedulingColumns,
        type: {} as SchedulingConfig.Scheduling,
        includes: SchedulingConfig.SchedulingIncludes,
        filters: SchedulingConfig.SchedulingFilters,
        schema: SchedulingConfig.SchedulingSchema,
        formConfig: SchedulingConfig.SchedulingFormConfig,
    },
    'work-orders': {
        columns: WorkOrdersConfig.WorkOrderColumns,
        type: {} as WorkOrdersConfig.WorkOrder,
        includes: WorkOrdersConfig.WorkOrderIncludes,
        filters: WorkOrdersConfig.WorkOrderFilters,
        schema: WorkOrdersConfig.WorkOrderSchema,
        formConfig: WorkOrdersConfig.WorkOrderFormConfig,
    },
    inventory: {
        columns: InventoryConfig.InventoryColumns,
        type: {} as InventoryConfig.Inventory,
        includes: InventoryConfig.InventoryIncludes,
        filters: InventoryConfig.InventoryFilters,
        schema: InventoryConfig.InventorySchema,
        formConfig: InventoryConfig.InventoryFormConfig,
    },
};

// Export all individual configs for direct access if needed
export * from './grupos.config';
export * from './clients.config';
export * from './technicians.config';
export * from './scheduling.config';
export * from './workOrders.config';
export * from './inventory.config';