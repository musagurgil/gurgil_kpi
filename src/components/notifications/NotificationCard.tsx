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

  return (
    <Card 
      className={`p-4 transition-all hover:shadow-md border-l-4 ${priorityColor} ${
        !notification.isRead ? 'bg-background' : 'bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          notification.priority === 'critical' ? 'bg-red-100 text-red-600' :
          notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
          'bg-green-100 text-green-600'
        }`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Okundu olarak işaretle"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(notification.id)}
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {NOTIFICATION_CATEGORIES[notification.category]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {NOTIFICATION_PRIORITIES[notification.priority]}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
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
