import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { suratMasukService } from "@/services/suratMasukService"
import { kategoriService } from "@/services/kategoriService"
import { type Kategori } from "@/features/settings/types"
import { toast } from "sonner"

const formSchema = z.object({
    nomor_surat: z.string().optional(),
    pengirim: z.string().min(1, "Pengirim wajib diisi"),
    perihal: z.string().min(1, "Perihal wajib diisi"),
    tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
    tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
    kategori_id: z.string().optional(),
    priority: z.enum(["rendah", "sedang", "tinggi", "mendesak"]).default("sedang"),
})

export function SuratMasukForm() {
    const navigate = useNavigate()
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [kategoris, setKategoris] = useState<Kategori[]>([])

    // Load kategori from API
    useEffect(() => {
        kategoriService.getAll({ is_active: true })
            .then(setKategoris)
            .catch(() => toast.error("Gagal memuat daftar kategori"))
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nomor_surat: "",
            pengirim: "",
            perihal: "",
            tanggal_surat: new Date().toISOString().split('T')[0],
            tanggal_terima: new Date().toISOString().split('T')[0],
            kategori_id: "",
            priority: "sedang",
        },
    })

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!file) {
            toast.error("File surat wajib dilampirkan")
            return
        }
        try {
            setIsSubmitting(true)
            await suratMasukService.create({
                file,
                pengirim: values.pengirim,
                perihal: values.perihal,
                tanggal_surat: values.tanggal_surat,
                tanggal_terima: values.tanggal_terima,
                nomor_surat: values.nomor_surat || undefined,
                kategori_id: values.kategori_id ? Number(values.kategori_id) : undefined,
                priority: values.priority,
            })
            toast.success("Surat masuk berhasil disimpan")
            navigate("/surat-masuk")
        } catch (error) {
            console.error(error)
            toast.error("Gagal menyimpan surat masuk")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="nomor_surat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Surat <span className="text-muted-foreground">(Opsional)</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: 001/ABC/I/2026 (kosongkan jika belum ada)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pengirim"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pengirim</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nama instansi/perorangan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tanggal_surat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Surat</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tanggal_terima"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Terima</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="kategori_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
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
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prioritas</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih prioritas" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="rendah">Rendah</SelectItem>
                                        <SelectItem value="sedang">Sedang</SelectItem>
                                        <SelectItem value="tinggi">Tinggi</SelectItem>
                                        <SelectItem value="mendesak">Mendesak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="perihal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Perihal</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ringkasan isi surat" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>File Surat (PDF/Image) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-primary">
                                    <span className="font-medium">{file.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8" />
                                    <p>Drag & drop file di sini, atau klik untuk memilih</p>
                                    <p className="text-xs">Max 1 file (PDF, JPG, PNG)</p>
                                </div>
                            )}
                        </div>
                    </FormControl>
                </FormItem>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/surat-masuk")}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : "Simpan Surat"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
