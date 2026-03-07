import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  apiClient: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getProfiles: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock window.location
    delete (window as Partial<Window>).location;
    window.location = { ...originalLocation, href: '' } as unknown as Location;
  });

  afterEach(() => {
    cleanup();
    window.location = originalLocation;
    localStorage.clear();
  });

  it('should initialize with no user if token is not present', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should initialize correctly with a valid JWT token', () => {
    // Construct a valid base64 payload
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      department: 'IT',
      roles: ['admin']
    };
    const payload = btoa(JSON.stringify(mockUser));
    const token = `header.${payload}.signature`;

    localStorage.setItem('auth_token', token);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear invalid token on initialization', () => {
    localStorage.setItem('auth_token', 'invalid_token');

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  describe('Authentication Actions', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      department: 'IT',
      roles: ['admin']
    };

    it('should login successfully', async () => {
      vi.mocked(apiClient.login).mockResolvedValueOnce({
        token: 'fake-jwt-token',
        user: mockUser
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'password123');
      });

      expect(success!).toBe(true);
      expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token');
      expect(toast.success).toHaveBeenCalledWith('Giriş başarılı!');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      vi.mocked(apiClient.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@example.com', 'wrong');
      });

      expect(success!).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should signup successfully', async () => {
      vi.mocked(apiClient.signup).mockResolvedValueOnce({
        token: 'fake-signup-token',
        user: mockUser
      });

      const { result } = renderHook(() => useAuth());

      let success: boolean;
      await act(async () => {
        success = await result.current.signup(
          'test@example.com',
          'password123',
          'Test',
          'User',
          'IT'
        );
      });

      expect(success!).toBe(true);
      expect(apiClient.signup).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test',
        'User',
        'IT'
      );
      expect(localStorage.getItem('auth_token')).toBe('fake-signup-token');
      expect(toast.success).toHaveBeenCalledWith('Kayıt başarılı!');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle signup failure', async () => {
      vi.mocked(apiClient.signup).mockRejectedValueOnce(new Error('Email already exists'));

      const { result } = renderHook(() => useAuth());

      let success: boolean;
      await act(async () => {
        success = await result.current.signup(
          'test@example.com',
          'password123',
          'Test',
          'User',
          'IT'
        );
      });

      expect(success!).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should logout correctly', () => {
      // Setup initial logged in state
      const payload = btoa(JSON.stringify(mockUser));
      const token = `header.${payload}.signature`;
      localStorage.setItem('auth_token', token);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(apiClient.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(toast.success).toHaveBeenCalledWith('Çıkış yapıldı');
      expect(window.location.href).toBe('/auth');
    });
  });

  describe('Roles and Permissions', () => {
    const setupHookWithUser = (user: Record<string, unknown>) => {
      const payload = btoa(JSON.stringify(user));
      const token = `header.${payload}.signature`;
      localStorage.setItem('auth_token', token);
      return renderHook(() => useAuth());
    };

    it('should correctly evaluate hasRole', () => {
      const { result } = setupHookWithUser({ roles: ['admin'] });

      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('employee')).toBe(false);
    });

    it('should correctly evaluate hasPermission based on hierarchy', () => {
      const { result } = setupHookWithUser({ roles: ['department_manager'] });

      expect(result.current.hasPermission('employee')).toBe(true); // Can access lower
      expect(result.current.hasPermission('department_manager')).toBe(true); // Can access same
      expect(result.current.hasPermission('admin')).toBe(false); // Cannot access higher
    });

    it('should correctly evaluate canAccessDepartment', () => {
      const adminResult = setupHookWithUser({ roles: ['admin'], department: 'IT' }).result;
      expect(adminResult.current.canAccessDepartment('HR')).toBe(true); // Admin accesses all

      const employeeResult = setupHookWithUser({ roles: ['employee'], department: 'IT' }).result;
      expect(employeeResult.current.canAccessDepartment('IT')).toBe(true); // Access own
      expect(employeeResult.current.canAccessDepartment('HR')).toBe(false); // Cannot access other
    });

    it('should correctly evaluate canEdit', () => {
      const boardMemberResult = setupHookWithUser({ roles: ['board_member'] }).result;
      expect(boardMemberResult.current.canEdit()).toBe(false); // Board members cannot edit

      const employeeResult = setupHookWithUser({ roles: ['employee'] }).result;
      expect(employeeResult.current.canEdit()).toBe(true); // Others can edit
    });

    it('should correctly evaluate canDelete', () => {
      const adminResult = setupHookWithUser({ roles: ['admin'] }).result;
      expect(adminResult.current.canDelete()).toBe(true); // Admins can delete

      const managerResult = setupHookWithUser({ roles: ['department_manager'] }).result;
      expect(managerResult.current.canDelete()).toBe(false); // Non-admins cannot delete

      const boardMemberResult = setupHookWithUser({ roles: ['board_member'] }).result;
      expect(boardMemberResult.current.canDelete()).toBe(false); // Board members cannot delete
    });
  });

  describe('refreshAuth', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      department: 'IT',
      roles: ['employee']
    };

    const setupLoggedIn = () => {
      const payload = btoa(JSON.stringify(mockUser));
      const token = `header.${payload}.signature`;
      localStorage.setItem('auth_token', token);
      return renderHook(() => useAuth());
    };

    it('should update user from backend if successful', async () => {
      const updatedProfile = {
        ...mockUser,
        roles: [], // backend returns empty first, we get roles from userRoles
        userRoles: [{ role: 'department_manager' }]
      };

      vi.mocked(apiClient.getProfiles).mockResolvedValueOnce([updatedProfile] as unknown as import('@/types/user').User[]);

      const { result } = setupLoggedIn();

      expect(result.current.user?.roles).toEqual(['employee']);

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(apiClient.getProfiles).toHaveBeenCalled();
      expect(result.current.user?.roles).toEqual(['department_manager']);
    });

    it('should fallback to token if backend fails', async () => {
      vi.mocked(apiClient.getProfiles).mockRejectedValueOnce(new Error('API Down'));

      const { result } = setupLoggedIn();

      await act(async () => {
        await result.current.refreshAuth();
      });

      // User should still be logged in and populated from token
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle missing token gracefully', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

});
