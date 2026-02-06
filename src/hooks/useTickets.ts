import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useTickets = () => {
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
    try {
      console.log('Update ticket:', id, ticketData);
      const updatedTicket = await apiClient.updateTicket(id, ticketData);
      
      // Update the ticket in the local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === id ? updatedTicket : ticket
      ));
      
      toast.success('✅ Ticket başarıyla güncellendi!');
      return updatedTicket;
    } catch (err: any) {
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
    try {
      const updatedTicket = await apiClient.updateTicket(ticketId, {
        assignedTo,
        status: 'in_progress'
      });
      
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
      
      toast.success('✅ Ticket başarıyla atandı!');
      return true;
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      toast.error('❌ ' + (err.message || 'Ticket atanırken hata oluştu'));
      return false;
    }
  };

  const addComment = async (ticketId: string, content: string, isInternal?: boolean) => {
    try {
      console.log('Add comment:', ticketId, content, isInternal);
      
      // Send comment to backend
      const newComment = await apiClient.addTicketComment(ticketId, content, isInternal);
      
      // Update the ticket in local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, comments: [...(ticket.comments || []), newComment] }
          : ticket
      ));
      
      toast.success('✅ Yorum başarıyla eklendi!');
      return true;
    } catch (err: any) {
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