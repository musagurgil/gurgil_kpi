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
    <header className="bg-card border-b border-border px-4 sm:px-6 py-4 shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Personalized Welcome Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {greeting}, {userName.split(' ')[0]}! 👋
            </h1>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateInfo.dayName}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              {dateInfo.day} {dateInfo.month} {dateInfo.year}
            </p>
            {getMotivationalMessage() && (
              <p className="text-sm text-primary font-medium">
                {getMotivationalMessage()}
              </p>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="KPI, ticket, kullanıcı ara..." 
              className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="w-5 h-5" />
            {urgentNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs p-0">
                {urgentNotifications}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="shrink-0">
            <Settings className="w-5 h-5" />
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon" className="shrink-0">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}