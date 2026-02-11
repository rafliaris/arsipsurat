import { useRef } from "react"
import { type SuratKeluar } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Calendar, User, Tag, Shield, Printer } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { useReactToPrint } from "react-to-print"

export function SuratKeluarDetail({ data }: { data: SuratKeluar }) {
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Surat_Keluar_${data.nomor_surat.replace(/\//g, "-")}`,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/surat-keluar")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Detail Surat Keluar</h2>
                </div>
                <Button variant="outline" onClick={() => handlePrint()}>
                    <Printer className="mr-2 h-4 w-4" /> Cetak / PDF
                </Button>
            </div>

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
                                <User className="h-4 w-4" /> Tujuan
                            </span>
                            <span className="font-medium">{data.tujuan}</span>
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
                            <span>{data.kategori}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Sifat
                            </span>
                            <span className="font-medium">{data.sifat}</span>
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
                            {data.file_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={data.file_url} download target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Unduh Lampiran
                                    </a>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="bg-muted/10 p-8 min-h-[500px]">
                            {/* Printable Content Wrapper */}
                            <div ref={contentRef} className="bg-white p-12 shadow-sm border mx-auto max-w-[210mm] min-h-[297mm] text-black">
                                {/* Kop Surat Simulation */}
                                <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
                                    <h1 className="text-xl font-bold uppercase">Pemerintah Kabupaten Contoh</h1>
                                    <h2 className="text-lg font-bold uppercase">Dinas Kearsipan dan Perpustakaan</h2>
                                    <p className="text-sm">Jl. Contoh No. 123, Kota Contoh, Telp. (021) 1234567</p>
                                </div>

                                {/* Header Surat */}
                                <div className="flex justify-between mb-8">
                                    <div className="w-1/2">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className="w-24">Nomor</td>
                                                    <td className="w-4">:</td>
                                                    <td>{data.nomor_surat}</td>
                                                </tr>
                                                <tr>
                                                    <td>Sifat</td>
                                                    <td>:</td>
                                                    <td>{data.sifat}</td>
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
                                        <p>Contoh Kota, {format(new Date(data.tanggal_surat), "dd MMMM yyyy", { locale: id })}</p>
                                    </div>
                                </div>

                                {/* Tujuan */}
                                <div className="mb-8">
                                    <p>Yth.</p>
                                    <p className="font-bold">{data.tujuan}</p>
                                    <p>di</p>
                                    <p className="pl-8">Tempat</p>
                                </div>

                                {/* Isi Surat Placeholder */}
                                <div className="mb-8 text-justify leading-relaxed">
                                    <p className="mb-4">Dengan hormat,</p>
                                    <p className="mb-4">
                                        Sehubungan dengan kegiatan operasional dinas, bersama ini kami sampaikan bahwa...
                                        [Ini adalah simulasi isi surat. Dalam implementasi nyata, isi surat akan diambil dari editor text atau inputan user.]
                                    </p>
                                    <p className="mb-4">
                                        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                                    </p>
                                </div>

                                {/* Tanda Tangan */}
                                <div className="flex justify-end mt-16">
                                    <div className="text-center w-64">
                                        <p className="mb-24">Kepala Dinas,</p>
                                        <p className="font-bold underline">Nama Kepala Dinas</p>
                                        <p>NIP. 19800101 200001 1 001</p>
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
