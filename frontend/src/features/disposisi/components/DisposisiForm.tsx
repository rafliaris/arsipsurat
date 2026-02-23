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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { disposisiService } from "@/services/disposisiService"
import { userService } from "@/services/userService"
import { type User } from "@/features/settings/types"
import { Send } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    to_user_id: z.string().min(1, "Tujuan disposisi wajib dipilih"),
    instruksi: z.string().min(1, "Instruksi wajib diisi"),
    keterangan: z.string().optional(),
    deadline: z.string().optional(),
})

interface DisposisiFormProps {
    suratId: number;
    suratType?: 'masuk' | 'keluar';
    onSuccess: () => void;
}

export function DisposisiForm({ suratId, suratType = 'masuk', onSuccess }: DisposisiFormProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        if (open) {
            userService.getAll()
                .then(setUsers)
                .catch(() => toast.error("Gagal memuat daftar user"))
        }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            to_user_id: "",
            instruksi: "",
            keterangan: "",
            deadline: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            await disposisiService.create({
                surat_type: suratType,
                surat_masuk_id: suratType === 'masuk' ? suratId : undefined,
                surat_keluar_id: suratType === 'keluar' ? suratId : undefined,
                to_user_id: Number(values.to_user_id),
                instruksi: values.instruksi,
                keterangan: values.keterangan || undefined,
                deadline: values.deadline || undefined,
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
                            name="to_user_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tujuan Disposisi (Kepada)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih penerima" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users.map(u => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.full_name} ({u.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batas Waktu (Opsional)</FormLabel>
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
                            name="keterangan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keterangan Tambahan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Keterangan..." {...field} />
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
