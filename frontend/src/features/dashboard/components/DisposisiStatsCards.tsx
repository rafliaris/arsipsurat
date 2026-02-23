import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Zap, AlertCircle, FileText, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStats } from "@/features/dashboard/types"

interface DisposisiStatsCardsProps {
    loading?: boolean;
    stats?: DashboardStats;
}

export function DisposisiStatsCards({ loading, stats }: DisposisiStatsCardsProps) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-3 w-[120px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!stats) {
        return null;
    }

    // For now, we'll show pending and completed dispositions
    // In the future, this could be expanded based on available API data
    const disposisiData = [
        {
            name: 'Pending',
            value: stats.disposisi_pending,
            icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
            color: "text-orange-600"
        },
        {
            name: 'Selesai',
            value: stats.disposisi_selesai,
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            color: "text-green-600"
        },
        {
            name: 'Notifikasi',
            value: stats.notifikasi_unread,
            icon: <Zap className="h-4 w-4 text-blue-500" />,
            color: "text-blue-600"
        },
        {
            name: 'Kategori',
            value: stats.total_kategori,
            icon: <FileText className="h-4 w-4 text-purple-500" />,
            color: "text-purple-600"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {disposisiData.map((stat) => (
                <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.name}
                        </CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.name} saat ini
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
