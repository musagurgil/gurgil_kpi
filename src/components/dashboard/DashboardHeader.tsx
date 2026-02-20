import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Settings, User, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardHeader() {
  const { user } = useAuth();
  const { stats } = useDashboard();

  // Count urgent notifications (critical tickets, overdue items, etc.)
  const urgentNotifications = stats?.recentActivities?.filter(activity =>
    activity.type === 'ticket_created'
  ).length || 0;

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Get current date and day name
  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    return {
      dayName: days[now.getDay()],
      day: now.getDate(),
      month: months[now.getMonth()],
      year: now.getFullYear()
    };
  };

  const dateInfo = getCurrentDate();
  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Kullanıcı';

  // Get motivational message based on today's summary
  const getMotivationalMessage = () => {
    if (!stats?.todaySummary) return null;

    const isAdmin = user?.roles?.includes('admin');
    const { completedToday, dueToday, dueThisWeek } = stats.todaySummary;

    if (completedToday > 0) {
      return isAdmin
        ? `Harika! Bugün ${completedToday} görev tamamlandı. 🎉`
        : `Harika! Bugün ${completedToday} görev tamamladınız. 🎉`;
    }
    if (dueToday > 0) {
      return isAdmin
        ? `Bugün ${dueToday} görev var. Başarılar! 💪`
        : `Bugün ${dueToday} göreviniz var. Başarılar! 💪`;
    }
    if (dueThisWeek > 0) {
      return isAdmin
        ? `Bu hafta ${dueThisWeek} görev var. Planlı ilerleyin! 📅`
        : `Bu hafta ${dueThisWeek} göreviniz var. Planlı ilerleyin! 📅`;
    }
    if (stats.userActiveKPIs > 0) {
      return isAdmin
        ? `${stats.userActiveKPIs} aktif KPI var. Devam edin! 🚀`
        : `${stats.userActiveKPIs} aktif KPI'nız var. Devam edin! 🚀`;
    }
    return isAdmin
      ? 'Bugün için yeni görev yok. İyi çalışmalar! ✨'
      : 'Bugün için yeni görev yok. İyi çalışmalar! ✨';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-brand">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
      <div className="absolute -left-40 -top-40 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
      <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

      {/* Header Content */}
      <header className="relative z-10 px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-sm transition-colors text-xs py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {dateInfo.day} {dateInfo.month} {dateInfo.year}, {dateInfo.dayName}
              </Badge>
              {getMotivationalMessage() && (
                <div className="flex items-center text-sm font-medium text-white/90 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {getMotivationalMessage()}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl border-none font-bold text-white tracking-tight mb-2">
                {greeting},
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 mt-1">
                  {userName.split(' ')[0]} 👋
                </span>
              </h1>
              <p className="text-base sm:text-lg text-white/70">
                Sistemdeki genel durumu, aktif Ticket'ları ve kritik KPI hedeflerini buradan takip edebilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:block relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="KPI, ticket, kullanıcı ara..."
                className="pl-10 w-full bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
              />
            </div>

            {/* Mobile Search Button */}
            <Button variant="outline" size="icon" className="md:hidden bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="outline" size="icon" className="relative shrink-0 bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {urgentNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white text-[10px] font-bold shadow-sm shadow-red-500/50">
                  {urgentNotifications}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button variant="outline" size="icon" className="shrink-0 bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm group">
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </Button>

            {/* Profile */}
            <Button variant="outline" size="icon" className="shrink-0 bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}