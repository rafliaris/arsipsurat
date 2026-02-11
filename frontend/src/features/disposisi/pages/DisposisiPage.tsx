import { useEffect, useState } from "react"
import { type Disposisi } from "../types"
import { mockDisposisiService } from "@/services/mockDisposisiService"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableSkeleton } from "@/components/shared/TableSkeleton"

export default function DisposisiPage() {
    const [list, setList] = useState<Disposisi[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDisposisi = async () => {
            try {
                const data = await mockDisposisiService.getAll()
                setList(data)
            } finally {
                setLoading(false)
            }
        }
        fetchDisposisi()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Disposisi Masuk</h2>
                    <p className="text-muted-foreground">
                        Daftar disposisi yang perlu ditindaklanjuti.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Disposisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <TableSkeleton columns={5} /> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dari</TableHead>
                                        <TableHead>Instruksi</TableHead>
                                        <TableHead>Sifat</TableHead>
                                        <TableHead>Batas Waktu</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                Belum ada disposisi masuk.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        list.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.dari}</TableCell>
                                                <TableCell className="max-w-md truncate" title={item.instruksi}>
                                                    {item.instruksi}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        item.sifat === 'Segera' ? 'destructive' :
                                                            item.sifat === 'Penting' ? 'default' : 'secondary'
                                                    }>
                                                        {item.sifat}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(item.batas_waktu), "dd MMM yyyy", { locale: id })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
