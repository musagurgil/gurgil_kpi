import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState({
    category: 'all',
    priority: 'all',
    isRead: 'all'
  });

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getNotifications();
        setAllNotifications(data);
        setNotifications(data);
        
        // Count unread notifications
        const unread = data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err: any) {
        console.error('Error loading notifications:', err);
        toast.error('Bildirimler yüklenirken hata oluştu');
        // Set mock data on error
        const mockNotifications = [
          {
            id: '1',
            title: 'Hoş Geldiniz!',
            message: 'KPI Yönetim Sistemine hoş geldiniz. Başarılar dileriz!',
            category: 'system',
            priority: 'low',
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/'
          }
        ];
        setAllNotifications(mockNotifications);
        setNotifications(mockNotifications);
        setUnreadCount(1);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = allNotifications;

    if (filter.category !== 'all') {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter.isRead !== 'all') {
      const isRead = filter.isRead === 'read';
      filtered = filtered.filter(n => n.isRead === isRead);
    }

    setNotifications(filtered);
  }, [allNotifications, filter]);

  const markAsRead = async (id: string) => {
    try {
      // This would need to be implemented in the API
      console.log('Mark as read:', id);
      setAllNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Bildirim okundu olarak işaretlenirken hata oluştu');
    }
  };

  const markAllAsRead = async () => {
    try {
      // This would need to be implemented in the API
      console.log('Mark all as read');
      setAllNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Bildirimler okundu olarak işaretlenirken hata oluştu');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // This would need to be implemented in the API
      console.log('Delete notification:', id);
      setAllNotifications(prev => prev.filter(n => n.id !== id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Bildirim silindi');
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      toast.error('Bildirim silinirken hata oluştu');
    }
  };

  const clearAllNotifications = async () => {
    try {
      // This would need to be implemented in the API
      console.log('Clear all notifications');
      setAllNotifications([]);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Tüm bildirimler temizlendi');
    } catch (err: any) {
      console.error('Error clearing all notifications:', err);
      toast.error('Bildirimler temizlenirken hata oluştu');
    }
  };

  return {
    notifications,
    allNotifications,
    loading,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
};