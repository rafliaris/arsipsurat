import { type SuratMasuk } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Calendar, User, Tag, Trash2, Edit, ScanLine, Printer } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DisposisiList } from "@/features/disposisi/components/DisposisiList"
import { DisposisiForm } from "@/features/disposisi/components/DisposisiForm"
import { useState, useRef, useEffect } from "react"
import { useReactToPrint } from "react-to-print"
import { DisposisiPrint } from "@/features/disposisi/components/DisposisiPrint"
import { suratMasukService } from "@/services/suratMasukService"
import { toast } from "sonner"

export function SuratMasukDetail({ data, onDeleted }: { data: SuratMasuk; onDeleted?: () => void }) {
    const navigate = useNavigate()
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isOcr, setIsOcr] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [fileLoading, setFileLoading] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null)

    // Load the file as a blob URL so the iframe can display it (auth header required)
    useEffect(() => {
        if (!data.file_path) return
        let revoked = false
        setFileLoading(true)
        setFileError(null)
        suratMasukService.downloadFile(data.id)
            .then(url => { if (!revoked) setFileUrl(url) })
            .catch(() => { if (!revoked) setFileError("Gagal memuat dokumen") })
            .finally(() => { if (!revoked) setFileLoading(false) })
        return () => {
            revoked = true
            // Revoke blob URL when component unmounts or data changes
            setFileUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
        }
    }, [data.id, data.file_path])

    const handleDisposisiSuccess = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    const handleDelete = async () => {
        if (!confirm(`Hapus surat "${data.nomor_surat}"? Tindakan ini tidak dapat dibatalkan.`)) return
        setIsDeleting(true)
        try {
            await suratMasukService.delete(data.id)
            toast.success("Surat masuk berhasil dihapus")
            if (onDeleted) onDeleted()
            else navigate("/surat-masuk")
        } catch {
            toast.error("Gagal menghapus surat masuk")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDownload = async () => {
        try {
            const url = await suratMasukService.downloadFile(data.id)
            const a = document.createElement("a")
            a.href = url
            a.download = `surat-masuk-${data.nomor_surat}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            toast.error("Gagal mengunduh file surat")
        }
    }

    const handleOcr = async () => {
        setIsOcr(true)
        try {
            await suratMasukService.reprocessOCR(data.id)
            toast.success("OCR berhasil diproses ulang")
        } catch {
            toast.error("Gagal memproses OCR")
        } finally {
            setIsOcr(false)
        }
    }

    const printRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Disposisi - ${data.nomor_surat}`,
    } as any)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/surat-masuk")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Detail Surat Masuk</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!data.file_path}>
                        <Download className="mr-2 h-4 w-4" /> Unduh
                    </Button>
                    {data.file_path && (
                        <Button variant="outline" size="sm" onClick={handleOcr} disabled={isOcr}>
                            <ScanLine className="mr-2 h-4 w-4" /> {isOcr ? "Proses OCR..." : "Proses Ulang OCR"}
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/surat-masuk/${data.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint && handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak Disposisi
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Menghapus..." : "Hapus"}
                    </Button>
                    <DisposisiForm suratId={data.id} suratType="masuk" onSuccess={handleDisposisiSuccess} />
                </div>
            </div>

            <div style={{ display: "none" }}>
                <DisposisiPrint ref={printRef} surat={data} />
            </div>

            <Tabs defaultValue="detail" className="w-full">
                <TabsList>
                    <TabsTrigger value="detail">Informasi Surat</TabsTrigger>
                    <TabsTrigger value="disposisi">Riwayat Disposisi</TabsTrigger>
                </TabsList>

                <TabsContent value="detail" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Metadata */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Informasi Surat</CardTitle>
                                <CardDescription>{data.nomor_surat}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <User className="h-4 w-4" /> Pengirim
                                    </span>
                                    <span className="font-medium">{data.pengirim}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Tertanggal
                                    </span>
                                    <span>{format(new Date(data.tanggal_surat), "dd MMMM yyyy", { locale: id })}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Diterima
                                    </span>
                                    <span>{format(new Date(data.tanggal_terima), "dd MMMM yyyy", { locale: id })}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Tag className="h-4 w-4" /> Kategori
                                    </span>
                                    <span>{data.kategori?.nama ?? '-'}</span>
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

                            <Card className="h-[500px] flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Dokumen Surat
                                    </CardTitle>
                                    {data.file_path && (
                                        <Button variant="outline" size="sm" onClick={handleDownload}>
                                            <Download className="mr-2 h-4 w-4" /> Unduh
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 bg-muted/20 p-0 overflow-hidden flex items-center justify-center">
                                    {data.file_path ? (
                                        fileLoading ? (
                                            <div className="text-center text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                                                <p className="text-sm">Memuat dokumen...</p>
                                            </div>
                                        ) : fileError ? (
                                            <div className="text-center text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm text-destructive">{fileError}</p>
                                            </div>
                                        ) : fileUrl ? (
                                            <iframe
                                                src={fileUrl}
                                                className="w-full h-full"
                                                title="Dokumen Surat"
                                            />
                                        ) : null
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Tidak ada dokumen yang diunggah</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="disposisi">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Disposisi</CardTitle>
                            <CardDescription>
                                Jejak rekam disposisi dan tindak lanjut surat ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DisposisiList suratId={data.id} refreshTrigger={refreshTrigger} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
