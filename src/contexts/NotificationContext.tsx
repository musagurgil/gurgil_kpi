import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from './SocketContext';
import { Notification, NotificationFilter } from '@/types/notification';

interface NotificationContextType {
    notifications: Notification[];
    allNotifications: Notification[];
    loading: boolean;
    unreadCount: number;
    filter: NotificationFilter;
    setFilter: React.Dispatch<React.SetStateAction<NotificationFilter>>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllRead: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
    createNotification: (data: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<NotificationFilter>({
        category: 'all',
        priority: 'all',
        isRead: 'all'
    });

    const { socket } = useSocket();

    // Load notifications
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setLoading(true);
                const data = await apiClient.getNotifications();
                setAllNotifications(data);
                setNotifications(data);

                // Count unread notifications
                const unread = data.filter((n: Notification) => !n.isRead).length;
                setUnreadCount(unread);
            } catch (err: any) {
                console.error('Error loading notifications:', err);
                // Set mock data on error if needed, or just leave empty
                const mockNotifications: Notification[] = [
                    {
                        id: '1',
                        userId: 'mock-user',
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

    // Real-time updates with Socket.io
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            // Add new notification to the list
            setAllNotifications(prev => [notification, ...prev]);

            // Update unread count
            setUnreadCount(prev => prev + 1);

            // Show toast
            toast(notification.title, {
                description: notification.message,
                action: notification.link ? {
                    label: 'Görüntüle',
                    onClick: () => window.location.href = notification.link!
                } : undefined,
            });
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket]);

    // Filter notifications
    useEffect(() => {
        let filtered = allNotifications;

        if (filter.category && filter.category !== 'all') {
            filtered = filtered.filter(n => n.category === filter.category);
        }

        if (filter.priority && filter.priority !== 'all') {
            filtered = filtered.filter(n => n.priority === filter.priority);
        }

        if (filter.isRead !== 'all' && filter.isRead !== undefined) {
            filtered = filtered.filter(n => n.isRead === filter.isRead);
        }

        setNotifications(filtered);
    }, [allNotifications, filter]);

    const markAsRead = async (id: string) => {
        if (!id) return;

        try {
            // Optimistically update UI
            const notification = allNotifications.find(n => n.id === id);
            if (notification?.isRead) return;

            await apiClient.markNotificationAsRead(id);

            setAllNotifications(prev => {
                const updatedList = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
                const unread = updatedList.filter(n => !n.isRead).length;
                setUnreadCount(unread);
                return updatedList;
            });

            toast.success('Bildirim okundu olarak işaretlendi');
        } catch (err: any) {
            console.error('Error marking notification as read:', err);
            toast.error('Hata oluştu');
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
            toast.error('Hata oluştu');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await apiClient.deleteNotification(id);
            setAllNotifications(prev => {
                const updated = prev.filter(n => n.id !== id);
                const unread = updated.filter(n => !n.isRead).length;
                setUnreadCount(unread);
                return updated;
            });
            toast.success('Bildirim silindi');
        } catch (err: any) {
            console.error('Error deleting notification:', err);
            toast.error('Hata oluştu');
        }
    };

    const clearAllNotifications = async () => {
        try {
            await apiClient.deleteAllNotifications();
            setAllNotifications([]);
            setUnreadCount(0);
            toast.success('Tüm bildirimler temizlendi');
        } catch (err: any) {
            console.error('Error clearing all notifications:', err);
            toast.error('Hata oluştu');
        }
    };

    const deleteAllRead = async () => {
        try {
            await apiClient.deleteReadNotifications();
            setAllNotifications(prev => prev.filter(n => !n.isRead));
            toast.success('Okunmuş bildirimler silindi');
        } catch (err: any) {
            console.error('Error deleting read notifications:', err);
            toast.error('Hata oluştu');
        }
    };

    const createNotification = async (data: any) => {
        // For local testing/optimistic update mainly
        const newNotification = {
            id: `temp-${Date.now()}`,
            userId: '',
            ...data,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        setAllNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    return (
        <NotificationContext.Provider value={{
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
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
