import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { User, CreateUserData } from '@/types/user';
import { useAdminFilters, AdminFiltersState } from '@/stores/adminFilterStore';

export type { AdminFiltersState } from '@/stores/adminFilterStore';

export const useAdmin = () => {
  const { user, hasRole } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use shared Zustand store for filters
  const { filters, setFilters } = useAdminFilters();

  // Load profiles
  const loadProfiles = useCallback(async () => {
    if (!hasRole('admin')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error loading profiles:', err);
      const message = err instanceof Error ? err.message : 'Profiller yüklenirken hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [hasRole]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Filtered profiles based on department and user filters
  const filteredProfiles = useMemo(() => {
    let result = profiles;

    if (filters.department) {
      result = result.filter(p => p.department === filters.department);
    }

    if (filters.userId) {
      result = result.filter(p => p.id === filters.userId);
    }

    return result;
  }, [profiles, filters.department, filters.userId]);

  const createProfile = async (profileData: CreateUserData) => {
    try {
      const newProfile = await apiClient.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
      toast.success('Kullanıcı başarıyla oluşturuldu');
      return newProfile;
    } catch (err) {
      console.error('Error creating profile:', err);
      const message = err instanceof Error ? err.message : 'Kullanıcı oluşturulurken hata oluştu';
      toast.error(message);
      throw err;
    }
  };

  const updateProfile = async (id: string, profileData: Partial<CreateUserData>) => {
    try {
      const updatedProfile = await apiClient.updateProfile(id, profileData);
      setProfiles(prev =>
        prev.map(p => p.id === id ? updatedProfile : p)
      );
      toast.success('Kullanıcı başarıyla güncellendi');
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      const message = err instanceof Error ? err.message : 'Kullanıcı güncellenirken hata oluştu';
      toast.error(message);
      throw err;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await apiClient.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      toast.success('Kullanıcı başarıyla silindi');
    } catch (err) {
      console.error('Error deleting profile:', err);
      const message = err instanceof Error ? err.message : 'Kullanıcı silinirken hata oluştu';
      toast.error(message);
      throw err;
    }
  };

  // Get real departments from DB profiles
  const getAvailableDepartments = useCallback(() => {
    const deptSet = new Set(profiles.map(p => p.department).filter(Boolean));
    return Array.from(deptSet).sort();
  }, [profiles]);

  const getAvailableUsers = useCallback(() => profiles.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    email: p.email
  })), [profiles]);

  // Real CSV export implementation
  const exportToCSV = useCallback(() => {
    if (filteredProfiles.length === 0) {
      toast.error('Dışa aktarılacak veri bulunamadı');
      return;
    }

    const headers = ['Ad', 'Soyad', 'E-posta', 'Departman', 'Durum'];
    const rows = filteredProfiles.map(p => [
      p.firstName,
      p.lastName,
      p.email,
      p.department || '-',
      p.isActive !== false ? 'Aktif' : 'Pasif'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yonetici_rapor_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${filteredProfiles.length} kayıt CSV olarak indirildi`);
  }, [filteredProfiles]);

  return {
    profiles,
    filteredProfiles,
    loading,
    error,
    filters,
    setFilters,
    getAvailableDepartments,
    getAvailableUsers,
    exportToCSV,
    createProfile,
    updateProfile,
    deleteProfile,
    currentUser: user ? {
      id: user.id,
      roles: user.roles,
      department: user.department
    } : null,
    refetch: loadProfiles
  };
};