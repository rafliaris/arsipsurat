import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { suratMasukService } from "@/services/suratMasukService"
import { kategoriService } from "@/services/kategoriService"
import { type SuratMasuk } from "../types"
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

export default function SuratMasukEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<SuratMasuk | null>(null)
    const [kategoris, setKategoris] = useState<Kategori[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [pengirim, setPengirim] = useState("")
    const [perihal, setPerihal] = useState("")
    const [tanggalSurat, setTanggalSurat] = useState("")
    const [tanggalTerima, setTanggalTerima] = useState("")
    const [kategoriId, setKategoriId] = useState("")
    const [noSurat, setNoSurat] = useState("")

    useEffect(() => {
        const fetchAll = async () => {
            if (!id) return
            try {
                const [surat, cats] = await Promise.all([
                    suratMasukService.getById(Number(id)),
                    kategoriService.getAll({ is_active: true }),
                ])
                setData(surat)
                setKategoris(cats)
                // Pre-fill form
                setPengirim(surat.pengirim)
                setPerihal(surat.perihal)
                setTanggalSurat(surat.tanggal_surat)
                setTanggalTerima(surat.tanggal_terima)
                setKategoriId(surat.kategori_id ? String(surat.kategori_id) : "")
                setNoSurat(surat.nomor_surat)
            } catch {
                toast.error("Gagal memuat data surat masuk")
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
            await suratMasukService.update(Number(id), {
                pengirim,
                perihal,
                tanggal_surat: tanggalSurat,
                nomor_surat: noSurat,
                kategori_id: kategoriId ? Number(kategoriId) : undefined,
            })
            toast.success("Surat masuk berhasil diperbarui")
            navigate(`/surat-masuk/${id}`)
        } catch {
            toast.error("Gagal memperbarui surat masuk")
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return (
        <DashboardLayout>
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </DashboardLayout>
    )

    if (!data) return <DashboardLayout><div className="text-center py-8 text-muted-foreground">Surat tidak ditemukan</div></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/surat-masuk/${id}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Surat Masuk</h2>
                        <p className="text-muted-foreground">{data.nomor_surat}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nomor Surat</Label>
                        <Input value={noSurat} onChange={e => setNoSurat(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Pengirim</Label>
                        <Input value={pengirim} onChange={e => setPengirim(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal Surat</Label>
                        <Input type="date" value={tanggalSurat} onChange={e => setTanggalSurat(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal Diterima</Label>
                        <Input type="date" value={tanggalTerima} onChange={e => setTanggalTerima(e.target.value)} />
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
                </div>

                <div className="space-y-2">
                    <Label>Perihal</Label>
                    <Textarea rows={4} value={perihal} onChange={e => setPerihal(e.target.value)} />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => navigate(`/surat-masuk/${id}`)}>Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
