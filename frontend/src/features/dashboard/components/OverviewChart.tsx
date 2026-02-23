import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { TrendChartData } from '@/features/dashboard/types';

interface OverviewChartProps {
    loading?: boolean;
    data?: TrendChartData[];
}

export function OverviewChart({ loading, data }: OverviewChartProps) {
    if (loading) {
        return <Skeleton className="w-full h-[350px]" />
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Masuk" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Keluar" stroke="#10b981" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    )
}
