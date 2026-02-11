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
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { mockSuratKeluarService } from "@/services/mockSuratKeluarService"

const formSchema = z.object({
    nomor_surat: z.string().min(1, "Nomor surat wajib diisi"),
    tujuan: z.string().min(1, "Tujuan penerima wajib diisi"),
    perihal: z.string().min(1, "Perihal wajib diisi"),
    tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
    kategori: z.string().min(1, "Kategori wajib dipilih"),
    sifat: z.enum(["Biasa", "Penting", "Rahasia"]),
    file: z.any().optional(),
})

export function SuratKeluarForm() {
    const navigate = useNavigate()
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nomor_surat: "",
            tujuan: "",
            perihal: "",
            tanggal_surat: new Date().toISOString().split('T')[0],
            kategori: "",
            sifat: "Biasa",
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
        try {
            setIsSubmitting(true)
            await mockSuratKeluarService.create({
                ...values,
                status: 'draft', // Default to draft for new outgoing mail
                file_url: file ? URL.createObjectURL(file) : undefined
            })
            navigate("/surat-keluar")
        } catch (error) {
            console.error(error)
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
                                <FormLabel>Nomor Surat</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: 001/OUT/I/2026" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tujuan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tujuan / Penerima</FormLabel>
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
                        name="kategori"
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
                                        <SelectItem value="Undangan">Undangan</SelectItem>
                                        <SelectItem value="Balasan">Balasan</SelectItem>
                                        <SelectItem value="Pemberitahuan">Pemberitahuan</SelectItem>
                                        <SelectItem value="Penawaran">Penawaran</SelectItem>
                                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sifat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sifat Surat</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih sifat" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Biasa">Biasa</SelectItem>
                                        <SelectItem value="Penting">Penting</SelectItem>
                                        <SelectItem value="Rahasia">Rahasia</SelectItem>
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

                <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>File Draft (Opsional)</FormLabel>
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
                                            <p className="text-xs">DOCX, PDF, or Images</p>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/surat-keluar")}>
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
