import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratKeluarDetail } from "../components/SuratKeluarDetail"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { mockSuratKeluarService } from "@/services/mockSuratKeluarService"
import { type SuratKeluar } from "../types"

export default function SuratKeluarDetailPage() {
    const { id } = useParams()
    const [data, setData] = useState<SuratKeluar | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const result = await mockSuratKeluarService.getById(id)
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
            <SuratKeluarDetail data={data} />
        </DashboardLayout>
    )
}
