import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/authService"
import { toast } from "sonner"
import { KeyRound } from "lucide-react"

const schema = z.object({
    current_password: z.string().min(1, "Password saat ini wajib diisi"),
    new_password: z.string().min(6, "Password baru minimal 6 karakter"),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
}).refine((data) => data.new_password !== data.current_password, {
    message: "Password baru harus berbeda dari password saat ini",
    path: ["new_password"],
})

type FormValues = z.infer<typeof schema>

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    })

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            await authService.changePassword(values.current_password, values.new_password)
            toast.success("Password berhasil diubah")
            handleClose()
        } catch (error: any) {
            const detail = error?.response?.data?.detail
            const message = typeof detail === "string"
                ? detail
                : "Gagal mengubah password. Periksa kembali password saat ini."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" />
                        Ganti Password
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan password saat ini dan password baru Anda.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password Saat Ini</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password Baru</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Ulangi password baru" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
