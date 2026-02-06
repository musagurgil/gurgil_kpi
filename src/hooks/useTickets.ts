import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';

export const useTickets = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: ''
  });

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getTickets();
        setTickets(data);
      } catch (err: any) {
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

    socket.on('ticket_created', (newTicket: any) => {
      setTickets(prev => {
        if (prev.some(t => t.id === newTicket.id)) return prev;
        return [newTicket, ...prev];
      });
      // Only show toast if not created by me? Or just show it? 
      // If I created it, createTicket function shows success toast.
      // Setup logic to skip toast if current user created it? 
      // But user ID check might be complex here.
      // For now, duplicate toast is better than duplicate ticket.
      toast.info(`📨 Yeni Ticket: ${newTicket.title}`);
    });

    socket.on('ticket_updated', (updatedTicket: any) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    socket.on('ticket_deleted', (ticketId: string) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    });

    socket.on('ticket_new_comment', ({ ticketId, comment }: { ticketId: string, comment: any }) => {
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          // Avoid duplicates if we already added it optimistically (check by ID if possible, but temp IDs differ)
          // Ideally, we should check content/author/time or just append. 
          // For now, append. React key warnings might occur if IDs clash, but real ID from socket is unique.
          const exists = t.comments?.some((c: any) => c.id === comment.id);
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

  const createTicket = async (ticketData: {
    title: string;
    description: string;
    priority: string;
    targetDepartment: string;
  }) => {
    try {
      const newTicket = await apiClient.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      toast.success(`✅ Ticket başarıyla oluşturuldu! (${ticketData.targetDepartment} departmanına gönderildi)`);
      return newTicket;
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket oluşturulurken hata oluştu'));
      throw err;
    }
  };

  const updateTicket = async (id: string, ticketData: any) => {

    console.log('Update ticket:', id, ticketData);

    // Optimistic Update
    const previousTickets = [...tickets];
    setTickets(prev => prev.map(ticket =>
      ticket.id === id ? { ...ticket, ...ticketData, updatedAt: new Date().toISOString() } : ticket
    ));

    try {
      const updatedTicket = await apiClient.updateTicket(id, ticketData);
      // Server response confirmation (optional if socket handles it, but good for consistency)
      // Socket event will also update it.
    } catch (err: any) {
      // Rollback
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
    } catch (err: any) {
      console.error('Error deleting ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket silinirken hata oluştu'));
      throw err;
    }
  };

  const filterTickets = (tickets: any[], filter: any) => {
    return tickets.filter(ticket => {
      if (filter.status && ticket.status !== filter.status) return false;
      if (filter.priority && ticket.priority !== filter.priority) return false;
      if (filter.department && ticket.targetDepartment !== filter.department) return false;
      if (filter.search && !ticket.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  };

  const getTicketStats = (tickets: any[]) => {
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

  const assignTicket = async (ticketId: string, assignedTo: string) => {

    // Optimistic Update
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
    } catch (err: any) {
      setTickets(previousTickets);
      console.error('Error assigning ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket atanırken hata oluştu'));
      return false;
    }
  };

  const addComment = async (ticketId: string, content: string, isInternal?: boolean) => {

    console.log('Add comment:', ticketId, content, isInternal);

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      content,
      isInternal: isInternal || false,
      ticketId,
      authorId: user?.id,
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

      // Replace temp comment with real one
      setTickets(prev => prev.map(ticket =>
        ticket.id === ticketId
          ? {
            ...ticket,
            comments: ticket.comments.map((c: any) => c.id === tempId ? newComment : c)
          }
          : ticket
      ));

      toast.success('✅ Yorum başarıyla eklendi!');
      return true;
    } catch (err: any) {
      setTickets(previousTickets);
      console.error('Error adding comment:', err);
      const errorMessage = '❌ ' + (err.message || 'Yorum eklenirken hata oluştu');
      toast.error(errorMessage);
      return false;
    }
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
    filterTickets,
    getTicketStats
  };
};