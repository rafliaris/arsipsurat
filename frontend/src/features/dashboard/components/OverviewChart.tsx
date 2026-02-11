import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { mockTrendData } from '@/services/mockDashboardService';

import { Skeleton } from '@/components/ui/skeleton';

export function OverviewChart({ loading }: { loading?: boolean }) {
    if (loading) {
        return <Skeleton className="w-full h-[350px]" />
    }
    const data = mockTrendData;
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
