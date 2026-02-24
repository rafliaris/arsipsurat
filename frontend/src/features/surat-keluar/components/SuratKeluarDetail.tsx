import { useRef, useState, useEffect } from "react"
import { type SuratKeluar } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Calendar, User, Tag, Shield, Printer, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { useReactToPrint } from "react-to-print"
import { suratKeluarService } from "@/services/suratKeluarService"
import { settingsService } from "@/services/settingsService"
import { toast } from "sonner"

export function SuratKeluarDetail({ data, onDeleted }: { data: SuratKeluar; onDeleted?: () => void }) {
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [orgSettings, setOrgSettings] = useState<Record<string, string>>({})

    useEffect(() => {
        settingsService.getPublic()
            .then(settings => {
                const map: Record<string, string> = {}
                settings.forEach(s => { map[s.setting_key] = s.setting_value })
                setOrgSettings(map)
            })
            .catch(() => { }) // silently fail — fallback text used
    }, [])

    const org = {
        name: orgSettings.org_name ?? "—",
        unit: orgSettings.org_unit ?? "—",
        address: orgSettings.org_address ?? "—",
        jabatanTtd: orgSettings.org_jabatan_ttd ?? "Kepala Dinas",
        namaTtd: orgSettings.org_nama_ttd ?? "—",
        nipTtd: orgSettings.org_nip_ttd ?? "—",
    }

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Surat_Keluar_${data.nomor_surat_keluar.replace(/\//g, "-")}`,
    })

    const handleDelete = async () => {
        if (!confirm(`Hapus surat keluar "${data.nomor_surat_keluar}"? Tindakan ini tidak dapat dibatalkan.`)) return
        setIsDeleting(true)
        try {
            await suratKeluarService.delete(data.id)
            toast.success("Surat keluar berhasil dihapus")
            if (onDeleted) onDeleted()
            else navigate("/surat-keluar")
        } catch {
            toast.error("Gagal menghapus surat keluar")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDownload = async () => {
        try {
            const url = await suratKeluarService.downloadFile(data.id)
            const a = document.createElement("a")
            a.href = url
            a.download = `surat-keluar-${data.nomor_surat_keluar.replace(/\//g, "-")}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            toast.error("Gagal mengunduh file surat")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/surat-keluar")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Detail Surat Keluar</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!data.file_path}>
                        <Download className="mr-2 h-4 w-4" /> Unduh
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/surat-keluar/${data.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Menghapus..." : "Hapus"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Metadata */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Informasi Surat</CardTitle>
                        <CardDescription>{data.nomor_surat_keluar}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> Tujuan
                            </span>
                            <span className="font-medium">{data.penerima}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Tanggal Surat
                            </span>
                            <span>{format(new Date(data.tanggal_surat), "dd MMMM yyyy", { locale: id })}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4" /> Kategori
                            </span>
                            <span>{data.kategori?.nama}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Sifat
                            </span>
                            <span className="font-medium">{data.priority}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <div>
                                <Badge variant="outline">
                                    {data.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Content & File */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perihal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed">{data.perihal}</p>
                        </CardContent>
                    </Card>

                    {/* Preview Area (Printable) */}
                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Draft Surat
                            </CardTitle>
                            {data.file_path && (
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" /> Unduh Lampiran
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="bg-muted/10 p-8 min-h-[500px]">
                            {/* Printable Content Wrapper */}
                            <div ref={contentRef} className="bg-white p-12 shadow-sm border mx-auto max-w-[210mm] min-h-[297mm] text-black">
                                {/* Kop Surat – loaded from org settings */}
                                <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
                                    <h1 className="text-xl font-bold uppercase">{org.name}</h1>
                                    <h2 className="text-lg font-bold uppercase">{org.unit}</h2>
                                    <p className="text-sm">{org.address}</p>
                                </div>

                                {/* Header Surat */}
                                <div className="flex justify-between mb-8">
                                    <div className="w-1/2">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className="w-24">Nomor</td>
                                                    <td className="w-4">:</td>
                                                    <td>{data.nomor_surat_keluar}</td>
                                                </tr>
                                                <tr>
                                                    <td>Sifat</td>
                                                    <td>:</td>
                                                    <td>{data.priority}</td>
                                                </tr>
                                                <tr>
                                                    <td>Lampiran</td>
                                                    <td>:</td>
                                                    <td>-</td>
                                                </tr>
                                                <tr>
                                                    <td>Perihal</td>
                                                    <td>:</td>
                                                    <td>{data.perihal}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="w-1/2 text-right">
                                        <p>{org.address.split(',')[0] ?? org.address}, {format(new Date(data.tanggal_surat), "dd MMMM yyyy", { locale: id })}</p>
                                    </div>
                                </div>

                                {/* Tujuan */}
                                <div className="mb-8">
                                    <p>Yth.</p>
                                    <p className="font-bold">{data.penerima}</p>
                                    <p>di</p>
                                    <p className="pl-8">Tempat</p>
                                </div>

                                {/* Isi Surat – based on perihal, full text not stored */}
                                <div className="mb-8 text-justify leading-relaxed">
                                    <p className="mb-4">Dengan hormat,</p>
                                    <p className="mb-4">{data.perihal}</p>
                                    <p className="mb-4">
                                        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                                    </p>
                                </div>

                                {/* Tanda Tangan – loaded from org settings */}
                                <div className="flex justify-end mt-16">
                                    <div className="text-center w-64">
                                        <p className="mb-24">{org.jabatanTtd},</p>
                                        <p className="font-bold underline">{org.namaTtd}</p>
                                        <p>{org.nipTtd}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
