import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ActivityTrend {
    date: string;
    hours: number;
    rawDate: string;
}

interface DailyTrendChartProps {
    activityTrend: ActivityTrend[];
    dateRangeLabel: string;
}

export function DailyTrendChart({ activityTrend, dateRangeLabel }: DailyTrendChartProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Günlük Çalışma Trendi ({dateRangeLabel})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} saat`} />
                        <Legend />
                        <Bar dataKey="hours" name="Çalışma Saati" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
