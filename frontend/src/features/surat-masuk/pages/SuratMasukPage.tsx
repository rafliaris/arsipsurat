import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratMasukTable } from "../components/SuratMasukTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { type SuratMasuk } from "../types"
import { mockSuratMasukService } from "@/services/mockSuratMasukService"
import { useNavigate } from "react-router-dom"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { type DateRange } from "react-day-picker"
import { TableSkeleton } from "@/components/shared/TableSkeleton"

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

    const [date, setDate] = useState<DateRange | undefined>()

    const filteredData = data.filter((item) => {
        if (!date?.from) return true
        const itemDate = new Date(item.tanggal_terima)
        const from = date.from
        const to = date.to || date.from

        // Reset hours to compare dates only
        itemDate.setHours(0, 0, 0, 0)
        from.setHours(0, 0, 0, 0)
        to.setHours(0, 0, 0, 0)

        return itemDate >= from && itemDate <= to
    })

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
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Button onClick={() => navigate("/surat-masuk/create")}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Surat
                    </Button>
                </div>
            </div>
            <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                {loading ? (
                    <TableSkeleton columns={6} />
                ) : (
                    <SuratMasukTable data={filteredData} onView={(id) => navigate(`/surat-masuk/${id}`)} />
                )}
            </div>
        </DashboardLayout>
    )
}
