import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

vi.mock('../lib/api', () => ({
  apiClient: {
    login: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should handle login failure correctly', async () => {
    const errorMessage = 'Invalid credentials';
    vi.mocked(apiClient.login).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    let success;
    await act(async () => {
      success = await result.current.login('test@example.com', 'wrongpassword');
    });

    // Assert that login returned false
    expect(success).toBe(false);

    // Assert that toast.error was called with correct message
    expect(toast.error).toHaveBeenCalledWith(errorMessage);

    // Assert state hasn't changed to authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
