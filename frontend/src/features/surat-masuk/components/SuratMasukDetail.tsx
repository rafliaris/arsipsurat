import { SuratMasuk } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Calendar, User, Tag } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

export function SuratMasukDetail({ data }: { data: SuratMasuk }) {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/surat-masuk")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Detail Surat Masuk</h2>
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
                            <span>{data.kategori}</span>
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
                            {data.file_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={data.file_url} download target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Unduh
                                    </a>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 bg-muted/20 p-0 overflow-hidden flex items-center justify-center">
                            {data.file_url ? (
                                <iframe
                                    src={data.file_url}
                                    className="w-full h-full"
                                    title="Dokumen Surat"
                                />
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
        </div>
    )
}
