import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMeetingRooms } from '../hooks/useMeetingRooms';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../hooks/useAuth';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMeetingRooms: vi.fn(),
    getMeetingReservations: vi.fn(),
    createMeetingRoom: vi.fn(),
    updateMeetingRoom: vi.fn(),
    deleteMeetingRoom: vi.fn(),
    createMeetingReservation: vi.fn(),
    approveMeetingReservation: vi.fn(),
    rejectMeetingReservation: vi.fn(),
    updateMeetingReservation: vi.fn(),
    deleteMeetingReservation: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../contexts/SocketContext', () => ({
  useSocket: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
};

const mockUser = {
  id: 'test-user-id',
  firstName: 'Test',
  lastName: 'User',
};

describe('useMeetingRooms Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useSocket).mockReturnValue({ socket: mockSocket as any, isConnected: true, connect: vi.fn(), disconnect: vi.fn() });
    vi.mocked(useAuth).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: mockUser as any,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      loading: false,
      isAuthenticated: true,
      hasRole: vi.fn(),
      canEdit: vi.fn(),
      canDelete: vi.fn(),
      initialized: true
    });

    // Default API mock implementations to return empty arrays
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingRooms).mockResolvedValue([] as any);
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue([]);
  });

  it('should initialize and load rooms and reservations on mount', async () => {
    const mockRooms = [{ id: 'room-1', name: 'Conference A', capacity: 10, amenities: [] }];
    const mockReservations = [{ id: 'res-1', roomId: 'room-1', title: 'Meeting 1', startTime: new Date().toISOString(), endTime: new Date().toISOString(), status: 'pending' }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingRooms).mockResolvedValue(mockRooms as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue(mockReservations as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.rooms).toEqual([]);
    expect(result.current.reservations).toEqual([]);

    // Wait for the next tick to allow effects to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check final state
    expect(result.current.loading).toBe(false);
    expect(result.current.rooms).toEqual(mockRooms);
    expect(result.current.reservations).toEqual(mockReservations);
    expect(apiClient.getMeetingRooms).toHaveBeenCalledTimes(1);
    expect(apiClient.getMeetingReservations).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when loading rooms', async () => {
    const errorMsg = 'Failed to load rooms';
    vi.mocked(apiClient.getMeetingRooms).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useMeetingRooms());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMsg);
    expect(toast.error).toHaveBeenCalledWith('Toplantı odaları yüklenirken hata oluştu');
  });

  it('should handle errors when loading reservations', async () => {
    vi.mocked(apiClient.getMeetingReservations).mockRejectedValue(new Error('Failed to load reservations'));

    renderHook(() => useMeetingRooms());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith('Rezervasyonlar yüklenirken hata oluştu');
  });

  it('should create a room successfully', async () => {
    const newRoomData = { name: 'New Room', capacity: 20, amenities: ['Projector'] };
    const createdRoom = { id: 'room-2', ...newRoomData };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.createMeetingRoom).mockResolvedValue(createdRoom as any);

    const { result } = renderHook(() => useMeetingRooms());

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.createRoom(newRoomData as any);
    });

    expect(apiClient.createMeetingRoom).toHaveBeenCalledWith(newRoomData);
    expect(result.current.rooms).toContainEqual(createdRoom);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('başarıyla oluşturuldu!'));
  });

  it('should handle errors when creating a room', async () => {
    const errorMsg = 'Creation failed';
    vi.mocked(apiClient.createMeetingRoom).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useMeetingRooms());

    await expect(act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.createRoom({ name: 'New Room' } as any);
    })).rejects.toThrow(errorMsg);

    expect(toast.error).toHaveBeenCalledWith('❌ ' + errorMsg);
  });

  it('should update a room successfully', async () => {
    const initialRooms = [{ id: 'room-1', name: 'Conference A', capacity: 10, amenities: [] }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingRooms).mockResolvedValue(initialRooms as any);

    const updateData = { name: 'Updated Conference A' };
    const updatedRoom = { ...initialRooms[0], ...updateData };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.updateMeetingRoom).mockResolvedValue(updatedRoom as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateRoom('room-1', updateData);
    });

    expect(apiClient.updateMeetingRoom).toHaveBeenCalledWith('room-1', updateData);
    expect(result.current.rooms).toContainEqual(updatedRoom);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('başarıyla güncellendi!'));
  });

  it('should delete a room successfully', async () => {
    const initialRooms = [{ id: 'room-1', name: 'Conference A', capacity: 10, amenities: [] }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingRooms).mockResolvedValue(initialRooms as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.deleteMeetingRoom).mockResolvedValue({} as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteRoom('room-1');
    });

    expect(apiClient.deleteMeetingRoom).toHaveBeenCalledWith('room-1');
    expect(result.current.rooms).not.toContainEqual(initialRooms[0]);
    expect(toast.success).toHaveBeenCalledWith('✅ Toplantı odası başarıyla silindi!');
  });

  it('should create a reservation successfully', async () => {
    const newReservationData = { roomId: 'room-1', title: 'Test Meeting', startTime: new Date().toISOString(), endTime: new Date().toISOString() };
    const createdReservation = { id: 'res-2', ...newReservationData, status: 'pending' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.createMeetingReservation).mockResolvedValue(createdReservation as any);

    const { result } = renderHook(() => useMeetingRooms());

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.createReservation(newReservationData as any);
    });

    expect(apiClient.createMeetingReservation).toHaveBeenCalledWith(newReservationData);
    expect(result.current.reservations).toContainEqual(createdReservation);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('başarıyla oluşturuldu!'));
  });

  it('should handle errors when creating a reservation', async () => {
    const errorMsg = 'Reservation failed';
    vi.mocked(apiClient.createMeetingReservation).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useMeetingRooms());

    await expect(act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.createReservation({ roomId: 'room-1' } as any);
    })).rejects.toThrow(errorMsg);

    expect(toast.error).toHaveBeenCalledWith('❌ ' + errorMsg);
  });

  it('should approve a reservation successfully', async () => {
    const initialReservations = [{ id: 'res-1', roomId: 'room-1', title: 'Meeting', status: 'pending' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue(initialReservations as any);

    const approvedReservation = { ...initialReservations[0], status: 'approved', approvedBy: mockUser.id };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.approveMeetingReservation).mockResolvedValue(approvedReservation as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.approveReservation('res-1');
    });

    expect(apiClient.approveMeetingReservation).toHaveBeenCalledWith('res-1');
    // Verify optimistic update or returned value update
    const res = result.current.reservations.find(r => r.id === 'res-1');
    expect(res?.status).toBe('approved');
    expect(res?.approvedBy).toBe(mockUser.id);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('onaylandı'));
  });

  it('should reject a reservation successfully', async () => {
    const initialReservations = [{ id: 'res-1', roomId: 'room-1', title: 'Meeting', status: 'pending' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue(initialReservations as any);

    const rejectedReservation = { ...initialReservations[0], status: 'rejected' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.rejectMeetingReservation).mockResolvedValue(rejectedReservation as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.rejectReservation('res-1');
    });

    expect(apiClient.rejectMeetingReservation).toHaveBeenCalledWith('res-1');
    const res = result.current.reservations.find(r => r.id === 'res-1');
    expect(res?.status).toBe('rejected');
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('reddedildi'));
  });

  it('should update a reservation successfully', async () => {
    const initialReservations = [{ id: 'res-1', roomId: 'room-1', title: 'Meeting', status: 'pending' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue(initialReservations as any);

    const updateData = { notes: 'Updated notes' };
    const updatedReservation = { ...initialReservations[0], ...updateData };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.updateMeetingReservation).mockResolvedValue(updatedReservation as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateReservation('res-1', updateData);
    });

    expect(apiClient.updateMeetingReservation).toHaveBeenCalledWith('res-1', updateData);
    expect(result.current.reservations).toContainEqual(updatedReservation);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('başarıyla güncellendi!'));
  });

  it('should delete a reservation successfully', async () => {
    const initialReservations = [{ id: 'res-1', roomId: 'room-1', title: 'Meeting', status: 'pending' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.getMeetingReservations).mockResolvedValue(initialReservations as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(apiClient.deleteMeetingReservation).mockResolvedValue({} as any);

    const { result } = renderHook(() => useMeetingRooms());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteReservation('res-1');
    });

    expect(apiClient.deleteMeetingReservation).toHaveBeenCalledWith('res-1');
    expect(result.current.reservations).not.toContainEqual(initialReservations[0]);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('başarıyla silindi!'));
  });

  describe('Socket Events', () => {
    it('should add a new reservation on reservation_created event', async () => {
      const { result } = renderHook(() => useMeetingRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const newRes = { id: 'res-socket-1', title: 'Socket Event Res' };

      // Get the registered callback
      const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'reservation_created');
      expect(onCall).toBeDefined();
      const callback = onCall![1];

      act(() => {
        callback(newRes);
      });

      expect(result.current.reservations).toContainEqual(newRes);
    });

    it('should ignore duplicate reservations on reservation_created event', async () => {
      const existingRes = { id: 'res-socket-1', title: 'Socket Event Res' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(apiClient.getMeetingReservations).mockResolvedValue([existingRes] as any);

      const { result } = renderHook(() => useMeetingRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'reservation_created');
      const callback = onCall![1];

      act(() => {
        callback(existingRes); // Duplicate
      });

      expect(result.current.reservations.filter(r => r.id === 'res-socket-1').length).toBe(1);
    });

    it('should update a reservation on reservation_updated event', async () => {
      const existingRes = { id: 'res-socket-2', title: 'Old Title', status: 'pending' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(apiClient.getMeetingReservations).mockResolvedValue([existingRes] as any);

      const { result } = renderHook(() => useMeetingRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const updatedRes = { ...existingRes, title: 'New Title', status: 'approved' };

      const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'reservation_updated');
      const callback = onCall![1];

      act(() => {
        callback(updatedRes);
      });

      expect(result.current.reservations).toContainEqual(updatedRes);
      expect(result.current.reservations).not.toContainEqual(existingRes);
    });

    it('should remove a reservation on reservation_deleted event', async () => {
      const existingRes = { id: 'res-socket-3', title: 'To be deleted' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(apiClient.getMeetingReservations).mockResolvedValue([existingRes] as any);

      const { result } = renderHook(() => useMeetingRooms());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const onCall = mockSocket.on.mock.calls.find(call => call[0] === 'reservation_deleted');
      const callback = onCall![1];

      act(() => {
        callback('res-socket-3');
      });

      expect(result.current.reservations).not.toContainEqual(existingRes);
    });
  });
});
