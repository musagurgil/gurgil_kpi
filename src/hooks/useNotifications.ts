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
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
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
    if (!id) {
      console.error('[useNotifications] Invalid notification ID:', id);
      toast.error('Geçersiz bildirim ID\'si');
      return;
    }

    try {
      console.log('[useNotifications] Marking notification as read:', id);
      
      // Optimistically update UI
      const notification = allNotifications.find(n => n.id === id);
      if (notification?.isRead) {
        console.log('[useNotifications] Notification already read, skipping');
        return;
      }

      const updated = await apiClient.markNotificationAsRead(id);
      console.log('[useNotifications] Mark as read response:', updated);
      
      setAllNotifications(prev => {
        const updatedList = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        // Recalculate unread count
        const unread = updatedList.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        return updatedList;
      });
      
      // Also update filtered notifications
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      
      toast.success('Bildirim okundu olarak işaretlendi');
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.status
      });
      
      // Show more specific error message
      let errorMessage = 'Bildirim okundu olarak işaretlenirken hata oluştu';
      if (err.status === 404) {
        errorMessage = 'Bildirim bulunamadı';
      } else if (err.status === 403) {
        errorMessage = 'Bu bildirime erişim yetkiniz yok';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
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
      await apiClient.deleteNotification(id);
      setAllNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        // Recalculate unread count
        const unread = updated.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        return updated;
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Bildirim silindi');
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      toast.error('Bildirim silinirken hata oluştu');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiClient.deleteAllNotifications();
      setAllNotifications([]);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Tüm bildirimler temizlendi');
    } catch (err: any) {
      console.error('Error clearing all notifications:', err);
      toast.error('Bildirimler temizlenirken hata oluştu');
    }
  };

  const deleteAllRead = async () => {
    try {
      // Delete all read notifications
      const readNotifications = allNotifications.filter(n => n.isRead);
      for (const notification of readNotifications) {
        await apiClient.deleteNotification(notification.id);
      }
      
      setAllNotifications(prev => prev.filter(n => !n.isRead));
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success('Okunmuş bildirimler silindi');
    } catch (err: any) {
      console.error('Error deleting read notifications:', err);
      toast.error('Okunmuş bildirimler silinirken hata oluştu');
    }
  };

  const createNotification = async (data: {
    category: string;
    priority: string;
    title: string;
    message: string;
    link?: string;
  }) => {
    try {
      // This would typically be done on the backend
      // For now, we'll just add it to local state
      const newNotification = {
        id: `temp-${Date.now()}`,
        userId: '', // Will be set by backend
        ...data,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      setAllNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (err: any) {
      console.error('Error creating notification:', err);
      toast.error('Bildirim oluşturulurken hata oluştu');
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
    deleteAllRead,
    clearAllNotifications,
    createNotification
  };
};