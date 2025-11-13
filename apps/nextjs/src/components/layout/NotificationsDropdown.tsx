'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Calendar, Briefcase, FileText } from 'lucide-react';
import { Notification } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function NotificationsDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () =>
      apiService.getNotifications({
        'filter[status]': 'sent,pending',
        per_page: 10,
        sort: '-created_at',
      }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const notifications: Notification[] = notificationsData?.data || [];
  const unreadCount = notifications.filter((n) => n.status !== 'read').length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
      setOpen(false);
    } else if (notification.related_job_id) {
      router.push(`/admin/scheduling?job=${notification.related_job_id}`);
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_scheduled':
      case 'job_reminder':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'work_order_created':
      case 'work_order_updated':
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      case 'invoice_sent':
      case 'payment_received':
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (status: string) => {
    if (status === 'read') return 'bg-gray-50';
    return 'bg-blue-50 hover:bg-blue-100';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${getNotificationColor(
                  notification.status
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.notification_type)}</div>
                  <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                    {notification.subject && (
                      <div className="font-medium text-sm mb-1 truncate">{notification.subject}</div>
                    )}
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {notification.status !== 'read' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center cursor-pointer"
              onClick={() => {
                router.push('/admin/notifications');
                setOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
