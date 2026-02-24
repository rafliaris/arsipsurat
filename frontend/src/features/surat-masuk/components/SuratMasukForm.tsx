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

import { suratMasukService, type DetectResult } from "@/services/suratMasukService"
import { kategoriService } from "@/services/kategoriService"
import { type Kategori } from "@/features/settings/types"
import {
    DetectionMethodSelector,
    type DetectionMethod,
} from "@/components/DetectionMethodSelector"

// ─── Constants ────────────────────────────────────────────────
// Set to true when OPENROUTER_API_KEY is configured in the backend.
// For now we read from a Vite env var; the backend will also guard this.
const AI_AVAILABLE = !!import.meta.env.VITE_AI_AVAILABLE

// ─── Review form schema ────────────────────────────────────────
const reviewSchema = z.object({
    nomor_surat: z.string().optional(),
    tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
    tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
    pengirim: z.string().min(1, "Pengirim wajib diisi"),
    perihal: z.string().min(1, "Perihal wajib diisi"),
    isi_singkat: z.string().optional(),
    kategori_id: z.string().optional(),
    priority: z.enum(["rendah", "sedang", "tinggi", "urgent"]),
})

type ReviewForm = z.infer<typeof reviewSchema>
type Step = "upload" | "scanning" | "review"

// ─── Detected field badge ──────────────────────────────────────
function DetectedBadge({ detected }: { detected: boolean }) {
    return detected
        ? <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-500">✓ Terdeteksi</Badge>
        : <Badge variant="secondary" className="text-xs">? Tidak terdeteksi</Badge>
}

// ─── Method label badge ────────────────────────────────────────
const METHOD_LABELS: Record<DetectionMethod, string> = {
    ai: "🤖 AI",
    regex: "🔍 Regex",
    hybrid: "⚡ AI + Regex",
    ocr_only: "📄 OCR Only",
    manual: "✍️ Manual",
}

