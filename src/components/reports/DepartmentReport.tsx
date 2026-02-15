import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { KPIStats } from "@/types/kpi";

interface DepartmentReportProps {
    kpiStats: KPIStats[];
    isAdmin: boolean;
    userDepartment: string;
}

export function DepartmentReport({ kpiStats, isAdmin, userDepartment }: DepartmentReportProps) {
    // Calculate department performance from actual KPI data
    const departmentPerformanceMap = new Map<string, {
        name: string;
        totalKPIs: number;
        completedKPIs: number;
        totalProgress: number;
    }>();

    kpiStats.forEach(kpi => {
        // Filter based on user role
        if (!isAdmin && kpi.department !== userDepartment) {
            return; // Skip departments not matching user's department
        }

        if (!departmentPerformanceMap.has(kpi.department)) {
            departmentPerformanceMap.set(kpi.department, {
                name: kpi.department,
                totalKPIs: 0,
                completedKPIs: 0,
                totalProgress: 0
            });
        }

        const dept = departmentPerformanceMap.get(kpi.department)!;
        dept.totalKPIs++;
        if (kpi.status === 'success' || kpi.progressPercentage >= 100) {
            dept.completedKPIs++;
        }
        dept.totalProgress += kpi.progressPercentage;
    });

    // Convert to array and calculate performance percentage
    const departmentPerformance = Array.from(departmentPerformanceMap.values())
        .map(dept => {
            const performance = dept.totalKPIs > 0
                ? Math.round(dept.totalProgress / dept.totalKPIs)
                : 0;

            // Calculate change (mock for now, can be enhanced with historical data)
            const change = performance > 80 ? 10 : performance > 60 ? 5 : -5;
            const changeType: 'increase' | 'decrease' = change >= 0 ? 'increase' : 'decrease';

            return {
                name: dept.name,
                performance,
                change,
                target: 100,
                completedKPIs: dept.completedKPIs,
                kpiCount: dept.totalKPIs,
                changeType
            };
        })
        .sort((a, b) => b.performance - a.performance);

    if (!departmentPerformance || departmentPerformance.length === 0) {
        return (
            <Card className="shadow-card mt-6">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {isAdmin ? 'Departman Performans Raporu' : `${userDepartment} Performans Raporu`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Veri bulunamadı.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-card mt-6">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {isAdmin ? 'Departman Performans Raporu' : `${userDepartment} Performans Raporu`}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {departmentPerformance.map((dept) => (
                    <div key={dept.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <h4 className="font-medium text-foreground">{dept.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                    {dept.completedKPIs}/{dept.kpiCount} KPI Tamamlandı
                                </Badge>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <span className="text-2xl font-bold">%{dept.performance}</span>
                                    <p className="text-xs text-muted-foreground">Genel Başarı</p>
                                </div>
                                <div className={`p-2 rounded-full ${dept.changeType === 'increase' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {dept.changeType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                                        İlerleme
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-primary">
                                        {dept.performance}%
                                    </span>
                                </div>
                            </div>
                            <Progress value={(dept.performance / dept.target) * 100} className="h-2" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
