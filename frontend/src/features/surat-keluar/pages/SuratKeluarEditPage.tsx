import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { suratKeluarService } from "@/services/suratKeluarService"
import { kategoriService } from "@/services/kategoriService"
import { type SuratKeluar } from "../types"
import { type Kategori } from "@/features/settings/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"

export default function SuratKeluarEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<SuratKeluar | null>(null)
    const [kategoris, setKategoris] = useState<Kategori[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [penerima, setPenerima] = useState("")
    const [perihal, setPerihal] = useState("")
    const [tanggalSurat, setTanggalSurat] = useState("")
    const [kategoriId, setKategoriId] = useState("")
    const [priority, setPriority] = useState<"rendah" | "sedang" | "tinggi" | "mendesak">("sedang")
    const [status, setStatus] = useState<"pending" | "proses" | "selesai">("pending")

    useEffect(() => {
        const fetchAll = async () => {
            if (!id) return
            try {
                const [surat, cats] = await Promise.all([
                    suratKeluarService.getById(Number(id)),
                    kategoriService.getAll({ is_active: true }),
                ])
                setData(surat)
                setKategoris(cats)
                // Pre-fill
                setPenerima(surat.penerima)
                setPerihal(surat.perihal)
                setTanggalSurat(surat.tanggal_surat)
                setKategoriId(surat.kategori_id ? String(surat.kategori_id) : "")
                setPriority(surat.priority)
                setStatus(surat.status)
            } catch {
                toast.error("Gagal memuat data surat keluar")
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [id])

    const handleSave = async () => {
        if (!id) return
        setIsSaving(true)
        try {
            await suratKeluarService.update(Number(id), {
                penerima,
                perihal,
                tanggal_surat: tanggalSurat,
                kategori_id: kategoriId ? Number(kategoriId) : undefined,
                priority,
                status,
            })
            toast.success("Surat keluar berhasil diperbarui")
            navigate(`/surat-keluar/${id}`)
        } catch {
            toast.error("Gagal memperbarui surat keluar")
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return (
        <DashboardLayout>
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
            </div>
        </DashboardLayout>
    )

    if (!data) return <DashboardLayout><div className="text-center py-8 text-muted-foreground">Surat tidak ditemukan</div></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/surat-keluar/${id}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Surat Keluar</h2>
                        <p className="text-muted-foreground">{data.nomor_surat_keluar}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Penerima / Tujuan</Label>
                        <Input value={penerima} onChange={e => setPenerima(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal Surat</Label>
                        <Input type="date" value={tanggalSurat} onChange={e => setTanggalSurat(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Select value={kategoriId} onValueChange={setKategoriId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {kategoris.map(k => (
                                    <SelectItem key={k.id} value={String(k.id)}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: k.color }} />
                                            {k.nama}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Prioritas</Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rendah">Rendah</SelectItem>
                                <SelectItem value="sedang">Sedang</SelectItem>
                                <SelectItem value="tinggi">Tinggi</SelectItem>
                                <SelectItem value="mendesak">Mendesak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="proses">Proses</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Perihal</Label>
                    <Textarea rows={4} value={perihal} onChange={e => setPerihal(e.target.value)} />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => navigate(`/surat-keluar/${id}`)}>Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
