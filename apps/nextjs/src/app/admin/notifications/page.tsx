'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Calendar, Briefcase, FileText, Filter } from 'lucide-react';
import { Notification } from '@/types/api';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'all', statusFilter, typeFilter],
    queryFn: () => {
      const params: Record<string, any> = {
        per_page: 50,
        sort: '-created_at',
      };
      
      if (statusFilter !== 'all') {
        params['filter[status]'] = statusFilter;
      }
      
      if (typeFilter !== 'all') {
        params['filter[notification_type]'] = typeFilter;
      }
      
      return apiService.getNotifications(params);
    },
  });

  const notifications: Notification[] = notificationsData?.data || [];

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationAsRead(id),
    onSuccess: () => {
      toast.success('Marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (notification.status !== 'read') {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related resource
    if (notification.related_work_order_id) {
      router.push(`/admin/work-orders/${notification.related_work_order_id}`);
    } else if (notification.related_job_id) {
      router.push(`/admin/scheduling?job=${notification.related_job_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_scheduled':
      case 'job_reminder':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'work_order_created':
      case 'work_order_updated':
        return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'invoice_sent':
      case 'payment_received':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'scheduled':
        return <Badge>Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View and manage all your notifications</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="job_scheduled">Job Scheduled</SelectItem>
            <SelectItem value="job_reminder">Job Reminder</SelectItem>
            <SelectItem value="work_order_created">Work Order Created</SelectItem>
            <SelectItem value="work_order_updated">Work Order Updated</SelectItem>
            <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
            <SelectItem value="payment_received">Payment Received</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading notifications...</div>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You'll see notifications here when you receive them"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                notification.status !== 'read' ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.notification_type)}</div>
                    <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">
                          {notification.subject || 'Notification'}
                        </CardTitle>
                        {getStatusBadge(notification.status)}
                      </div>
                      <CardDescription className="text-sm">{notification.message}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                        {notification.notification_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{notification.notification_type.replace(/_/g, ' ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.status !== 'read' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
