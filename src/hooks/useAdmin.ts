import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { User, CreateUserData } from '@/types/user';

export const useAdmin = () => {
  const { user, hasRole } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock filters
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: '',
    user: '',
    status: ''
  });

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

  const getAvailableDepartments = () => [
    'Yönetim', 'Satış', 'Pazarlama', 'İnsan Kaynakları',
    'IT', 'Finans', 'Operasyon', 'Müşteri Hizmetleri'
  ];

  const getAvailableUsers = () => profiles.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    email: p.email
  }));

  const exportToCSV = () => {
    console.log('Export to CSV functionality would be implemented here');
  };

  return {
    profiles,
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
      roles: user.roles, // Updated to use roles
      department: user.department
    } : null,
    refetch: loadProfiles
  };
};