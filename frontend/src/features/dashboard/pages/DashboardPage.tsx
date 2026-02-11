import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { StatsCards } from "@/features/dashboard/components/StatsCards"
import { OverviewChart } from "@/features/dashboard/components/OverviewChart"
import { RecentActivity } from "@/features/dashboard/components/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
            </div>

            <StatsCards />

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Trend Surat</CardTitle>
                        <CardDescription>
                            Grafik surat masuk vs surat keluar 6 bulan terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
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
                        <RecentActivity />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
