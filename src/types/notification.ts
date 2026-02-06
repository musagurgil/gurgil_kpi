export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationCategory = 'kpi' | 'ticket' | 'calendar' | 'system' | 'user';

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: {
    kpiId?: string;
    ticketId?: string;
    department?: string;
  };
}

export interface NotificationFilter {
  category?: NotificationCategory | 'all';
  priority?: NotificationPriority | 'all';
  isRead?: boolean | 'all';
}

export const NOTIFICATION_PRIORITIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik'
} as const;

export const NOTIFICATION_CATEGORIES = {
  kpi: 'KPI',
  ticket: 'Ticket',
  calendar: 'Takvim',
  system: 'Sistem',
  user: 'Kullanıcı'
} as const;

export const NOTIFICATION_PRIORITY_COLORS = {
  low: 'border-green-500 bg-green-50',
  medium: 'border-yellow-500 bg-yellow-50',
  high: 'border-orange-500 bg-orange-50',
  critical: 'border-red-500 bg-red-50'
} as const;
