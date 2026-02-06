import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TicketDepartmentBarChartProps {
    data: { name: string; value: number }[];
}

export function TicketDepartmentBarChart({ data }: TicketDepartmentBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Departman Bazlı Ticketlar</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Henüz veri yok
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Departman Bazlı Ticketlar</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
