import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminFilters } from '@/components/admin/AdminFilters';
import { EmployeePerformanceTable } from '@/components/admin/EmployeePerformanceTable';
import { DepartmentAnalytics } from '@/components/admin/DepartmentAnalytics';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { BackupManagement } from '@/components/admin/BackupManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Building2, Tags, Database } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex-1 bg-dashboard-bg min-h-screen">
        {/* Premium Gradient Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 px-4 sm:px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNnptMCAxMmMzLjMxIDAgNi0yLjY5IDYtNnMtMi42OS02LTYtNi02IDIuNjktNiA2IDIuNjkgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Yönetici Paneli
                </h1>
                <p className="text-sm text-white/70 mt-0.5">
                  Çalışan performansını, departman analitiklerini ve sistem ayarlarını yönetin
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            {/* Floating Tab Bar */}
            <div className="bg-card/95 backdrop-blur-md shadow-lg rounded-xl border border-border/50 p-1.5">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent h-auto gap-1">
                <TabsTrigger
                  value="employees"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Çalışan Performansı</span>
                  <span className="sm:hidden">Çalışanlar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="departments"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-sm font-medium"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Departman Analizi</span>
                  <span className="sm:hidden">Departmanlar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-sm font-medium"
                >
                  <Tags className="w-4 h-4" />
                  <span className="hidden sm:inline">Kategori Yönetimi</span>
                  <span className="sm:hidden">Kategoriler</span>
                </TabsTrigger>
                <TabsTrigger
                  value="backup"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-sm font-medium"
                >
                  <Database className="w-4 h-4" />
                  Yedekleme
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Filters — only for data tabs */}
            {(activeTab === 'employees' || activeTab === 'departments') && (
              <AdminFilters />
            )}

            <TabsContent value="employees" className="space-y-5 mt-0">
              <EmployeePerformanceTable />
            </TabsContent>

            <TabsContent value="departments" className="space-y-5 mt-0">
              <DepartmentAnalytics />
            </TabsContent>

            <TabsContent value="categories" className="space-y-5 mt-0">
              <CategoryManagement />
            </TabsContent>

            <TabsContent value="backup" className="space-y-5 mt-0">
              <BackupManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;