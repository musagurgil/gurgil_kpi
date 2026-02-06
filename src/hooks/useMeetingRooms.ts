import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';

export const useMeetingRooms = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMeetingRooms();
      setRooms(data || []);
    } catch (err: any) {
      console.error('Error loading meeting rooms:', err);
      setError(err.message || 'Toplantı odaları yüklenirken hata oluştu');
      toast.error('Toplantı odaları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load reservations
  const loadReservations = async () => {
    try {
      const data = await apiClient.getMeetingReservations();
      setReservations(data || []);
    } catch (err: any) {
      console.error('Error loading reservations:', err);
      toast.error('Rezervasyonlar yüklenirken hata oluştu');
    }
  };

  // Load both on mount
  useEffect(() => {
    loadRooms();
    loadReservations();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('reservation_created', (newReservation: any) => {
      setReservations(prev => {
        if (prev.some(r => r.id === newReservation.id)) return prev;
        return [newReservation, ...prev];
      });
      toast.info(`📅 Yeni Rezervasyon: ${newReservation.room.name}`);
    });

    socket.on('reservation_updated', (updatedReservation: any) => {
      setReservations(prev => prev.map(r => r.id === updatedReservation.id ? updatedReservation : r));
    });

    socket.on('reservation_deleted', (reservationId: string) => {
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    });

    return () => {
      socket.off('reservation_created');
      socket.off('reservation_updated');
      socket.off('reservation_deleted');
    };
  }, [socket]);

  // Create room (admin only)
  const createRoom = async (roomData: {
    name: string;
    capacity: number;
    location: string;
    description?: string;
  }) => {
    try {
      const newRoom = await apiClient.createMeetingRoom(roomData);
      setRooms(prev => [newRoom, ...prev]);
      toast.success(`✅ Toplantı odası "${roomData.name}" başarıyla oluşturuldu!`);
      return newRoom;
    } catch (err: any) {
      console.error('Error creating meeting room:', err);
      toast.error('❌ ' + (err.message || 'Toplantı odası oluşturulurken hata oluştu'));
      throw err;
    }
  };

  // Delete room (admin only)
  const deleteRoom = async (id: string) => {
    try {
      await apiClient.deleteMeetingRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
      toast.success('✅ Toplantı odası başarıyla silindi!');
    } catch (err: any) {
      console.error('Error deleting meeting room:', err);
      toast.error('❌ ' + (err.message || 'Toplantı odası silinirken hata oluştu'));
      throw err;
    }
  };

  // Create reservation
  const createReservation = async (reservationData: {
    roomId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    try {
      // Optimistic Update
      const tempId = `temp-${Date.now()}`;
      const optimisticReservation = {
        id: tempId,
        ...reservationData,
        status: 'pending',
        requestedBy: user?.id,
        requester: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          department: user?.department
        },
        room: rooms.find(r => r.id === reservationData.roomId)
      };

      setReservations(prev => [optimisticReservation, ...prev]);

      const newReservation = await apiClient.createMeetingReservation(reservationData);

      // Replace temp with real
      setReservations(prev => prev.map(r => r.id === tempId ? newReservation : r));

      toast.success('✅ Rezervasyon talebi başarıyla oluşturuldu! Onay bekliyor...');
      return newReservation;
    } catch (err: any) {
      // Rollback (remove the temp reservation)
      setReservations(prev => prev.filter(r => !r.id.startsWith('temp-')));
      console.error('Error creating reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon oluşturulurken hata oluştu'));
      throw err;
    }
  };

  // Approve reservation
  const approveReservation = async (id: string) => {
    try {
      // Optimistic Update
      const previousReservations = [...reservations];
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'approved', approvedBy: user?.id } : r
      ));

      const updated = await apiClient.approveMeetingReservation(id);

      // Server response confirmation (handled by socket too)
      toast.success('✅ Rezervasyon onaylandı!');

      // Reload rooms to update availability
      loadRooms();
      return updated;
    } catch (err: any) {
      // Rollback
      // We need to fetch previous state or just revert locally if we stored it
      // Simple rollback: re-fetch or revert specific item
      // Let's rely on re-fetch for rollback in complex cases or just revert content
      console.error('Error approving reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon onaylanırken hata oluştu'));
      // Ideally rollback state here:
      loadReservations();
      throw err;
    }
  };

  // Reject reservation
  const rejectReservation = async (id: string) => {
    try {
      // Optimistic Update
      const previousReservations = [...reservations];
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      ));

      const updated = await apiClient.rejectMeetingReservation(id);

      toast.success('Rezervasyon reddedildi');
      return updated;
    } catch (err: any) {
      console.error('Error rejecting reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon reddedilirken hata oluştu'));
      loadReservations(); // Rollback
      throw err;
    }
  };

  // Update reservation
  const updateReservation = async (id: string, data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) => {
    try {
      const updated = await apiClient.updateMeetingReservation(id, data);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('✅ Rezervasyon başarıyla güncellendi!');
      // Reload rooms to update availability
      loadRooms();
      return updated;
    } catch (err: any) {
      console.error('Error updating reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon güncellenirken hata oluştu'));
      throw err;
    }
  };

  // Delete reservation
  const deleteReservation = async (id: string) => {
    try {
      // Optimistic Update
      setReservations(prev => prev.filter(r => r.id !== id));

      await apiClient.deleteMeetingReservation(id);

      toast.success('✅ Rezervasyon başarıyla silindi!');
      // Reload rooms to update availability
      loadRooms();
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon silinirken hata oluştu'));
      loadReservations(); // Rollback
      throw err;
    }
  };

  return {
    rooms,
    reservations,
    loading,
    error,
    createRoom,
    deleteRoom,
    createReservation,
    approveReservation,
    rejectReservation,
    updateReservation,
    deleteReservation,
    refreshRooms: loadRooms,
    refreshReservations: loadReservations
  };
};

