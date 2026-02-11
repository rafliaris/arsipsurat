import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratMasukTable } from "../components/SuratMasukTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { type SuratMasuk } from "../types"
import { mockSuratMasukService } from "@/services/mockSuratMasukService"
import { useNavigate } from "react-router-dom"

export default function SuratMasukPage() {
    const [data, setData] = useState<SuratMasuk[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await mockSuratMasukService.getAll()
                setData(result)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Surat Masuk</h2>
                    <p className="text-muted-foreground">
                        Daftar surat masuk yang telah terdaftar dalam sistem.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => navigate("/surat-masuk/create")}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Surat
                    </Button>
                </div>
            </div>
            <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <SuratMasukTable data={data} onView={(id) => navigate(`/surat-masuk/${id}`)} />
                )}
            </div>
        </DashboardLayout>
    )
}
