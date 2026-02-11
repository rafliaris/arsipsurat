import { useEffect, useState } from "react"
import { type Disposisi } from "../types"
import { mockDisposisiService } from "@/services/mockDisposisiService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { User, Clock, AlertCircle } from "lucide-react"

interface DisposisiListProps {
    suratId: string;
    refreshTrigger: number;
}

export function DisposisiList({ suratId, refreshTrigger }: DisposisiListProps) {
    const [list, setList] = useState<Disposisi[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const result = await mockDisposisiService.getBySuratMasukId(suratId)
                setList(result)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [suratId, refreshTrigger])

    if (loading) return <div>Memuat riwayat disposisi...</div>

    if (list.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
                Belum ada data disposisi untuk surat ini.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {list.map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.sifat === 'Segera' ? 'bg-red-500' :
                        item.sifat === 'Penting' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {item.dari}
                                    <span className="text-muted-foreground text-sm font-normal">kepada</span>
                                    {item.tujuan}
                                </CardTitle>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(item.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                                </div>
                            </div>
                            <Badge variant={
                                item.sifat === 'Segera' ? 'destructive' :
                                    item.sifat === 'Penting' ? 'default' : 'secondary'
                            }>
                                {item.sifat}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/30 p-3 rounded-md mb-2">
                            <p className="text-sm font-medium">Instruksi:</p>
                            <p className="text-sm">{item.instruksi}</p>
                        </div>
                        {item.catatan && (
                            <p className="text-sm text-muted-foreground italic">
                                " {item.catatan} "
                            </p>
                        )}
                        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Batas Waktu: {format(new Date(item.batas_waktu), "dd MMM yyyy", { locale: id })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
