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
  Shield
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
  { id: '/analytics', label: 'Analitik', icon: TrendingUp },
  { id: '/reports', label: 'Raporlar', icon: FileText },
  { id: '/admin', label: 'Yönetici Paneli', icon: Shield },
  { id: '/users', label: 'Kullanıcılar', icon: Users },
  { id: '/settings', label: 'Ayarlar', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname;
  const { user, profile, logout, hasPermission, hasRole } = useAuth();
  const { unreadCount } = useNotifications();

  const getUserInitials = () => {
    if (!profile) return 'U';
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
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
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col shadow-card">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">KPI Manager</h1>
            <p className="text-xs text-muted-foreground">by Gurgil Games</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {getVisibleMenuItems().map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium transition-smooth",
                activeTab === item.id && "bg-gradient-primary text-white shadow-elevated"
              )}
              onClick={() => navigate(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
              {item.showBadge && <NotificationBadge count={unreadCount} />}
            </Button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-primary text-white font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Kullanıcı'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'email@company.com'}
            </p>
            {profile && (
              <p className="text-xs font-medium text-primary">
                {hasRole('admin') ? 'Sistem Yöneticisi' : 
                 hasRole('department_manager') ? 'Departman Yöneticisi' : 
                 'Çalışan'}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            logout();
            // Auth hook'unda zaten reload var, burada extra bir şey yapmaya gerek yok
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}