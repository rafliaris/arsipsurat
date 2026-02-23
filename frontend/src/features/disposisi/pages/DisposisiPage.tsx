import { useEffect, useState, useCallback } from "react"
import { type Disposisi } from "../types"
import { disposisiService } from "@/services/disposisiService"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { DisposisiTable } from "../components/DisposisiTable"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { type DateRange } from "react-day-picker"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { toast } from "sonner"

export default function DisposisiPage() {
    const [list, setList] = useState<Disposisi[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDisposisi = useCallback(async () => {
        try {
            setLoading(true)
            const data = await disposisiService.getAll()
            setList(data)
        } catch (error) {
            console.error("Failed to fetch disposisi:", error)
            toast.error("Gagal memuat data disposisi")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDisposisi()
    }, [fetchDisposisi])

    const [date, setDate] = useState<DateRange | undefined>()

    const filteredData = list.filter((item) => {
        if (!date?.from) return true
        const itemDate = new Date(item.deadline ?? item.created_at)
        const from = date.from
        const to = date.to || date.from

        itemDate.setHours(0, 0, 0, 0)
        from.setHours(0, 0, 0, 0)
        to.setHours(0, 0, 0, 0)

        return itemDate >= from && itemDate <= to
    })

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Disposisi Masuk</h2>
                    <p className="text-muted-foreground">
                        Daftar disposisi yang perlu ditindaklanjuti.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>
            </div>

            <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                {loading ? (
                    <TableSkeleton columns={5} />
                ) : (
                    <DisposisiTable data={filteredData} onRefresh={fetchDisposisi} />
                )}
            </div>
        </DashboardLayout>
    )
}
