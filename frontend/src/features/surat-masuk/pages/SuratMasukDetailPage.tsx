import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratMasukDetail } from "../components/SuratMasukDetail"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { mockSuratMasukService } from "@/services/mockSuratMasukService"
import { type SuratMasuk } from "../types"

export default function SuratMasukDetailPage() {
    const { id } = useParams()
    const [data, setData] = useState<SuratMasuk | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const result = await mockSuratMasukService.getById(id)
                    setData(result || null)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div>Loading...</div>
    if (!data) return <div>Surat tidak ditemukan</div>

    return (
        <DashboardLayout>
            <SuratMasukDetail data={data} />
        </DashboardLayout>
    )
}
