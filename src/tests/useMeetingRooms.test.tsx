import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMeetingRooms } from '../hooks/useMeetingRooms';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiClient: {
    getMeetingRooms: vi.fn().mockResolvedValue([]),
    getMeetingReservations: vi.fn().mockResolvedValue([]),
    createMeetingRoom: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useMeetingRooms Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles errors during meeting room creation', async () => {
    const errorMessage = 'Network Error';
    vi.mocked(apiClient.createMeetingRoom).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useMeetingRooms());

    const roomData = { name: 'Test Room', capacity: 10, equipment: [] };

    await act(async () => {
      await expect(result.current.createRoom(roomData)).rejects.toThrow(errorMessage);
    });

    expect(apiClient.createMeetingRoom).toHaveBeenCalledWith(roomData);
    expect(toast.error).toHaveBeenCalledWith('❌ ' + errorMessage);
  });
});
