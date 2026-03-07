import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTickets } from '../hooks/useTickets';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiClient: {
    getTickets: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    deleteTicket: vi.fn(),
    addTicketComment: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      on: vi.fn(),
      off: vi.fn()
    }
  })
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      roles: ['admin']
    }
  })
}));

describe('useTickets Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // prevent console.error from cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Initialization and loadTickets', () => {
    it('should initialize with loading state and fetch tickets', async () => {
      const mockTickets = [{ id: '1', title: 'Test Ticket 1' }];
      vi.mocked(apiClient.getTickets).mockResolvedValue(mockTickets as never);

      const { result } = renderHook(() => useTickets());

      expect(result.current.loading).toBe(true);

      // Wait for the async useEffect to finish using waitFor
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getTickets).toHaveBeenCalled();
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.error).toBeNull();
    });

    it('should set error state if fetch fails', async () => {
      const errorMsg = 'Failed to load';
      vi.mocked(apiClient.getTickets).mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMsg);
      expect(toast.error).toHaveBeenCalledWith('Ticket\'lar yüklenirken hata oluştu');
    });
  });

  describe('API Methods', () => {
    it('should create a ticket successfully', async () => {
      vi.mocked(apiClient.getTickets).mockResolvedValue([]);
      const newTicket = { id: '2', title: 'New Ticket', targetDepartment: 'IT' };
      vi.mocked(apiClient.createTicket).mockResolvedValue(newTicket as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let createdTicket;
      await act(async () => {
        createdTicket = await result.current.createTicket({ title: 'New Ticket', description: 'Desc', priority: 'high', targetDepartment: 'IT' });
      });

      expect(createdTicket).toEqual(newTicket);
      expect(result.current.tickets).toEqual([newTicket]);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Ticket başarıyla oluşturuldu'));
    });

    it('should update a ticket successfully', async () => {
      const initialTicket = { id: '1', title: 'Old Title' };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);

      const updatedTicket = { id: '1', title: 'New Title', updatedAt: new Date().toISOString() };
      vi.mocked(apiClient.updateTicket).mockResolvedValue(updatedTicket as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let res;
      await act(async () => {
        res = await result.current.updateTicket('1', { title: 'New Title' });
      });

      expect(res).toEqual(updatedTicket);
      expect(result.current.tickets).toEqual([updatedTicket]);
    });

    it('should handle error when updating ticket', async () => {
      const initialTicket = { id: '1', title: 'Old Title' };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);
      vi.mocked(apiClient.updateTicket).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(result.current.updateTicket('1', { title: 'New Title' })).rejects.toThrow('Update failed');

      expect(result.current.tickets).toEqual([initialTicket]); // Rollback
      expect(toast.error).toHaveBeenCalledWith('❌ Update failed');
    });

    it('should delete a ticket successfully', async () => {
      const initialTicket = { id: '1', title: 'To Delete' };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);
      vi.mocked(apiClient.deleteTicket).mockResolvedValue({} as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteTicket('1');
      });

      expect(result.current.tickets).toEqual([]);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Ticket başarıyla silindi'));
    });

    it('should assign a ticket successfully', async () => {
      const initialTicket = { id: '1', title: 'Ticket', status: 'open' };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);
      vi.mocked(apiClient.updateTicket).mockResolvedValue({ ...initialTicket, assignedTo: 'user-2', status: 'in_progress' } as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let res;
      await act(async () => {
        res = await result.current.assignTicket('1', 'user-2');
      });

      expect(res).toBe(true);
      expect(result.current.tickets[0].assignedTo).toBe('user-2');
      expect(result.current.tickets[0].status).toBe('in_progress');
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Ticket başarıyla atandı'));
    });

    it('should handle error when assigning ticket', async () => {
      const initialTicket = { id: '1', title: 'Ticket', status: 'open' };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);
      vi.mocked(apiClient.updateTicket).mockRejectedValue(new Error('Assign failed'));

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let res;
      await act(async () => {
        res = await result.current.assignTicket('1', 'user-2');
      });

      expect(res).toBe(false);
      expect(result.current.tickets[0].assignedTo).toBeUndefined(); // Rollback
      expect(toast.error).toHaveBeenCalledWith('❌ Assign failed');
    });

    it('should add a comment successfully', async () => {
      const initialTicket = { id: '1', title: 'Ticket', comments: [] };
      vi.mocked(apiClient.getTickets).mockResolvedValue([initialTicket] as never);
      const newComment = { id: 'c-1', content: 'New Comment', isInternal: false };
      vi.mocked(apiClient.addTicketComment).mockResolvedValue(newComment as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      let res;
      await act(async () => {
        res = await result.current.addComment('1', 'New Comment');
      });

      expect(res).toBe(true);
      expect(result.current.tickets[0].comments).toEqual([newComment]);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Yorum başarıyla eklendi'));
    });
  });

  describe('Helper Methods', () => {
    it('should calculate ticket stats correctly', async () => {
      const mockTickets = [
        { id: '1', title: 'T1', status: 'open', priority: 'high' },
        { id: '2', title: 'T2', status: 'in_progress', priority: 'low' },
        { id: '3', title: 'T3', status: 'resolved', priority: 'high' },
        { id: '4', title: 'T4', status: 'closed', priority: 'medium' }
      ];
      vi.mocked(apiClient.getTickets).mockResolvedValue(mockTickets as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      const stats = result.current.getTicketStats();
      expect(stats).toEqual({
        total: 4,
        open: 1,
        inProgress: 1,
        resolved: 1,
        closed: 1,
        highPriority: 2,
        completionRate: 50 // (1 resolved + 1 closed) / 4 total * 100
      });
    });

    it('should filter tickets correctly', async () => {
      const mockTickets = [
        { id: '1', title: 'Login Issue', status: 'open', priority: 'high', targetDepartment: 'IT' },
        { id: '2', title: 'Billing Bug', status: 'closed', priority: 'low', targetDepartment: 'Finance' },
        { id: '3', title: 'Login Request', status: 'in_progress', priority: 'medium', targetDepartment: 'IT' }
      ];
      vi.mocked(apiClient.getTickets).mockResolvedValue(mockTickets as never);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Initial filter state (no filters)
      expect(result.current.filterTickets()).toHaveLength(3);

      // Filter by status
      await act(async () => {
        result.current.setFilters({ ...result.current.filters, status: 'open' });
      });
      expect(result.current.filterTickets()).toHaveLength(1);
      expect(result.current.filterTickets()[0].id).toBe('1');

      // Clear status, filter by department
      await act(async () => {
        result.current.setFilters({ status: undefined, department: 'Finance', priority: undefined, search: undefined });
      });
      expect(result.current.filterTickets()).toHaveLength(1);
      expect(result.current.filterTickets()[0].id).toBe('2');

      // Filter by search text
      await act(async () => {
        result.current.setFilters({ status: undefined, department: undefined, priority: undefined, search: 'login' });
      });
      expect(result.current.filterTickets()).toHaveLength(2);
      expect(result.current.filterTickets().map(t => t.id)).toEqual(['1', '3']);
    });
  });
});
