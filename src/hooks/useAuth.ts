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
        // Helper function to safely decode base64 with UTF-8 support
        const decodeBase64 = (str: string): string => {
          try {
            // First decode base64
            const decoded = atob(str);
            // Handle UTF-8 characters properly
            return decodeURIComponent(
              decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
          } catch (e) {
            // Fallback to simple atob if UTF-8 decode fails
            return atob(str);
          }
        };

        // Try to decode JWT token
        if (token.includes('.')) {
          // JWT token format
          const base64Payload = token.split('.')[1];
          // Replace URL-safe base64 characters
          const normalizedPayload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
          // Add padding if needed
          const paddedPayload = normalizedPayload + '='.repeat((4 - normalizedPayload.length % 4) % 4);
          
          const decodedPayload = decodeBase64(paddedPayload);
          const payload = JSON.parse(decodedPayload);
          
          const user = {
            id: payload.id,
            email: payload.email,
            firstName: payload.firstName || '',
            lastName: payload.lastName || '',
            department: payload.department || '',
            roles: payload.roles || []
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
          const decodedToken = decodeBase64(token);
          const user = JSON.parse(decodedToken);
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

  const refreshAuth = useCallback(async () => {
    try {
      console.log('refreshAuth: Refreshing auth state...');
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('refreshAuth: No token found');
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // Try to get updated profile from backend first
      try {
        const profiles = await apiClient.getProfiles();
        const currentUserId = authState.user?.id;
        
        if (currentUserId) {
          const updatedProfile = profiles.find((p: any) => p.id === currentUserId);
          if (updatedProfile) {
            // Get roles from userRoles relation
            const roles = updatedProfile.userRoles?.map((ur: any) => ur.role) || [];
            
            const user = {
              id: updatedProfile.id,
              email: updatedProfile.email,
              firstName: updatedProfile.firstName || '',
              lastName: updatedProfile.lastName || '',
              department: updatedProfile.department || '',
              roles: roles
            };
            
            console.log('refreshAuth: Updated user from backend:', user);
            setAuthState({
              user,
              isAuthenticated: true,
              loading: false,
            });
            return;
          }
        }
      } catch (backendError) {
        console.log('refreshAuth: Could not fetch from backend, using token:', backendError);
        // Fallback to token decode
      }

      // Fallback: Decode JWT token
      const decodeBase64 = (str: string): string => {
        try {
          const decoded = atob(str);
          return decodeURIComponent(
            decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
          );
        } catch (e) {
          return atob(str);
        }
      };

      if (token.includes('.')) {
        const base64Payload = token.split('.')[1];
        const normalizedPayload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = normalizedPayload + '='.repeat((4 - normalizedPayload.length % 4) % 4);
        
        const decodedPayload = decodeBase64(paddedPayload);
        const payload = JSON.parse(decodedPayload);
        
        const user = {
          id: payload.id,
          email: payload.email,
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          department: payload.department || '',
          roles: payload.roles || []
        };
        
        console.log('refreshAuth: Updated user from token:', user);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        const decodedToken = decodeBase64(token);
        const user = JSON.parse(decodedToken);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error) {
      console.error('refreshAuth: Error refreshing auth:', error);
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('refreshAuth: Token decode failed, keeping current state');
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    }
  }, [authState.user]);

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
    refreshAuth,
  };
};