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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { userService } from "@/services/userService"
import { type User } from "../types"
import { toast } from "sonner"
import { useState } from "react"

const formSchema = z.object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    full_name: z.string().min(1, "Nama lengkap wajib diisi"),
    role: z.enum(["admin", "staff", "viewer"]),
    is_active: z.boolean(),
    password: z.string().optional(),
})

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
    onSuccess: (user: User) => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = !!user

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            username: user?.username ?? "",
            email: user?.email ?? "",
            full_name: user?.full_name ?? "",
            role: user?.role ?? "staff",
            is_active: user?.is_active ?? true,
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            let result: User
            if (isEdit && user) {
                result = await userService.update(user.id, {
                    full_name: values.full_name,
                    email: values.email,
                    role: values.role,
                    is_active: values.is_active,
                })
            } else {
                result = await userService.create({
                    username: values.username,
                    email: values.email,
                    full_name: values.full_name,
                    role: values.role,
                    password: values.password ?? "",
                })
            }
            toast.success(isEdit ? "User berhasil diperbarui" : "User berhasil ditambahkan")
            onSuccess(result)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error(isEdit ? "Gagal memperbarui user" : "Gagal menambahkan user")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit User" : "Tambah User Baru"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Perbarui informasi akun pengguna." : "Buat akun pengguna baru."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nama lengkap" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@contoh.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="staff">Staff</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEdit && (
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status Aktif</FormLabel>
                                            <div className="flex items-center h-10">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
