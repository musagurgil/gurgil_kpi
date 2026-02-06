import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { Building2, Users, Clock, BarChart3 } from 'lucide-react';

export const DepartmentAnalytics = () => {
  const { profiles, loading, error } = useAdmin();
  
  // Mock department stats data
  const getDepartmentStats = () => [
    {
      id: '1',
      name: 'Satış',
      department: 'Satış',
      employeeCount: 12,
      totalEmployees: 12,
      kpiCount: 8,
      completedKPIs: 6,
      performance: 85,
      avgResponseTime: '2.5 saat',
      totalHours: 120,
      averageHours: 10.0,
      categoryDistribution: {
        'meeting': 20,
        'project': 60,
        'training': 15,
        'administrative': 25
      }
    },
    {
      id: '2',
      name: 'IT',
      department: 'IT',
      employeeCount: 8,
      totalEmployees: 8,
      kpiCount: 5,
      completedKPIs: 4,
      performance: 92,
      avgResponseTime: '1.2 saat',
      totalHours: 100,
      averageHours: 12.5,
      categoryDistribution: {
        'project': 70,
        'training': 20,
        'administrative': 10
      }
    },
    {
      id: '3',
      name: 'Pazarlama',
      department: 'Pazarlama',
      employeeCount: 6,
      totalEmployees: 6,
      kpiCount: 4,
      completedKPIs: 3,
      performance: 78,
      avgResponseTime: '3.1 saat',
      totalHours: 80,
      averageHours: 13.3,
      categoryDistribution: {
        'meeting': 25,
        'project': 40,
        'training': 10,
        'administrative': 5
      }
    },
    {
      id: '4',
      name: 'İnsan Kaynakları',
      department: 'İnsan Kaynakları',
      employeeCount: 4,
      totalEmployees: 4,
      kpiCount: 3,
      completedKPIs: 2,
      performance: 88,
      avgResponseTime: '1.8 saat',
      totalHours: 60,
      averageHours: 15.0,
      categoryDistribution: {
        'meeting': 15,
        'project': 20,
        'training': 15,
        'administrative': 10
      }
    }
  ];
  
  const departmentStats = getDepartmentStats();

  // Categories for department analytics
  const categories = [
    { id: 'meeting', name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
    { id: 'project', name: 'Proje', color: 'hsl(142, 71%, 45%)' },
    { id: 'training', name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
    { id: 'administrative', name: 'İdari', color: 'hsl(262, 83%, 58%)' }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Hata: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxHours = departmentStats && departmentStats.length > 0 
    ? Math.max(...departmentStats.map(dept => dept.totalHours || 0), 1)
    : 1;
  const totalEmployees = (departmentStats || []).reduce((sum, dept) => sum + (dept.totalEmployees || 0), 0);
  const totalHours = (departmentStats || []).reduce((sum, dept) => sum + (dept.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Departman</p>
                <p className="text-2xl font-bold text-foreground">
                  {departmentStats.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Çalışan</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEmployees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Saat</p>
                <p className="text-2xl font-bold text-foreground">
                  {(totalHours || 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Departman Analizi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {departmentStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Seçilen kriterlere göre departman verisi bulunamadı
            </div>
          ) : (
            (departmentStats || []).map(department => {
              const performancePercentage = ((department.totalHours || 0) / maxHours) * 100;
              const totalCategoryHours = Object.values(department.categoryDistribution || {})
                .reduce((sum, hours) => sum + (hours || 0), 0);

              return (
                <div key={department.department} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-foreground">
                      {department.department}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{department.totalEmployees} çalışan</span>
                      <span>{(department.totalHours || 0).toFixed(1)}h toplam</span>
                      <span>{(department.averageHours || 0).toFixed(1)}h ortalama</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Departman Performansı</span>
                      <span className="text-sm font-medium text-foreground">
                        {(performancePercentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={performancePercentage} className="h-3" />
                  </div>

                  {/* Category Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-foreground">Kategori Dağılımı</h5>
                      {categories.map(category => {
                        const hours = department.categoryDistribution[category.id] || 0;
                        const percentage = totalCategoryHours > 0 ? (hours / totalCategoryHours) * 100 : 0;
                        
                        if (hours === 0) return null;

                        return (
                          <div key={category.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm text-foreground">
                                  {category.name}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(hours || 0).toFixed(1)}h ({(percentage || 0).toFixed(1)}%)
                              </div>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2"
                              style={{
                                '--progress-foreground': category.color
                              } as React.CSSProperties}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-foreground">Performans Metrikleri</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Çalışan Başına Ortalama:</span>
                          <span className="font-medium text-foreground">
                            {(department.averageHours || 0).toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Toplam Aktivite Saati:</span>
                          <span className="font-medium text-foreground">
                            {(department.totalHours || 0).toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verimlilik Oranı:</span>
                          <span className="font-medium text-foreground">
                            {(performancePercentage || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};