import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCheck, Trash2, Bell, Inbox } from 'lucide-react';
import { useEffect } from 'react';
import { useKPI } from '@/hooks/useKPI';
import { differenceInDays, parseISO } from 'date-fns';

export default function Notifications() {
  const { user } = useAuth();
  const {
    notifications,
    allNotifications,
    loading,
    unreadCount,
    filter,
    setFilter,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useNotifications();

  // Auto-generate KPI notifications (only on mount, not on every render)
  useEffect(() => {
    if (!user) return;

    // KPI notifications are temporarily disabled during migration
    const now = new Date();
    const generatedKey = 'last_notification_check';
    localStorage.setItem(generatedKey, now.toISOString().split('T')[0]);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasNotifications = notifications.length > 0;

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
              <span className="truncate">Bildirimler</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Tüm bildirimlerinizi buradan takip edebilirsiniz
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Tümünü Okundu İşaretle
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
                onClick={deleteAllRead}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Okunmuşları Sil
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {hasNotifications && (
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Toplam:</span>
                <span className="font-semibold">{notifications.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Okunmamış:</span>
                <span className="font-semibold text-primary">{unreadCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Okunmuş:</span>
                <span className="font-semibold">{notifications.length - unreadCount}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <NotificationFilters filter={filter} onFilterChange={setFilter} />

        {/* Notifications List */}
        {hasNotifications ? (
          <div className="space-y-3">
            {notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 bg-muted rounded-full">
                <Inbox className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Bildirim Bulunmuyor</h3>
              <p className="text-muted-foreground max-w-md">
                {filter.category !== 'all' || filter.priority !== 'all' || filter.isRead !== 'all'
                  ? 'Seçtiğiniz filtrelere uygun bildirim bulunamadı. Filtreleri değiştirerek tekrar deneyin.'
                  : 'Henüz hiç bildiriminiz yok. Yeni bildirimler geldiğinde burada görünecektir.'}
              </p>
              {(filter.category !== 'all' || filter.priority !== 'all' || filter.isRead !== 'all') && (
                <Button
                  onClick={() => setFilter({ category: 'all', priority: 'all', isRead: 'all' })}
                  variant="outline"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
