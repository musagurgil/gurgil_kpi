import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { Users, Clock, TrendingUp } from 'lucide-react';

export const EmployeePerformanceTable = () => {
  const { profiles, loading, error } = useAdmin();
  
  // Mock employee stats data
  const getEmployeeStats = () => [
    {
      userId: '1',
      name: 'Admin User',
      department: 'Yönetim',
      kpiCount: 5,
      completedKPIs: 3,
      performance: 85,
      lastActivity: '2025-10-08T10:00:00Z',
      totalHours: 40,
      categoryDistribution: {
        'meeting': 15,
        'project': 20,
        'training': 5
      },
      averageDailyHours: 8.0,
      entryCount: 5
    },
    {
      userId: '2',
      name: 'Manager User',
      department: 'Satış',
      kpiCount: 8,
      completedKPIs: 6,
      performance: 92,
      lastActivity: '2025-10-08T11:00:00Z',
      totalHours: 45,
      categoryDistribution: {
        'meeting': 10,
        'project': 25,
        'administrative': 10
      },
      averageDailyHours: 9.0,
      entryCount: 8
    },
    {
      userId: '3',
      name: 'Employee User',
      department: 'IT',
      kpiCount: 3,
      completedKPIs: 2,
      performance: 78,
      lastActivity: '2025-10-08T09:30:00Z',
      totalHours: 35,
      categoryDistribution: {
        'project': 20,
        'training': 10,
        'administrative': 5
      },
      averageDailyHours: 7.0,
      entryCount: 3
    }
  ];
  
  const categories = [
    { id: 'meeting', name: 'Toplantı', color: 'hsl(217, 91%, 60%)' },
    { id: 'project', name: 'Proje', color: 'hsl(142, 71%, 45%)' },
    { id: 'training', name: 'Eğitim', color: 'hsl(38, 92%, 50%)' },
    { id: 'administrative', name: 'İdari', color: 'hsl(262, 83%, 58%)' }
  ];
  
  const employeeStats = getEmployeeStats();

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

  const getTopCategory = (categoryDistribution: { [categoryId: string]: number } | null | undefined) => {
    if (!categoryDistribution || Object.keys(categoryDistribution).length === 0) return null;
    
    const topCategoryId = Object.entries(categoryDistribution)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    return (categories || []).find(cat => cat.id === topCategoryId);
  };

  const maxHours = employeeStats && employeeStats.length > 0 
    ? Math.max(...employeeStats.map(emp => emp.totalHours || 0), 1)
    : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Çalışan Performans Tablosu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!employeeStats || employeeStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Seçilen kriterlere göre veri bulunamadı
          </div>
        ) : (
          <div className="space-y-4">
            {employeeStats.map(employee => {
              const topCategory = getTopCategory(employee.categoryDistribution || {});
              const performancePercentage = ((employee.totalHours || 0) / maxHours) * 100;
              
              return (
                <div key={employee.userId || Math.random()} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{employee.name || 'İsimsiz'}</h4>
                      <p className="text-sm text-muted-foreground">{employee.department || 'Departman Yok'}</p>
                    </div>
                    {topCategory && (
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: topCategory.color || '#ccc', 
                          color: topCategory.color || '#ccc' 
                        }}
                      >
                        En Çok: {topCategory.name || 'Kategori'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Toplam:</span>
                      <span className="font-medium text-foreground">
                        {(employee.totalHours || 0).toFixed(1)}h
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-muted-foreground">Ortalama:</span>
                      <span className="font-medium text-foreground">
                        {(employee.averageDailyHours || 0).toFixed(1)}h/gün
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-warning" />
                      <span className="text-sm text-muted-foreground">Giriş:</span>
                      <span className="font-medium text-foreground">
                        {employee.entryCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Performans</span>
                      <span className="text-sm font-medium text-foreground">
                        {(performancePercentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={performancePercentage || 0} className="h-2" />
                  </div>

                  {/* Category breakdown */}
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Kategori Dağılımı:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(categories || []).map(category => {
                        const hours = (employee.categoryDistribution || {})[category.id] || 0;
                        if (hours === 0) return null;
                        
                        return (
                          <div key={category.id || Math.random()} className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: category.color || '#ccc' }}
                            />
                            <span className="text-xs text-muted-foreground truncate">
                              {category.name || 'Kategori'}: {hours.toFixed(1)}h
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};