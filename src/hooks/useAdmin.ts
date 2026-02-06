import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useAdmin = () => {
  const { user, hasRole } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
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
  useEffect(() => {
    const loadProfiles = async () => {
      if (!hasRole('admin')) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getProfiles();
        setProfiles(data);
      } catch (err: any) {
        console.error('Error loading profiles:', err);
        setError(err.message || 'Profiller yüklenirken hata oluştu');
        toast.error('Profiller yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [hasRole]);

  const createProfile = async (profileData: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    roles: string[];
  }) => {
    try {
      const newProfile = await apiClient.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
      toast.success('Kullanıcı başarıyla oluşturuldu');
      return newProfile;
    } catch (err: any) {
      console.error('Error creating profile:', err);
      toast.error(err.message || 'Kullanıcı oluşturulurken hata oluştu');
      throw err;
    }
  };

  const updateProfile = async (id: string, profileData: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    roles: string[];
  }) => {
    try {
      const updatedProfile = await apiClient.updateProfile(id, profileData);
      setProfiles(prev => 
        prev.map(p => p.id === id ? updatedProfile : p)
      );
      toast.success('Kullanıcı başarıyla güncellendi');
      return updatedProfile;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Kullanıcı güncellenirken hata oluştu');
      throw err;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await apiClient.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      toast.success('Kullanıcı başarıyla silindi');
    } catch (err: any) {
      console.error('Error deleting profile:', err);
      toast.error(err.message || 'Kullanıcı silinirken hata oluştu');
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
      role: user.roles.includes('admin') ? 'admin' : 
            user.roles.includes('department_manager') ? 'department_manager' : 'employee',
      department: user.department
    } : null
  };
};