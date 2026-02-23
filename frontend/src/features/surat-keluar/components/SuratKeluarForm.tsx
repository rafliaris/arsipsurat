import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import { suratKeluarService, type DetectKeluarResult } from "@/services/suratKeluarService"
import { kategoriService } from "@/services/kategoriService"
import { type Kategori } from "@/features/settings/types"

// ─── Step 2 form schema ─────────────────────────────────────
const reviewSchema = z.object({
    tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
    penerima: z.string().min(1, "Penerima wajib diisi"),
    perihal: z.string().min(1, "Perihal wajib diisi"),
    tembusan: z.string().optional(),
    isi_singkat: z.string().optional(),
    kategori_id: z.string().optional(),
    priority: z.enum(["rendah", "sedang", "tinggi", "urgent"]),
})

type ReviewForm = z.infer<typeof reviewSchema>
type Step = "upload" | "scanning" | "review"

function DetectedBadge({ detected }: { detected: boolean }) {
    return detected
        ? <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-500">✓ Terdeteksi</Badge>
        : <Badge variant="secondary" className="text-xs">? Tidak terdeteksi</Badge>
}

export function SuratKeluarForm() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>("upload")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [detectResult, setDetectResult] = useState<DetectKeluarResult | null>(null)
    const [kategoris, setKategoris] = useState<Kategori[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const today = new Date().toISOString().split("T")[0]

    const form = useForm<ReviewForm>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            tanggal_surat: today,
            penerima: "",
            perihal: "",
            tembusan: "",
            isi_singkat: "",
            kategori_id: "",
            priority: "sedang",
        },
    })

    useEffect(() => {
        kategoriService.getAll({ is_active: true })
            .then(setKategoris)
            .catch(() => { })
    }, [])

    // ─── Step 1: Drop zone ──────────────────────────────────
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        setUploadedFile(file)
        setStep("scanning")

        try {
            const result = await suratKeluarService.detect(file)
            setDetectResult(result)

            const d = result.detected
            form.reset({
                tanggal_surat: d.tanggal_surat.value ?? today,
                penerima: d.penerima.value ?? "",
                perihal: d.perihal.value ?? "",
                tembusan: "",
                isi_singkat: "",
                kategori_id: "",
                priority: "sedang",
            })

            setStep("review")
        } catch {
            toast.error("Gagal memproses dokumen. Silakan coba lagi.")
            setStep("upload")
            setUploadedFile(null)
        }
    }, [form, today])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
        maxFiles: 1,
        disabled: step === "scanning",
    })

    // ─── Step 2: Confirm ────────────────────────────────────
    async function onConfirm(values: ReviewForm) {
        if (!detectResult) return
        setIsSubmitting(true)
        try {
            await suratKeluarService.confirm({
                file_token: detectResult.file_token,
                tanggal_surat: values.tanggal_surat,
                penerima: values.penerima,
                perihal: values.perihal,
                tembusan: values.tembusan || undefined,
                isi_singkat: values.isi_singkat || undefined,
                kategori_id: values.kategori_id ? Number(values.kategori_id) : undefined,
                priority: values.priority,
                ocr_text: detectResult.ocr_text || undefined,
                ocr_confidence: detectResult.ocr_confidence ?? undefined,
            })
            toast.success("Surat keluar berhasil disimpan! Nomor surat di-generate otomatis oleh sistem.")
            navigate("/surat-keluar")
        } catch {
            toast.error("Gagal menyimpan. Silakan coba lagi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleRetry() {
        setStep("upload")
        setUploadedFile(null)
        setDetectResult(null)
        form.reset()
    }

    // ─── STEP 1: Upload UI ──────────────────────────────────
    if (step === "upload") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
                <div
                    {...getRootProps()}
                    className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
                        ${isDragActive
                            ? "border-primary bg-primary/5 scale-105"
                            : "border-muted-foreground/30 hover:border-primary hover:bg-accent/50"
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className={`h-16 w-16 mx-auto mb-6 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="text-xl font-semibold mb-2">Upload Surat Keluar</h3>
                    <p className="text-muted-foreground mb-1">
                        Drag &amp; drop file PDF atau gambar surat di sini
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">atau klik untuk memilih file</p>
                    <Button type="button" variant="outline" size="lg">
                        <FileText className="mr-2 h-4 w-4" />
                        Pilih File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">Format: PDF, JPG, PNG</p>
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
                    <p className="font-medium mb-1">🤖 Sistem akan otomatis membaca:</p>
                    <p>Penerima / Tujuan · Perihal · Tanggal</p>
                    <p className="mt-1">Nomor surat akan di-generate otomatis setelah konfirmasi.</p>
                </div>
            </div>
        )
    }

    // ─── STEP: Scanning animation ───────────────────────────
    if (step === "scanning") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <div className="relative">
                    <FileText className="h-20 w-20 text-muted-foreground/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Memindai dokumen...</h3>
                    <p className="text-muted-foreground text-sm">{uploadedFile?.name}</p>
                    <p className="text-muted-foreground text-sm mt-1">
                        Sistem sedang membaca dan menganalisis isi surat
                    </p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                </div>
            </div>
        )
    }

    // ─── STEP 2: Review & Confirm UI ───────────────────────
    const detectedCount = detectResult
        ? Object.values(detectResult.detected).filter(f => f.detected).length
        : 0
    const totalFields = 3  // penerima, perihal, tanggal_surat

    return (
        <div className="space-y-6">
            {/* Header with file info + detection summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border bg-accent/30">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div>
                        <p className="font-medium text-sm">{uploadedFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {detectedCount}/{totalFields} field berhasil dideteksi otomatis
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Nomor surat akan di-generate otomatis setelah disimpan
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {detectedCount === totalFields
                        ? <CheckCircle className="h-5 w-5 text-green-500" />
                        : <AlertCircle className="h-5 w-5 text-yellow-500" />
                    }
                    <Button variant="ghost" size="sm" onClick={handleRetry}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Ganti File
                    </Button>
                </div>
            </div>

            {/* Review form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Penerima */}
                        <FormField control={form.control} name="penerima" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel className="mb-0">Penerima / Tujuan</FormLabel>
                                    <DetectedBadge detected={detectResult?.detected.penerima.detected ?? false} />
                                </div>
                                <FormControl>
                                    <Input placeholder="Nama instansi / perorangan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Tanggal Surat */}
                        <FormField control={form.control} name="tanggal_surat" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel className="mb-0">Tanggal Surat</FormLabel>
                                    <DetectedBadge detected={detectResult?.detected.tanggal_surat.detected ?? false} />
                                </div>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Kategori */}
                        <FormField control={form.control} name="kategori_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori (opsional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {kategoris.map((k) => (
                                            <SelectItem key={k.id} value={String(k.id)}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: k.color }} />
                                                    {k.nama}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Prioritas */}
                        <FormField control={form.control} name="priority" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prioritas</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="rendah">Rendah</SelectItem>
                                        <SelectItem value="sedang">Sedang</SelectItem>
                                        <SelectItem value="tinggi">Tinggi</SelectItem>
                                        <SelectItem value="urgent">Mendesak / Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    {/* Perihal (full width) */}
                    <FormField control={form.control} name="perihal" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2 mb-1">
                                <FormLabel className="mb-0">Perihal</FormLabel>
                                <DetectedBadge detected={detectResult?.detected.perihal.detected ?? false} />
                            </div>
                            <FormControl>
                                <Textarea placeholder="Perihal / pokok surat" rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Tembusan */}
                    <FormField control={form.control} name="tembusan" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tembusan <span className="text-muted-foreground text-xs">(opsional)</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: Kapolda, Gubernur" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Isi Singkat */}
                    <FormField control={form.control} name="isi_singkat" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ringkasan Isi <span className="text-muted-foreground text-xs">(opsional)</span></FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ringkasan singkat isi surat" rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/surat-keluar")}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                                : "Simpan Surat"
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
