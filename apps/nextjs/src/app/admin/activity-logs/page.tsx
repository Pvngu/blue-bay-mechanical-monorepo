'use client';

import { useMemo, useState } from 'react';
import { GenericDataTable } from '@/components/common/GenericDataTable';
import { GenericPagination } from '@/components/common/GenericPagination';
import { useResource } from '@/hooks/useResource';
import { FilterBar } from '@/components/common/FilterBar';
import { ActivityLogColumns, ActivityLogFilters, ActivityLog } from '@/config/resources/activity-logs.config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityLogsPage() {
    const resource = 'activity-logs';
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    // Call the generic hook with the resource name
    const { 
        data: paginatedData,
        isLoadingItems,
        queryParams,
        setQueryParams,
    } = useResource<ActivityLog>(
        resource,
        {
            per_page: 10,
        }
    );

    const tableData = paginatedData?.data || [];

    const handlePageChange = (newPage: number) => {
        setQueryParams(prev => ({ ...prev, page: newPage }));
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setQueryParams(prev => ({ ...prev, per_page: newPageSize, page: 1 }));
    };

    // Add click handler to columns
    const columnsWithClick = useMemo(() => {
        return ActivityLogColumns.map(col => ({
            ...col,
            cell: col.cell ? (props: any) => {
                return (
                    <div 
                        onClick={() => setSelectedLog(props.row.original)}
                        className="cursor-pointer"
                    >
                        {typeof col.cell === 'function' ? col.cell(props) : col.cell}
                    </div>
                );
            } : undefined,
        }));
    }, []);

    return (
        <div className='container mx-auto py-10 space-y-4'>
            <div className='flex justify-between items-center mb-4'>
                <div>
                    <h1 className='text-3xl font-bold'>Activity Logs</h1>
                    <p className='text-muted-foreground mt-1'>
                        Visualiza todos los cambios realizados en el sistema
                    </p>
                </div>
            </div>
            
            <FilterBar 
                config={ActivityLogFilters}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
            />
            
            <GenericDataTable 
                columns={columnsWithClick}
                data={tableData}
                isLoading={isLoadingItems}
            />
            
            <div className="mt-4 w-fit ml-auto">
                {paginatedData && paginatedData.last_page > 1 && (
                    <GenericPagination
                        currentPage={paginatedData.current_page}
                        lastPage={paginatedData.last_page}
                        onPageChange={handlePageChange}
                        pageSize={queryParams.per_page || 10}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalles del Log de Actividad</DialogTitle>
                        <DialogDescription>
                            {selectedLog?.description}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLog && (
                        <div className="space-y-4">
                            {/* Metadata */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Información General</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium">ID:</span>
                                            <p className="text-sm text-muted-foreground">{selectedLog.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Usuario ID:</span>
                                            <p className="text-sm text-muted-foreground">{selectedLog.user_id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Entidad:</span>
                                            <p className="text-sm text-muted-foreground capitalize">{selectedLog.entity}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Acción:</span>
                                            <div className="mt-1">
                                                <Badge variant={
                                                    selectedLog.action === 'CREATED' ? 'default' :
                                                    selectedLog.action === 'UPDATED' ? 'secondary' :
                                                    'destructive'
                                                }>
                                                    {selectedLog.action === 'CREATED' ? 'Creado' :
                                                     selectedLog.action === 'UPDATED' ? 'Actualizado' :
                                                     'Eliminado'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Fecha:</span>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(selectedLog.datetime).toLocaleString('es-MX')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Modelo:</span>
                                            <p className="text-sm text-muted-foreground">{selectedLog.loggable_type}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Changes */}
                            {selectedLog.action === 'CREATED' && selectedLog.json_log?.data?.new && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Datos Creados</CardTitle>
                                        <CardDescription>Valores iniciales del registro</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(selectedLog.json_log.data.new).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-3 gap-4 border-b pb-2">
                                                    <span className="text-sm font-medium capitalize">{key}:</span>
                                                    <span className="col-span-2 text-sm text-green-600 font-mono">
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedLog.action === 'UPDATED' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Cambios Realizados</CardTitle>
                                        <CardDescription>Comparación de valores anteriores y nuevos</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {selectedLog.json_log?.data?.old && selectedLog.json_log?.data?.new &&
                                                Object.keys(selectedLog.json_log.data.new).map((key) => {
                                                    const oldValue = selectedLog.json_log.data.old?.[key];
                                                    const newValue = selectedLog.json_log.data.new?.[key];
                                                    
                                                    if (oldValue === newValue) return null;
                                                    
                                                    return (
                                                        <div key={key} className="border-b pb-3">
                                                            <div className="text-sm font-medium capitalize mb-2">{key}</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-xs text-muted-foreground">Anterior:</span>
                                                                    <p className="text-sm text-red-600 line-through font-mono">
                                                                        {String(oldValue)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs text-muted-foreground">Nuevo:</span>
                                                                    <p className="text-sm text-green-600 font-mono">
                                                                        {String(newValue)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedLog.action === 'DELETED' && selectedLog.json_log?.data?.old && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Datos Eliminados</CardTitle>
                                        <CardDescription>Valores del registro antes de ser eliminado</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(selectedLog.json_log.data.old).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-3 gap-4 border-b pb-2">
                                                    <span className="text-sm font-medium capitalize">{key}:</span>
                                                    <span className="col-span-2 text-sm text-red-600 line-through font-mono">
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Metadata */}
                            {selectedLog.json_log?.metadata && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Metadata del Sistema</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium">Servidor:</span>
                                                <span className="col-span-2 text-sm text-muted-foreground">
                                                    {selectedLog.json_log.metadata.server}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium">Base de Datos:</span>
                                                <span className="col-span-2 text-sm text-muted-foreground">
                                                    {selectedLog.json_log.metadata.database}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <span className="text-sm font-medium">Timestamp:</span>
                                                <span className="col-span-2 text-sm text-muted-foreground">
                                                    {new Date(selectedLog.json_log.timestamp).toLocaleString('es-MX')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
