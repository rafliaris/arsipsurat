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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { useState } from "react"
import { mockDisposisiService } from "@/services/mockDisposisiService"
import { Send } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    tujuan: z.string().min(1, "Tujuan disposisi wajib diisi"),
    instruksi: z.string().min(1, "Instruksi wajib diisi"),
    sifat: z.enum(["Biasa", "Penting", "Segera", "Rahasia"]),
    batas_waktu: z.string().min(1, "Batas waktu wajib diisi"),
    catatan: z.string().optional(),
})

interface DisposisiFormProps {
    suratId: string;
    onSuccess: () => void;
}

export function DisposisiForm({ suratId, onSuccess }: DisposisiFormProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tujuan: "",
            instruksi: "",
            sifat: "Biasa",
            batas_waktu: new Date().toISOString().split('T')[0],
            catatan: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            await mockDisposisiService.create({
                ...values,
                surat_masuk_id: suratId,
                dari: "Current User", // Mock user
            })
            toast.success("Disposisi berhasil dikirim")
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Gagal mengirim disposisi")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Send className="mr-2 h-4 w-4" /> Disposisi
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Buat Disposisi Baru</DialogTitle>
                    <DialogDescription>
                        Berikan instruksi tindak lanjut untuk surat ini.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tujuan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tujuan Disposisi (Kepada)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Kabid informatika" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sifat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sifat</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih sifat" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Biasa">Biasa</SelectItem>
                                                <SelectItem value="Penting">Penting</SelectItem>
                                                <SelectItem value="Segera">Segera</SelectItem>
                                                <SelectItem value="Rahasia">Rahasia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="batas_waktu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batas Waktu</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="instruksi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instruksi / Perintah</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Isi instruksi..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="catatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Catatan..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Kirim Disposisi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
