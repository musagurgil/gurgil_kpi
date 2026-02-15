import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { FileText } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--kpi-success))', 'hsl(var(--kpi-warning))', 'hsl(var(--kpi-danger))', 'hsl(var(--accent))'];

interface CategoryStats {
    name: string;
    value: number;
}

interface CategoryDistributionProps {
    categoryStats: CategoryStats[];
    totalHours: number;
}

export function CategoryDistribution({ categoryStats, totalHours }: CategoryDistributionProps) {
    // We can render just the chart here, or both chart and table.
    // Let's create two separate exports or one combined if they are always used together.
    // Based on the original design, they were separate cards. Let's keep the chart here.

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Çalışma Kategorileri
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} saat`} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function CategoryDetailedTable({ categoryStats, totalHours }: CategoryDistributionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Kategori Bazlı Detaylar</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {categoryStats.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <span className="font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="font-bold">{cat.value} saat</p>
                                    <p className="text-xs text-muted-foreground">Toplam Süre</p>
                                </div>
                                <div className="text-right w-16">
                                    <Badge variant="outline">
                                        {totalHours > 0 ? ((cat.value / totalHours) * 100).toFixed(1) : 0}%
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                    {categoryStats.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Seçilen tarih aralığında veri bulunamadı.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
