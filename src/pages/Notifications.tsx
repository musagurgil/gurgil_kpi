import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCheck, Trash2, Bell, Inbox, BellRing, BellOff, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useKPI } from '@/hooks/useKPI';

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

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const generatedKey = 'last_notification_check';
    localStorage.setItem(generatedKey, now.toISOString().split('T')[0]);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasNotifications = notifications.length > 0;
  const readCount = notifications.length - unreadCount;

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-brand px-6 py-10 mb-8 sm:rounded-b-3xl sm:mx-4 lg:mx-6 sm:mt-0 shadow-lg">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Bildirimler
                </h1>
                <p className="text-white/70 text-sm">
                  Tüm bildirimlerinizi buradan takip edebilirsiniz
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Tümünü Okundu İşaretle
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
                onClick={deleteAllRead}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Okunmuşları Sil
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Toplam', value: notifications.length, icon: Mail, iconBg: 'bg-blue-100 text-blue-600' },
            { label: 'Okunmamış', value: unreadCount, icon: BellRing, iconBg: 'bg-amber-100 text-amber-600' },
            { label: 'Okunmuş', value: readCount, icon: BellOff, iconBg: 'bg-emerald-100 text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold">Bildirim Bulunmuyor</h3>
                <p className="text-muted-foreground max-w-md text-sm">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
