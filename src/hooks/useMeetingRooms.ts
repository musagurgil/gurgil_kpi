import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useMeetingRooms = () => {
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
      const newReservation = await apiClient.createMeetingReservation(reservationData);
      setReservations(prev => [newReservation, ...prev]);
      toast.success('✅ Rezervasyon talebi başarıyla oluşturuldu! Onay bekliyor...');
      return newReservation;
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon oluşturulurken hata oluştu'));
      throw err;
    }
  };

  // Approve reservation
  const approveReservation = async (id: string) => {
    try {
      const updated = await apiClient.approveMeetingReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('✅ Rezervasyon onaylandı!');
      // Reload rooms to update availability
      loadRooms();
      return updated;
    } catch (err: any) {
      console.error('Error approving reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon onaylanırken hata oluştu'));
      throw err;
    }
  };

  // Reject reservation
  const rejectReservation = async (id: string) => {
    try {
      const updated = await apiClient.rejectMeetingReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Rezervasyon reddedildi');
      return updated;
    } catch (err: any) {
      console.error('Error rejecting reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon reddedilirken hata oluştu'));
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
      await apiClient.deleteMeetingReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success('✅ Rezervasyon başarıyla silindi!');
      // Reload rooms to update availability
      loadRooms();
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      toast.error('❌ ' + (err.message || 'Rezervasyon silinirken hata oluştu'));
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

