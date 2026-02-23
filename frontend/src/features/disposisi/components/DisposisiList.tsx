import { useEffect, useState } from "react"
import { type Disposisi } from "../types"
import { disposisiService } from "@/services/disposisiService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { User, Clock, AlertCircle, CheckCircle2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "outline",
    PROSES: "default",
    SELESAI: "secondary",
}

interface DisposisiListProps {
    suratId: number;
    refreshTrigger: number;
}

export function DisposisiList({ suratId, refreshTrigger }: DisposisiListProps) {
    const [list, setList] = useState<Disposisi[]>([])
    const [loading, setLoading] = useState(true)
    const [completingId, setCompletingId] = useState<number | null>(null)
    const [keterangan, setKeterangan] = useState("")
    const [completeDialog, setCompleteDialog] = useState<number | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await disposisiService.getAll({ surat_type: 'masuk' })
            // Filter for this particular surat
            setList(result.filter(d => d.surat_masuk_id === suratId))
        } catch {
            toast.error("Gagal memuat riwayat disposisi")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suratId, refreshTrigger])

    const handleComplete = async (id: number) => {
        setCompletingId(id)
        try {
            await disposisiService.complete(id, { keterangan })
            toast.success("Disposisi ditandai selesai")
            setCompleteDialog(null)
            setKeterangan("")
            fetchData()
        } catch {
            toast.error("Gagal menyelesaikan disposisi")
        } finally {
            setCompletingId(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus disposisi ini?")) return
        try {
            await disposisiService.delete(id)
            toast.success("Disposisi dihapus")
            setList(prev => prev.filter(d => d.id !== id))
        } catch {
            toast.error("Gagal menghapus disposisi")
        }
    }

    if (loading) return <div className="text-sm text-muted-foreground py-4">Memuat riwayat disposisi...</div>

    if (list.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
                Belum ada data disposisi untuk surat ini.
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {list.map((item) => (
                    <Card key={item.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'PENDING' ? 'bg-yellow-500' :
                                item.status === 'PROSES' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                        <CardHeader className="pb-2 pl-5">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        User #{item.from_user_id}
                                        <span className="text-muted-foreground text-sm font-normal">kepada</span>
                                        User #{item.to_user_id}
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(item.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={STATUS_VARIANT[item.status] ?? "outline"}>
                                        {item.status}
                                    </Badge>
                                    {item.status !== 'SELESAI' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-green-600"
                                            onClick={() => setCompleteDialog(item.id)}
                                            title="Tandai selesai"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => handleDelete(item.id)}
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-5">
                            <div className="bg-muted/30 p-3 rounded-md mb-2">
                                <p className="text-sm font-medium">Instruksi:</p>
                                <p className="text-sm">{item.instruksi}</p>
                            </div>
                            {item.keterangan && (
                                <p className="text-sm text-muted-foreground italic">{item.keterangan}</p>
                            )}
                            {item.deadline && (
                                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Batas Waktu: {format(new Date(item.deadline), "dd MMM yyyy", { locale: id })}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Complete Dialog */}
            <Dialog open={completeDialog !== null} onOpenChange={() => setCompleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tandai Disposisi Selesai</DialogTitle>
                        <DialogDescription>Tambahkan keterangan penyelesaian (opsional).</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Keterangan penyelesaian..."
                        value={keterangan}
                        onChange={e => setKeterangan(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompleteDialog(null)}>Batal</Button>
                        <Button
                            onClick={() => completeDialog && handleComplete(completeDialog)}
                            disabled={completingId !== null}
                        >
                            {completingId !== null ? "Menyimpan..." : "Konfirmasi Selesai"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
