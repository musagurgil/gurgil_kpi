import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'department_manager' | 'employee';
  requiredDepartment?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredDepartment 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, canAccessDepartment, loading } = useAuth();

  console.log('ProtectedRoute:', { isAuthenticated, loading, requiredRole, requiredDepartment });

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check role permission
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Yetkisiz Erişim</h1>
          <p className="text-muted-foreground">
            Bu sayfaya erişmek için gerekli yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  // Check department access
  if (requiredDepartment && !canAccessDepartment(requiredDepartment)) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Departman Erişimi</h1>
          <p className="text-muted-foreground">
            Bu departmanın verilerine erişim yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}