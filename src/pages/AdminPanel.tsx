import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminFilters } from '@/components/admin/AdminFilters';
import { EmployeePerformanceTable } from '@/components/admin/EmployeePerformanceTable';
import { DepartmentAnalytics } from '@/components/admin/DepartmentAnalytics';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Building2, Tags } from 'lucide-react';
const AdminPanel = () => {

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex-1 bg-dashboard-bg min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Yönetici Paneli
              </h1>
              <p className="text-muted-foreground mt-1">
                Çalışan performansını ve departman analitiklerini görüntüleyin
              </p>
            </div>
          </div>

          <AdminFilters />

          <Tabs defaultValue="employees" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Çalışan Performansı
              </TabsTrigger>
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Departman Analizi
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Tags className="w-4 h-4" />
                Kategori Yönetimi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-6">
              <EmployeePerformanceTable />
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <DepartmentAnalytics />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <CategoryManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;