import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratKeluarDetail } from "../components/SuratKeluarDetail"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { suratKeluarService } from "@/services/suratKeluarService"
import { type SuratKeluar } from "../types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function SuratKeluarDetailPage() {
    const { id } = useParams()
    const [data, setData] = useState<SuratKeluar | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const result = await suratKeluarService.getById(Number(id))
                    setData(result)
                } catch (error) {
                    console.error("Failed to fetch surat keluar detail:", error)
                    toast.error("Gagal memuat detail surat keluar")
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchData()
    }, [id])

    if (loading) return (
        <DashboardLayout>
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-64 w-full" />
            </div>
        </DashboardLayout>
    )
    if (!data) return <DashboardLayout><div className="text-center py-8 text-muted-foreground">Surat tidak ditemukan</div></DashboardLayout>

    return (
        <DashboardLayout>
            <SuratKeluarDetail data={data} />
        </DashboardLayout>
    )
}
