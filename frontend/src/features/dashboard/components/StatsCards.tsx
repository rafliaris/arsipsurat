import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Mail, Send, Clock, CheckCircle } from "lucide-react"
import { mockDashboardStats } from "@/services/mockDashboardService"

export function StatsCards() {
    const stats = mockDashboardStats;

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Surat Masuk
                    </CardTitle>
                    <InboxIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.surat_masuk_count}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.surat_masuk_change} dari bulan lalu
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Surat Keluar
                    </CardTitle>
                    <SendIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.surat_keluar_count}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.surat_keluar_change} dari bulan lalu
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Klasifikasi</CardTitle>
                    <ClockIcon className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.pending_classification}</div>
                    <p className="text-xs text-muted-foreground">
                        Perlu review segera
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Selesai Hari Ini
                    </CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.completed_today}</div>
                    <p className="text-xs text-muted-foreground">
                        +15% produktivitas
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

function InboxIcon(props: any) {
    return (
        <Mail {...props} />
    )
}

function SendIcon(props: any) {
    return (
        <Send {...props} />
    )
}

function ClockIcon(props: any) {
    return (
        <Clock {...props} />
    )
}

function CheckCircleIcon(props: any) {
    return (
        <CheckCircle {...props} />
    )
}
