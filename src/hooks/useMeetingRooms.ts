import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from './useAuth';
import { MeetingRoom, MeetingReservation, CreateMeetingRoomData, CreateMeetingReservationData } from '@/types/meeting';

export const useMeetingRooms = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [reservations, setReservations] = useState<MeetingReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMeetingRooms();
      setRooms(data || []);
    } catch (err) {
      console.error('Error loading meeting rooms:', err);
      const message = err instanceof Error ? err.message : 'Toplantı odaları yüklenirken hata oluştu';
      setError(message);
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
    } catch (err) {
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

    socket.on('reservation_created', (newReservation: MeetingReservation) => {
      setReservations(prev => {
        if (prev.some(r => r.id === newReservation.id)) return prev;
        return [newReservation, ...prev];
      });
      // toast.info(`📅 Yeni Rezervasyon: ${newReservation.room.name}`); // commented out as room might not be populated in socket event depending on backend
    });

    socket.on('reservation_updated', (updatedReservation: MeetingReservation) => {
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
  const createRoom = async (roomData: CreateMeetingRoomData) => {
    try {
      const newRoom = await apiClient.createMeetingRoom(roomData);
      setRooms(prev => [newRoom, ...prev]);
      toast.success(`✅ Toplantı odası "${roomData.name}" başarıyla oluşturuldu!`);
      return newRoom;
    } catch (err) {
      console.error('Error creating meeting room:', err);
      const message = err instanceof Error ? err.message : 'Toplantı odası oluşturulurken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  // Update room (admin only)
  const updateRoom = async (id: string, data: Partial<CreateMeetingRoomData> & { responsibleId?: string }) => {
    try {
      const updatedRoom = await apiClient.updateMeetingRoom(id, data);
      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      toast.success(`✅ Toplantı odası "${updatedRoom.name}" başarıyla güncellendi!`);
      return updatedRoom;
    } catch (err) {
      console.error('Error updating meeting room:', err);
      const message = err instanceof Error ? err.message : 'Toplantı odası güncellenirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  // Delete room (admin only)
  const deleteRoom = async (id: string) => {
    try {
      await apiClient.deleteMeetingRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
      toast.success('✅ Toplantı odası başarıyla silindi!');
    } catch (err) {
      console.error('Error deleting meeting room:', err);
      const message = err instanceof Error ? err.message : 'Toplantı odası silinirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  // Create reservation
  const createReservation = async (reservationData: CreateMeetingReservationData) => {
    try {
      // Optimistic Update is tricky with types if we don't have full object structure matching MeetingReservation
      // skipping complex optimistic update for now to avoid specific type issues, relying on fast server response or simple append
      // OR doing a proper optimistic update with casting if needed

      const newReservation = await apiClient.createMeetingReservation(reservationData);

      setReservations(prev => [newReservation, ...prev]);

      toast.success('✅ Rezervasyon talebi başarıyla oluşturuldu! Onay bekliyor...');
      return newReservation;
    } catch (err) {
      console.error('Error creating reservation:', err);
      const message = err instanceof Error ? err.message : 'Rezervasyon oluşturulurken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  // Approve reservation
  const approveReservation = async (id: string) => {
    try {
      // Optimistic Update
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'approved', approvedBy: user?.id } : r
      ));

      const updated = await apiClient.approveMeetingReservation(id);

      toast.success('✅ Rezervasyon onaylandı!');

      // Reload rooms to update availability
      loadRooms();
      return updated;
    } catch (err) {
      console.error('Error approving reservation:', err);
      const message = err instanceof Error ? err.message : 'Rezervasyon onaylanırken hata oluştu';
      toast.error('❌ ' + message);
      loadReservations();
      throw err;
    }
  };

  // Reject reservation
  const rejectReservation = async (id: string) => {
    try {
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      ));

      const updated = await apiClient.rejectMeetingReservation(id);

      toast.success('Rezervasyon reddedildi');
      return updated;
    } catch (err) {
      console.error('Error rejecting reservation:', err);
      const message = err instanceof Error ? err.message : 'Rezervasyon reddedilirken hata oluştu';
      toast.error('❌ ' + message);
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
    } catch (err) {
      console.error('Error updating reservation:', err);
      const message = err instanceof Error ? err.message : 'Rezervasyon güncellenirken hata oluştu';
      toast.error('❌ ' + message);
      throw err;
    }
  };

  // Delete reservation
  const deleteReservation = async (id: string) => {
    try {
      setReservations(prev => prev.filter(r => r.id !== id));

      await apiClient.deleteMeetingReservation(id);

      toast.success('✅ Rezervasyon başarıyla silindi!');
      // Reload rooms to update availability
      loadRooms();
    } catch (err) {
      console.error('Error deleting reservation:', err);
      const message = err instanceof Error ? err.message : 'Rezervasyon silinirken hata oluştu';
      toast.error('❌ ' + message);
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
    updateRoom,
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

