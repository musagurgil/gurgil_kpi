import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    console.log('useAuth useEffect: Checking token...');
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Try to decode JWT token
        if (token.includes('.')) {
          // JWT token format
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            id: payload.id,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            department: payload.department,
            roles: payload.roles
          };
          console.log('useAuth useEffect: Token found, user:', user);
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
          return;
        } else {
          // Base64 encoded JSON format (fallback)
          const user = JSON.parse(atob(token));
          console.log('useAuth useEffect: Token found, user:', user);
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
          return;
        }
      } catch (error) {
        console.log('useAuth useEffect: Invalid token, removing...', error);
        localStorage.removeItem('auth_token');
      }
    }
    console.log('useAuth useEffect: No token found, setting loading false');
    setAuthState(prev => ({ ...prev, loading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Login attempt:', email);
      const response = await apiClient.login(email, password);
      
      console.log('Login successful:', response.user);

      // Store JWT token
      localStorage.setItem('auth_token', response.token);

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success('Giriş başarılı!');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
      return false;
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    department: string
  ) => {
    try {
      console.log('Signup attempt:', email);
      const response = await apiClient.signup(email, password, firstName, lastName, department);
      
      console.log('Signup successful:', response.user);

      // Store JWT token
      localStorage.setItem('auth_token', response.token);

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });

      toast.success('Kayıt başarılı!');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    toast.success('Çıkış yapıldı');
    
    // Force redirect to login page
    window.location.href = '/auth';
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    return authState.user?.roles.includes(role) || false;
  }, [authState.user]);

  const hasPermission = useCallback((requiredRole: string): boolean => {
    if (!authState.user) return false;

    const roleHierarchy = {
      admin: 3,
      department_manager: 2,
      employee: 1,
    };

    const userMaxRole = Math.max(
      ...authState.user.roles.map(r => roleHierarchy[r as keyof typeof roleHierarchy] || 0)
    );

    return userMaxRole >= roleHierarchy[requiredRole as keyof typeof roleHierarchy];
  }, [authState.user]);

  const canAccessDepartment = useCallback((department: string): boolean => {
    if (hasRole('admin')) return true;
    return authState.user?.department === department;
  }, [authState.user, hasRole]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    login,
    signup,
    logout,
    hasRole,
    hasPermission,
    canAccessDepartment,
  };
};