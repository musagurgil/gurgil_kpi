import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useAdmin } from '../hooks/useAdmin';
import { apiClient } from '@/lib/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useAdminFilters } from '@/stores/adminFilterStore';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  apiClient: {
    getProfiles: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/stores/adminFilterStore', () => ({
  useAdminFilters: vi.fn(),
}));

describe('useAdmin Hook', () => {
  const mockSetFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Add missing URL methods to jsdom environment
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: vi.fn(),
        revokeObjectURL: vi.fn(),
      },
      writable: true
    });

    // Default mocks
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'admin-1', roles: ['admin'], department: 'IT' },
      hasRole: (role: string) => role === 'admin',
    });

    vi.mocked(useAdminFilters).mockReturnValue({
      filters: {},
      setFilters: mockSetFilters,
    });

    vi.mocked(apiClient.getProfiles).mockResolvedValue([
      { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'IT', isActive: true },
      { id: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', department: 'HR', isActive: false },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it('should not load profiles if user is not admin', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', roles: ['user'], department: 'IT' },
      hasRole: (role: string) => role === 'admin' ? false : true,
    });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.loading).toBe(false);
    expect(result.current.profiles).toEqual([]);
    expect(apiClient.getProfiles).not.toHaveBeenCalled();
  });

  it('should load profiles successfully for admin', async () => {
    const { result } = renderHook(() => useAdmin());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.profiles).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(apiClient.getProfiles).toHaveBeenCalledTimes(1);
  });

  it('should handle error when loading profiles fails', async () => {
    vi.mocked(apiClient.getProfiles).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.profiles).toEqual([]);
    expect(result.current.error).toBe('Network error');
    expect(toast.error).toHaveBeenCalledWith('Network error');
  });

  it('should filter profiles by department and userId', async () => {
    vi.mocked(useAdminFilters).mockReturnValue({
      filters: { department: 'IT', userId: 'user-1' },
      setFilters: mockSetFilters,
    });

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.filteredProfiles).toHaveLength(1);
    expect(result.current.filteredProfiles[0].id).toBe('user-1');
  });

  it('should return available departments and users', async () => {
    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getAvailableDepartments()).toEqual(['HR', 'IT']);
    expect(result.current.getAvailableUsers()).toEqual([
      { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }
    ]);
  });

  it('should create a profile successfully', async () => {
    const newProfile = { id: 'user-3', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', department: 'Sales', isActive: true };
    vi.mocked(apiClient.createProfile).mockResolvedValue(newProfile);

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let createdProfile;
    await act(async () => {
      createdProfile = await result.current.createProfile(newProfile);
    });

    expect(apiClient.createProfile).toHaveBeenCalledWith(newProfile);
    expect(createdProfile).toEqual(newProfile);
    expect(result.current.profiles).toContainEqual(newProfile);
    expect(toast.success).toHaveBeenCalledWith('Kullanıcı başarıyla oluşturuldu');
  });

  it('should handle error when creating a profile fails', async () => {
    const error = new Error('Creation failed');
    vi.mocked(apiClient.createProfile).mockRejectedValue(error);

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await expect(act(async () => {
      await result.current.createProfile({});
    })).rejects.toThrow('Creation failed');

    expect(toast.error).toHaveBeenCalledWith('Creation failed');
  });

  it('should update a profile successfully', async () => {
    const updatedProfile = { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'IT', isActive: true };
    vi.mocked(apiClient.updateProfile).mockResolvedValue(updatedProfile);

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let returnedProfile;
    await act(async () => {
      returnedProfile = await result.current.updateProfile('user-1', { email: 'john.doe@example.com' });
    });

    expect(apiClient.updateProfile).toHaveBeenCalledWith('user-1', { email: 'john.doe@example.com' });
    expect(returnedProfile).toEqual(updatedProfile);

    const profileInState = result.current.profiles.find(p => p.id === 'user-1');
    expect(profileInState?.email).toBe('john.doe@example.com');
    expect(toast.success).toHaveBeenCalledWith('Kullanıcı başarıyla güncellendi');
  });

  it('should delete a profile successfully', async () => {
    vi.mocked(apiClient.deleteProfile).mockResolvedValue({});

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteProfile('user-1');
    });

    expect(apiClient.deleteProfile).toHaveBeenCalledWith('user-1');
    expect(result.current.profiles.find(p => p.id === 'user-1')).toBeUndefined();
    expect(toast.success).toHaveBeenCalledWith('Kullanıcı başarıyla silindi');
  });

  it('should export to CSV successfully', async () => {
    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Mock document and URL methods
    const mockCreateElement = vi.spyOn(document, 'createElement');
    const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null);
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);
    const mockCreateObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    // Create a mock link element
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    mockCreateElement.mockReturnValue(mockLink);

    act(() => {
      result.current.exportToCSV();
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(toast.success).toHaveBeenCalledWith('2 kayıt CSV olarak indirildi');

    // Cleanup
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
  });

  it('should handle CSV export with empty data', async () => {
    vi.mocked(apiClient.getProfiles).mockResolvedValue([]);

    const { result } = renderHook(() => useAdmin());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.exportToCSV();
    });

    expect(toast.error).toHaveBeenCalledWith('Dışa aktarılacak veri bulunamadı');
  });
});
