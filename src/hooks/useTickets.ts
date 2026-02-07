import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';
import { Ticket, CreateTicketData, TicketComment, TicketFilter } from '@/types/ticket';

export const useTickets = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilter>({
    status: undefined,
    priority: undefined,
    department: undefined,
    search: undefined
  });

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getTickets();
        setTickets(data);
      } catch (err) {
        console.error('Error loading tickets:', err);
        setError(err.message || 'Ticket\'lar yüklenirken hata oluştu');
        toast.error('Ticket\'lar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('ticket_created', (newTicket: Ticket) => {
      setTickets(prev => {
        if (prev.some(t => t.id === newTicket.id)) return prev;
        return [newTicket, ...prev];
      });
      toast.info(`📨 Yeni Ticket: ${newTicket.title}`);
    });

    socket.on('ticket_updated', (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    socket.on('ticket_deleted', (ticketId: string) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    });

    socket.on('ticket_new_comment', ({ ticketId, comment }: { ticketId: string, comment: TicketComment }) => {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const exists = t.comments?.some((c) => c.id === comment.id);
          if (exists) return t;
          return { ...t, comments: [...(t.comments || []), comment] };
        }
        return t;
      }));
    });

    return () => {
      socket.off('ticket_created');
      socket.off('ticket_updated');
      socket.off('ticket_deleted');
      socket.off('ticket_new_comment');
    };
  }, [socket]);

  const createTicket = async (ticketData: CreateTicketData) => {
    try {
      const newTicket = await apiClient.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      toast.success(`✅ Ticket başarıyla oluşturuldu! (${ticketData.targetDepartment} departmanına gönderildi)`);
      return newTicket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket oluşturulurken hata oluştu'));
      throw err;
    }
  };

  const updateTicket = async (id: string, ticketData: Partial<Ticket>) => {
    const previousTickets = [...tickets];
    setTickets(prev => prev.map(ticket =>
      ticket.id === id ? { ...ticket, ...ticketData, updatedAt: new Date().toISOString() } : ticket
    ));

    try {
      const updatedTicket = await apiClient.updateTicket(id, ticketData);
      // Ensure we use the server response to keep data consistent
      setTickets(prev => prev.map(ticket =>
        ticket.id === id ? updatedTicket : ticket
      ));
      return updatedTicket;
    } catch (err) {
      setTickets(previousTickets);
      console.error('Error updating ticket:', err);
      const errorMessage = '❌ ' + (err.message || 'Ticket güncellenirken hata oluştu');
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      await apiClient.deleteTicket(id);
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      toast.success('✅ Ticket başarıyla silindi!');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket silinirken hata oluştu'));
      throw err;
    }
  };

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    const previousTickets = [...tickets];
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId ? {
        ...ticket,
        assignedTo,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      } : ticket
    ));

    try {
      await apiClient.updateTicket(ticketId, {
        assignedTo,
        status: 'in_progress'
      });
      toast.success('✅ Ticket başarıyla atandı!');
      return true;
    } catch (err) {
      setTickets(previousTickets);
      console.error('Error assigning ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket atanırken hata oluştu'));
      return false;
    }
  };

  const addComment = async (ticketId: string, content: string, isInternal?: boolean) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: TicketComment = {
      id: tempId,
      content,
      isInternal: isInternal || false,
      ticketId,
      authorId: user?.id || '',
      authorName: `${user?.firstName} ${user?.lastName}`,
      createdAt: new Date().toISOString()
    };

    const previousTickets = [...tickets];

    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, comments: [...(ticket.comments || []), optimisticComment] }
        : ticket
    ));

    try {
      const newComment = await apiClient.addTicketComment(ticketId, content, isInternal);

      setTickets(prev => prev.map(ticket =>
        ticket.id === ticketId
          ? {
            ...ticket,
            comments: ticket.comments.map((c) => c.id === tempId ? newComment : c)
          }
          : ticket
      ));

      toast.success('✅ Yorum başarıyla eklendi!');
      return true;
    } catch (err) {
      setTickets(previousTickets);
      console.error('Error adding comment:', err);
      const errorMessage = '❌ ' + (err.message || 'Yorum eklenirken hata oluştu');
      toast.error(errorMessage);
      return false;
    }
  };

  // Helper to filter tickets based on current filters
  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.department && ticket.targetDepartment !== filters.department) return false;
      if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const highPriority = tickets.filter(t => t.priority === 'high').length;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      completionRate: total > 0 ? ((resolved + closed) / total) * 100 : 0
    };
  };

  return {
    tickets,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    addComment,
    filterTickets: getFilteredTickets, // Renamed to match usage but cleaner impl
    getTicketStats
  };
};