import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart3,
  Ticket,
  Users,
  Settings,
  Home,
  Target,
  TrendingUp,
  FileText,
  Bell,
  LogOut,
  Calendar,
  Shield,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { id: '/', label: 'Ana Panel', icon: Home },
  { id: '/calendar', label: 'Çalışma Takvimi', icon: Calendar },
  { id: '/notifications', label: 'Bildirimler', icon: Bell, showBadge: true },
  { id: '/kpi', label: 'KPI Takip', icon: Target },
  { id: '/tickets', label: 'Ticket Yönetimi', icon: Ticket },
  { id: '/meeting-rooms', label: 'Toplantı Odaları', icon: Building2 },
  { id: '/analytics', label: 'Analitik', icon: TrendingUp },
  { id: '/reports', label: 'Raporlar', icon: FileText },
  { id: '/admin', label: 'Yönetici Paneli', icon: Shield },
  { id: '/users', label: 'Kullanıcılar', icon: Users },
  { id: '/settings', label: 'Ayarlar', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;
  const { user, logout, hasPermission, hasRole } = useAuth();
  const { unreadCount } = useNotifications();

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getVisibleMenuItems = () => {
    return menuItems.filter(item => {
      // Admin can see everything
      if (hasPermission('admin')) return true;

      // Hide admin panel for non-admins
      if (item.id === '/admin') return false;

      // Hide user management for non-admins
      if (item.id === '/users') return false;

      // Hide analytics and reports for employees (only department_manager and admin can see)
      if ((item.id === '/analytics' || item.id === '/reports') && !hasPermission('department_manager')) return false;

      // Show everything else
      return true;
    });
  };

  return (
    <div className="w-[280px] bg-card/80 backdrop-blur-md border-r border-border/50 h-screen flex flex-col shadow-2xl relative z-10 transition-all duration-300">
      {/* Logo Area */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-b from-background/50 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">KPI Manager</h1>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">by Gurgil Games</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {getVisibleMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-medium transition-all duration-200 h-11 px-4 rounded-xl relative overflow-hidden group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              onClick={() => {
                navigate(item.id);
                onClose?.();
              }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="truncate">{item.label}</span>
              {item.showBadge && unreadCount > 0 && (
                <div className="ml-auto">
                  <NotificationBadge count={unreadCount} />
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm m-4 rounded-2xl border shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
            <AvatarFallback className="bg-gradient-primary text-white font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user && (user.firstName || user.lastName) ? `${user.firstName} ${user.lastName}`.trim() : 'Kullanıcı'}
            </p>
            <p className="text-xs font-medium text-primary truncate mt-0.5">
              {hasRole('admin') ? 'Sistem Yöneticisi' :
                hasRole('department_manager') ? 'Departman Yöneticisi' :
                  'Çalışan'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-9"
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}