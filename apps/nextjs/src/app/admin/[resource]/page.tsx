'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GenericDataTable } from '@/components/common/GenericDataTable';
import { GenericPagination } from '@/components/common/GenericPagination';
import { useResource, QueryParams } from '@/hooks/useResource';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download } from 'lucide-react';
import { PaginationState, ColumnDef } from '@tanstack/react-table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { DataTableRowActions } from '@/components/common/DataTableRowActions';
import { FilterBar } from '@/components/common/FilterBar';

import { ResourceForm } from '@/components/common/ResourceForm';
import { CsvImportDialog } from '@/components/common/CsvImportDialog';
import { z } from 'zod';
import type { FormFieldConfig } from '@/types/form';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// Import the centralized resource configuration
import { resourceConfigMap } from '@/config/resources';
import { createGrupoCustomActions } from '@/config/resources/grupos.config';
import { createClientCustomActions } from '@/config/resources/clients.config';
import { createTechnicianCustomActions } from '@/config/resources/technicians.config';
import { createSchedulingCustomActions } from '@/config/resources/scheduling.config';
import { createWorkOrderCustomActions } from '@/config/resources/workOrders.config';
import { createInventoryCustomActions } from '@/config/resources/inventory.config';

export default function ResourceListPage() {
    const params = useParams();
    const router = useRouter();
    const resource = (params?.resource as string) || '';

    const { columns: baseColumns, type, includes, filters, schema, formConfig, csvHeaders } = useMemo(() => {
        return resourceConfigMap[resource] || { columns: [], type: {}, includes: [], filters: [], schema: z.object({}), formConfig: [], csvHeaders: [] };
    }, [resource]);

    // Create custom actions dynamically based on resource
    const customActions = useMemo(() => {
        switch (resource) {
            case 'grupos':
                return createGrupoCustomActions(router) as any;
            case 'clients':
                return createClientCustomActions(router) as any;
            case 'technicians':
                return createTechnicianCustomActions(router) as any;
            case 'scheduling':
                return createSchedulingCustomActions(router) as any;
            case 'work-orders':
                return createWorkOrderCustomActions(router) as any;
            case 'inventory':
                return createInventoryCustomActions(router) as any;
            default:
                return [];
        }
    }, [resource, router]);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    // use `undefined` to represent "no selected item" which plays nicer with TS narrowing
    const [sheetItemId, setSheetItemId] = useState<string | number | undefined>(undefined);

    // Call the generic hook with the resource name from the URL
    const { 
        data: paginatedData,
        isLoadingItems,
        queryParams,
        setQueryParams,
        deleteItem,
        updateItem,
        createItem,
        useItem
    } = useResource<typeof type>(
        resource,
        {
            include: includes,
            per_page: 10,
        }
    );

    // `useItem` hook can accept undefined and will only fetch when id is provided
    const { data: itemData, isLoading: isLoadingItem } = useItem(sheetItemId);

    const tableData = paginatedData?.data || [];

    const paginationState: PaginationState = {
        pageIndex: (queryParams.page || 1) - 1,
        pageSize: queryParams.per_page || 10,
    }

    const handleCreate = () => {
        setSheetItemId(undefined);
        setIsSheetOpen(true);
    }

    const handleEdit = (id: string | number) => {
        setSheetItemId(id);
        setIsSheetOpen(true);
    }

    const handlePageChange = (newPage: number) => {
        setQueryParams(prev => ({ ...prev, page: newPage }));
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setQueryParams(prev => ({ ...prev, per_page: newPageSize, page: 1 }));
    };

    const handleImport = async (data: any[]) => {
        try {
            await apiService.bulkImport(resource, data);
            toast.success(`Importación exitosa: ${data.length} registros`);
            setQueryParams(prev => ({ ...prev })); // Trigger refresh
        } catch (error) {
            throw error; // Let the dialog handle the error display
        }
    };

    /**
     * Maneja la descarga de archivos (Excel/CSV)
     * Respeta los filtros actuales aplicados en la tabla
     */
    const handleExport = async (format: 'excel' | 'csv') => {
        try {
            toast.loading(`Exportando a ${format.toUpperCase()}...`);
            
            // Obtenemos el blob del archivo
            const blob = await apiService.exportFile(resource, format, queryParams);
            
            // Creamos un link temporal para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generamos el nombre del archivo con timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'excel' ? 'xlsx' : 'csv';
            const fileName = `${resource}_${timestamp}.${extension}`;
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Limpiamos
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.dismiss();
            toast.success(`Archivo exportado exitosamente: ${fileName}`);
        } catch (error) {
            toast.dismiss();
            console.error('Error al exportar:', error);
            toast.error(`Error al exportar a ${format.toUpperCase()}`);
        }
    };

        const columns = useMemo(() => {
        const actionsColumn: ColumnDef<typeof type> = {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    resource={resource}
                    deleteItem={deleteItem}
                    onEdit={handleEdit}
                    customActions={customActions}
                />
            ),
        };

        return [...baseColumns, actionsColumn];
    }, [baseColumns, resource, deleteItem, customActions]);

    const isEditMode = sheetItemId !== undefined;
    const baseMutation = isEditMode ? updateItem : createItem;

    const onSubmitWithId = {
        ...baseMutation,
        mutate: async (data: any, options?: any) => {
            // Special handling for work-orders with photos
            if (resource === 'work-orders' && data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
                try {
                    // First create/update the work order without photos
                    const photos = data.photos;
                    const workOrderData = { ...data };
                    delete workOrderData.photos;

                    let workOrderId: string;
                    
                    if (isEditMode) {
                        await updateItem.mutateAsync({ id: sheetItemId as string | number, data: workOrderData });
                        workOrderId = sheetItemId as string;
                    } else {
                        const result = await createItem.mutateAsync(workOrderData);
                        workOrderId = result.id;
                    }

                    // Then upload photos
                    for (const file of photos) {
                        const formData = new FormData();
                        formData.append('work_order_id', workOrderId);
                        formData.append('photo', file);
                        formData.append('caption', file.name);
                        
                        try {
                            await apiService.uploadWorkOrderPhoto(workOrderId, formData);
                        } catch (error) {
                            console.error('Error uploading photo:', error);
                        }
                    }

                    // Trigger success callback
                    options?.onSuccess?.();
                } catch (error) {
                    options?.onError?.(error);
                }
            } else {
                // Standard mutation for other resources
                if (isEditMode) {
                    updateItem.mutate({ id: sheetItemId as string | number, data }, options);
                } else {
                    createItem.mutate(data, options);
                }
            }
        },
    } as typeof baseMutation;

    return (
        <div className='container mx-auto py-10 space-y-4'>
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-3xl font-bold capitalize'>{resource}</h1>
                <div className="flex gap-2">
                    {csvHeaders && csvHeaders.length > 0 && (
                        <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Importar CSV
                        </Button>
                    )}
                    
                    {/* Botón de Exportación */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport('excel')}>
                                Exportar a Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv')}>
                                Exportar a CSV (.csv)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar {resource}
                    </Button>
                </div>
            </div>
            <FilterBar 
                config={filters || []}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
            />
            <GenericDataTable 
                columns={columns}
                data={tableData}
                isLoading={isLoadingItems}
            />
            <div className="mt-4 w-fit ml-auto">
                {paginatedData && paginatedData.last_page > 1 && (
                <GenericPagination
                    currentPage={paginatedData.current_page}
                    lastPage={paginatedData.last_page}
                    onPageChange={handlePageChange}
                    pageSize={paginationState.pageSize}
                    onPageSizeChange={handlePageSizeChange}
                />
                )}
            </div>
                        <ResourceForm
              key={sheetItemId !== null ? `edit-${sheetItemId}` : 'create'}
              isOpen={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              isEditMode={isEditMode}
                            schema={schema as z.ZodTypeAny}
                            formConfig={formConfig as FormFieldConfig[]}
              onSubmit={onSubmitWithId}
              isLoadingData={isLoadingItem}
              defaultValues={isEditMode ? itemData : undefined}
            />
            
            <CsvImportDialog
                isOpen={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onImport={handleImport}
                resourceName={resource}
                expectedHeaders={csvHeaders || []}
            />
        </div>
    )
};