// ─── Main component ────────────────────────────────────────────
export function SuratMasukForm() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>("upload")
    const [method, setMethod] = useState<DetectionMethod>(
        AI_AVAILABLE ? "hybrid" : "regex"
    )
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [detectResult, setDetectResult] = useState<DetectResult | null>(null)
    const [kategoris, setKategoris] = useState<Kategori[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const today = new Date().toISOString().split("T")[0]

    const form = useForm<ReviewForm>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            nomor_surat: "",
            tanggal_surat: today,
            tanggal_terima: today,
            pengirim: "",
            perihal: "",
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

    // ─── Manual mode: skip straight to empty review ─────────
    function handleManualMode() {
        form.reset({
            nomor_surat: "",
            tanggal_surat: today,
            tanggal_terima: today,
            pengirim: "",
            perihal: "",
            isi_singkat: "",
            kategori_id: "",
            priority: "sedang",
        })
        setDetectResult(null)
        setUploadedFile(null)
        setStep("review")
    }

    // ─── Step 1: Drop zone ────────────────────────────────────
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        // Manual mode — don't upload, just open form
        if (method === "manual") {
            handleManualMode()
            return
        }

        setUploadedFile(file)
        setStep("scanning")

        try {
            // OCR Only: run detect but clear all fields except raw text
            const result = await suratMasukService.detect(file, method)
            setDetectResult(result)

            const d = result.detected
            const isOcrOnly = method === "ocr_only"

            form.reset({
                nomor_surat: isOcrOnly ? "" : (d.nomor_surat.value ?? ""),
                tanggal_surat: isOcrOnly ? today : (d.tanggal_surat.value ?? today),
                tanggal_terima: today,
                pengirim: isOcrOnly ? "" : (d.pengirim.value ?? ""),
                perihal: isOcrOnly ? "" : (d.perihal.value ?? ""),
                isi_singkat: isOcrOnly ? "" : (d.isi_singkat?.value ?? ""),
                kategori_id: "",
                priority: "sedang",
            })

            setStep("review")
        } catch {
            toast.error("Gagal memproses dokumen. Silakan coba lagi.")
            setStep("upload")
            setUploadedFile(null)
        }
    }, [form, today, method]) // eslint-disable-line react-hooks/exhaustive-deps

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
        maxFiles: 1,
        disabled: step === "scanning",
    })

    // ─── Step 2: Confirm ──────────────────────────────────────
    async function onConfirm(values: ReviewForm) {
        if (!detectResult && method !== "manual") return
        setIsSubmitting(true)
        try {
            if (method === "manual" && uploadedFile === null) {
                toast.error("Mode manual memerlukan file. Silakan upload terlebih dahulu.")
                return
            }
            await suratMasukService.confirm({
                file_token: detectResult?.file_token ?? "",
                nomor_surat: values.nomor_surat || undefined,
                tanggal_surat: values.tanggal_surat,
                tanggal_terima: values.tanggal_terima,
                pengirim: values.pengirim,
                perihal: values.perihal,
                isi_singkat: values.isi_singkat || undefined,
                kategori_id: values.kategori_id ? Number(values.kategori_id) : undefined,
                priority: values.priority,
                ocr_text: detectResult?.ocr_text || undefined,
                ocr_confidence: detectResult?.ocr_confidence ?? undefined,
            })
            toast.success("Surat masuk berhasil disimpan!")
            navigate("/surat-masuk")
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

    // ─────────────────────────────────────────────────────────
    // STEP 1: Upload UI
    // ─────────────────────────────────────────────────────────
    if (step === "upload") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-4 gap-2">

                {/* ── Detection method selector ── */}
                <DetectionMethodSelector
                    value={method}
                    onChange={setMethod}
                    aiAvailable={AI_AVAILABLE}
                />

                {/* ── Drop zone (hidden for manual mode) ── */}
                {method === "manual" ? (
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                            <span className="text-4xl">✍️</span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-1">Mode Manual</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Isi semua field secara manual tanpa upload dokumen
                            </p>
                            <Button onClick={handleManualMode} size="lg">
                                Buka Form Kosong
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
                            ${isDragActive
                                ? "border-primary bg-primary/5 scale-105"
                                : "border-muted-foreground/30 hover:border-primary hover:bg-accent/50"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className={`h-14 w-14 mx-auto mb-5 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                        <h3 className="text-xl font-semibold mb-2">Upload Surat</h3>
                        <p className="text-muted-foreground mb-1">
                            Drag &amp; drop file PDF atau gambar di sini
                        </p>
                        <p className="text-sm text-muted-foreground mb-5">atau klik untuk memilih file</p>
                        <Button type="button" variant="outline" size="lg">
                            <FileText className="mr-2 h-4 w-4" />
                            Pilih File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">Format: PDF, JPG, PNG</p>

                        {/* Method info hint */}
                        <p className="text-xs text-muted-foreground mt-2 opacity-70">
                            Metode: <span className="font-medium">{METHOD_LABELS[method]}</span>
                            {method === "ocr_only" && " — teks dideteksi, field diisi manual"}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────
    // STEP: Scanning animation
    // ─────────────────────────────────────────────────────────
    if (step === "scanning") {
        const scanLabels: Record<string, string> = {
            ai: "Meminta AI menganalisis surat...",
            hybrid: "Meminta AI & regex menganalisis surat...",
            regex: "Menganalisis pola teks surat...",
            ocr_only: "Mengekstrak teks dari dokumen...",
            manual: "",
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <div className="relative">
                    <FileText className="h-20 w-20 text-muted-foreground/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-1">Memindai dokumen...</h3>
                    <p className="text-sm text-muted-foreground">{uploadedFile?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {scanLabels[method] ?? "Sistem sedang membaca dan menganalisis isi surat"}
                    </p>
                    <p className="text-xs text-primary mt-1 font-medium">{METHOD_LABELS[method]}</p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                </div>
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────
    // STEP 2: Review & Confirm UI
    // ─────────────────────────────────────────────────────────
    const detectedCount = detectResult
        ? Object.values(detectResult.detected).filter(f => f.detected).length
        : 0
    const totalFields = detectResult ? Object.keys(detectResult.detected).length : 0
    const isManual = method === "manual"
    const isOcrOnly = method === "ocr_only"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border bg-accent/30">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{uploadedFile?.name ?? "Mode Manual"}</p>
                            <Badge variant="outline" className="text-xs">{METHOD_LABELS[method]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isManual
                                ? "Isi semua field secara manual"
                                : isOcrOnly
                                    ? "Teks berhasil diekstrak — isi field secara manual"
                                    : `${detectedCount}/${totalFields} field berhasil dideteksi otomatis`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isManual && !isOcrOnly && (
                        detectedCount === totalFields
                            ? <CheckCircle className="h-5 w-5 text-green-500" />
                            : <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <Button variant="ghost" size="sm" onClick={handleRetry}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Ganti
                    </Button>
                </div>
            </div>

            {/* Review form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Nomor Surat */}
                        <FormField control={form.control} name="nomor_surat" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel className="mb-0">Nomor Surat</FormLabel>
                                    {!isManual && !isOcrOnly && (
                                        <DetectedBadge detected={detectResult?.detected.nomor_surat.detected ?? false} />
                                    )}
                                </div>
                                <FormControl>
                                    <Input placeholder="Kosongkan untuk generate otomatis" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Pengirim */}
                        <FormField control={form.control} name="pengirim" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1">
                                    <FormLabel className="mb-0">Pengirim</FormLabel>
                                    {!isManual && !isOcrOnly && (
                                        <DetectedBadge detected={detectResult?.detected.pengirim.detected ?? false} />
                                    )}
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
                                    {!isManual && !isOcrOnly && (
                                        <DetectedBadge detected={detectResult?.detected.tanggal_surat.detected ?? false} />
                                    )}
                                </div>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Tanggal Terima */}
                        <FormField control={form.control} name="tanggal_terima" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Terima</FormLabel>
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
                                {!isManual && !isOcrOnly && (
                                    <DetectedBadge detected={detectResult?.detected.perihal.detected ?? false} />
                                )}
                            </div>
                            <FormControl>
                                <Textarea placeholder="Perihal / pokok surat" rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Isi Singkat */}
                    <FormField control={form.control} name="isi_singkat" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2 mb-1">
                                <FormLabel className="mb-0">
                                    Ringkasan Isi <span className="text-muted-foreground text-xs">(opsional)</span>
                                </FormLabel>
                                {!isManual && !isOcrOnly && detectResult?.detected.isi_singkat && (
                                    <DetectedBadge detected={detectResult.detected.isi_singkat.detected} />
                                )}
                            </div>
                            <FormControl>
                                <Textarea placeholder="Ringkasan singkat isi surat" rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/surat-masuk")}>
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
