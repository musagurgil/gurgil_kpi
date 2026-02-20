import { Notification } from '@/types/notification';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Calendar,
  Ticket,
  Target,
  User,
  Settings,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES, NOTIFICATION_PRIORITY_COLORS } from '@/types/notification';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryIcons = {
  kpi: Target,
  ticket: Ticket,
  calendar: Calendar,
  system: Settings,
  user: User
};

const priorityGradients: Record<string, string> = {
  critical: 'from-red-500 to-rose-600',
  high: 'from-orange-500 to-amber-600',
  medium: 'from-yellow-500 to-amber-500',
  low: 'from-emerald-500 to-teal-600',
};

export const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[notification.category];

  const handleNavigate = () => {
    if (notification.link) {
      navigate(notification.link);
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
    }
  };

  const priorityColor = NOTIFICATION_PRIORITY_COLORS[notification.priority];
  const gradient = priorityGradients[notification.priority] || priorityGradients.low;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/50 ${!notification.isRead
          ? 'bg-card/80 backdrop-blur-sm'
          : 'bg-card/40 backdrop-blur-sm opacity-80'
        }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`} />

      <div className="p-4 pl-5 flex items-start gap-3">
        {/* Icon with gradient background */}
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className={`font-medium text-sm truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Okundu olarak işaretle"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/70 hover:text-destructive"
                onClick={() => onDelete(notification.id)}
                title="Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/50">
                {NOTIFICATION_CATEGORIES[notification.category]}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/50">
                {NOTIFICATION_PRIORITIES[notification.priority]}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: tr
                })}
              </span>
              {notification.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigate}
                  className="h-5 px-1.5 text-[10px] gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Git
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
