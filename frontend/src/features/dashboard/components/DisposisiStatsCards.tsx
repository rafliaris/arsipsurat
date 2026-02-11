import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Zap, AlertCircle, FileText, Lock } from "lucide-react"
import { mockDisposisiStats } from "@/services/mockDashboardService"
import { Skeleton } from "@/components/ui/skeleton"

export function DisposisiStatsCards({ loading }: { loading?: boolean }) {
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

    const getIcon = (name: string) => {
        switch (name) {
            case 'Segera': return <Zap className="h-4 w-4 text-red-500" />
            case 'Penting': return <AlertCircle className="h-4 w-4 text-orange-500" />
            case 'Rutin': return <FileText className="h-4 w-4 text-blue-500" />
            case 'Rahasia': return <Lock className="h-4 w-4 text-purple-500" />
            default: return <FileText className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getColor = (name: string) => {
        switch (name) {
            case 'Segera': return "text-red-600"
            case 'Penting': return "text-orange-600"
            case 'Rutin': return "text-blue-600"
            case 'Rahasia': return "text-purple-600"
            default: return "text-foreground"
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {mockDisposisiStats.map((stat) => (
                <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.name}
                        </CardTitle>
                        {getIcon(stat.name)}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getColor(stat.name)}`}>
                            {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Disposisi {stat.name}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
