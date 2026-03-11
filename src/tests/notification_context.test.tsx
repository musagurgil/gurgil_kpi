import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotificationContext } from '../contexts/NotificationContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';

// Mock dependencies
vi.mock('@/lib/api', () => ({
    apiClient: {
        getNotifications: vi.fn(),
        markNotificationAsRead: vi.fn(),
        markAllNotificationsAsRead: vi.fn(),
        deleteNotification: vi.fn(),
        deleteAllNotifications: vi.fn(),
        deleteReadNotifications: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: Object.assign(vi.fn(), {
        success: vi.fn(),
        error: vi.fn(),
    })
}));

vi.mock('../contexts/SocketContext', () => ({
    useSocket: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(() => ({
        isAuthenticated: true
    }))
}));

const mockNotifications = [
    {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Test Notif 1',
        message: 'Message 1',
        category: 'system',
        priority: 'high',
        isRead: false,
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'notif-2',
        userId: 'user-1',
        title: 'Test Notif 2',
        message: 'Message 2',
        category: 'user',
        priority: 'low',
        isRead: true,
        createdAt: '2024-01-02T00:00:00Z',
    }
];

describe('NotificationContext', () => {
    let mockSocket: { on: ReturnType<typeof vi.fn>; off: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        vi.clearAllMocks();

        mockSocket = {
            on: vi.fn(),
            off: vi.fn(),
        };

        vi.mocked(useSocket).mockReturnValue({ socket: mockSocket } as unknown as ReturnType<typeof useSocket>);
        vi.mocked(apiClient.getNotifications).mockResolvedValue(mockNotifications as unknown as ReturnType<typeof apiClient.getNotifications>);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NotificationProvider>{children}</NotificationProvider>
    );

    it('should throw error if used outside provider', () => {
        // Prevent React error boundary from logging the expected error
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useNotificationContext())).toThrow('useNotificationContext must be used within a NotificationProvider');
        consoleErrorSpy.mockRestore();
    });

    it('should initialize and load notifications successfully', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notifications).toEqual(mockNotifications);
        expect(result.current.allNotifications).toEqual(mockNotifications);
        expect(result.current.unreadCount).toBe(1); // notif-1 is unread
    });

    it('should handle fetch error and fall back to mock data', async () => {
        // Suppress console.error for this specific test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(apiClient.getNotifications).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notifications.length).toBe(1);
        expect(result.current.notifications[0].title).toBe('Hoş Geldiniz!');
        expect(result.current.unreadCount).toBe(1);

        consoleSpy.mockRestore();
    });

    it('should mark a notification as read and update unread count', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.markAsRead('notif-1');
        });

        expect(apiClient.markNotificationAsRead).toHaveBeenCalledWith('notif-1');
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.allNotifications[0].isRead).toBe(true);
        expect(toast.success).toHaveBeenCalledWith('Bildirim okundu olarak işaretlendi');
    });

    it('should mark all notifications as read', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.markAllAsRead();
        });

        expect(apiClient.markAllNotificationsAsRead).toHaveBeenCalled();
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.allNotifications.every(n => n.isRead)).toBe(true);
        expect(toast.success).toHaveBeenCalledWith('Tüm bildirimler okundu olarak işaretlendi');
    });

    it('should delete a single notification', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.deleteNotification('notif-1');
        });

        expect(apiClient.deleteNotification).toHaveBeenCalledWith('notif-1');
        expect(result.current.allNotifications.length).toBe(1);
        expect(result.current.unreadCount).toBe(0);
        expect(toast.success).toHaveBeenCalledWith('Bildirim silindi');
    });

    it('should delete all read notifications', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.deleteAllRead();
        });

        expect(apiClient.deleteReadNotifications).toHaveBeenCalled();
        expect(result.current.allNotifications.length).toBe(1);
        expect(result.current.allNotifications[0].id).toBe('notif-1');
        expect(toast.success).toHaveBeenCalledWith('Okunmuş bildirimler silindi');
    });

    it('should clear all notifications', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.clearAllNotifications();
        });

        expect(apiClient.deleteAllNotifications).toHaveBeenCalled();
        expect(result.current.allNotifications.length).toBe(0);
        expect(result.current.unreadCount).toBe(0);
        expect(toast.success).toHaveBeenCalledWith('Tüm bildirimler temizlendi');
    });

    it('should filter notifications by category', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.setFilter(prev => ({ ...prev, category: 'system' }));
        });

        expect(result.current.notifications.length).toBe(1);
        expect(result.current.notifications[0].category).toBe('system');

        act(() => {
            result.current.setFilter(prev => ({ ...prev, category: 'all' }));
        });

        expect(result.current.notifications.length).toBe(2);
    });

    it('should handle new_notification socket event', async () => {
        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockSocket.on).toHaveBeenCalledWith('new_notification', expect.any(Function));

        const handleNewNotification = mockSocket.on.mock.calls.find(
            (call: unknown[]) => call[0] === 'new_notification'
        )[1] as (n: unknown) => void;

        const newNotif = {
            id: 'notif-3',
            userId: 'user-1',
            title: 'New Event',
            message: 'Real-time update',
            category: 'system',
            priority: 'high',
            isRead: false,
            createdAt: '2024-01-03T00:00:00Z',
        };

        act(() => {
            handleNewNotification(newNotif);
        });

        expect(result.current.allNotifications.length).toBe(3);
        expect(result.current.allNotifications[0]).toEqual(newNotif);
        expect(result.current.unreadCount).toBe(2);
        expect(toast).toHaveBeenCalledWith('New Event', expect.objectContaining({
            description: 'Real-time update'
        }));
    });

    it('should handle error when marking a notification as read fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(apiClient.markNotificationAsRead).mockRejectedValue(new Error('Test error'));

        const { result } = renderHook(() => useNotificationContext(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Current state before action
        const initialUnreadCount = result.current.unreadCount;
        const isReadInitial = result.current.allNotifications[0].isRead;

        await act(async () => {
            await result.current.markAsRead('notif-1');
        });

        expect(apiClient.markNotificationAsRead).toHaveBeenCalledWith('notif-1');
        expect(consoleSpy).toHaveBeenCalledWith('Error marking notification as read:', expect.any(Error));
        expect(toast.error).toHaveBeenCalledWith('Hata oluştu');

        // Verify state is NOT updated
        expect(result.current.unreadCount).toBe(initialUnreadCount);
        expect(result.current.allNotifications[0].isRead).toBe(isReadInitial);

        consoleSpy.mockRestore();
    });
});
