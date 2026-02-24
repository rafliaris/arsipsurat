import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { StatsCards } from "@/features/dashboard/components/StatsCards"
import { OverviewChart } from "@/features/dashboard/components/OverviewChart"
import { RecentActivity } from "@/features/dashboard/components/RecentActivity"
import { DisposisiStatsCards } from "@/features/dashboard/components/DisposisiStatsCards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { dashboardService } from "@/services/dashboardService"
import type { DashboardStats, RecentActivity as RecentActivityType, TrendChartData } from "@/features/dashboard/types"
import { toast } from "sonner"

export default function DashboardPage() {
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>()
    const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([])
    const [trendData, setTrendData] = useState<TrendChartData[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all dashboard data in parallel
                const [statsData, activityData, trendData] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentActivity(5),
                    dashboardService.getTrend(6),
                ]);

                setStats(statsData);
                setRecentActivity(activityData);

                // trendData already has { label, masuk, keluar } from backend
                const transformedData: TrendChartData[] = trendData.map(item => ({
                    name: item.label,
                    Masuk: item.masuk,
                    Keluar: item.keluar,
                }));
                setTrendData(transformedData);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error("Gagal memuat data dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [location]);

    return (
        <DashboardLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
            </div>

            <StatsCards loading={loading} stats={stats} />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Statistik Disposisi</h2>
            </div>
            <DisposisiStatsCards loading={loading} stats={stats} />

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Trend Surat</CardTitle>
                        <CardDescription>
                            Grafik surat masuk vs surat keluar 6 bulan terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart loading={loading} data={trendData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                        <CardDescription>
                            Log aktivitas pengguna sistem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity loading={loading} activities={recentActivity} />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
