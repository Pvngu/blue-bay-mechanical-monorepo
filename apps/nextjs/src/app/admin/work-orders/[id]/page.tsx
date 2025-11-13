'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, FileText, Images, Clock } from 'lucide-react';
import { WorkOrderPhotoUpload } from '@/components/admin/WorkOrderPhotoUpload';
import { formatDateMX } from '@/lib/utils/dateFormat';
import { WorkOrder } from '@/config/resources/workOrders.config';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params?.id as string;

  const { data: workOrder, isLoading, refetch } = useQuery<WorkOrder>({
    queryKey: ['work-order', workOrderId],
    queryFn: () => apiService.getOneWithIncludes('work-orders', workOrderId, ['client', 'technician', 'job', 'photos']),
  });

  const { data: photos, refetch: refetchPhotos } = useQuery({
    queryKey: ['work-order-photos', workOrderId],
    queryFn: () => apiService.getWorkOrderPhotos(workOrderId),
    enabled: !!workOrderId,
  });

  const handlePhotosChange = () => {
    refetchPhotos();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto py-10">
        <p>Work order not found</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-black';
      case 'in_progress':
        return 'bg-yellow-500 text-black';
      case 'completed':
        return 'bg-green-600 text-white';
      case 'cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-600 text-white';
      case 'normal':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{workOrder.work_order_number}</h1>
          <p className="text-muted-foreground">{workOrder.title}</p>
        </div>
        <Badge className={getStatusBadgeClass(workOrder.status)}>
          {workOrder.status}
        </Badge>
        {workOrder.priority && (
          <Badge className={getPriorityBadgeClass(workOrder.priority)}>
            {workOrder.priority}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Photos ({photos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">WO Number</label>
                  <p className="text-base">{workOrder.work_order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-base">{workOrder.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{workOrder.description || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                  <p className="text-base">{(workOrder as any).service_type || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client & Technician</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-base">{(workOrder as any)?.client?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Technician</label>
                  <p className="text-base">
                    {(workOrder as any)?.technician
                      ? `${(workOrder as any).technician.first_name || ''} ${(workOrder as any).technician.last_name || ''}`.trim()
                      : '-'}
                  </p>
                </div>
                {(workOrder as any)?.job && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Related Job</label>
                    <p className="text-base">{(workOrder as any).job.job_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scheduled Date</label>
                  <p className="text-base">
                    {workOrder.scheduled_date ? formatDateMX(workOrder.scheduled_date) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed Date</label>
                  <p className="text-base">
                    {workOrder.completed_date ? formatDateMX(workOrder.completed_date) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-base">
                    {workOrder.created_at ? formatDateMX(workOrder.created_at) : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Labor Hours</label>
                  <p className="text-base">{workOrder.labor_hours || 0} hrs</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Labor Cost</label>
                  <p className="text-base">
                    ${workOrder.labor_cost ? Number(workOrder.labor_cost).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parts Cost</label>
                  <p className="text-base">
                    ${workOrder.parts_cost ? Number(workOrder.parts_cost).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                  <p className="text-xl font-bold">
                    ${workOrder.total_cost ? Number(workOrder.total_cost).toFixed(2) : '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {workOrder.technician_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Technician Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{workOrder.technician_notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Photos</CardTitle>
              <CardDescription>
                Upload and manage photos for this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkOrderPhotoUpload
                workOrderId={workOrderId}
                photos={photos || []}
                onPhotosChange={handlePhotosChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Work Order History</CardTitle>
              <CardDescription>
                Timeline of changes and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">Work order created</p>
                    <p className="text-xs text-muted-foreground">
                      {workOrder.created_at ? formatDateMX(workOrder.created_at) : '-'}
                    </p>
                  </div>
                </div>
                {workOrder.completed_date && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-600" />
                    <div>
                      <p className="text-sm font-medium">Work order completed</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateMX(workOrder.completed_date)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
