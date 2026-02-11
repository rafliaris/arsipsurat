import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"

const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Nama harus minimal 2 karakter.",
    }),
    email: z.string().email({
        message: "Email tidak valid.",
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { user } = useAuthStore()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.full_name || "",
            email: user?.email || "",
        },
    })

    function onSubmit(data: ProfileFormValues) {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: "Menyimpan perubahan...",
                success: () => {
                    // In a real app, calls update API here
                    console.log("Profile updated:", data)
                    return "Profil berhasil diperbarui."
                },
                error: "Gagal menyimpan perubahan.",
            }
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                                <Input placeholder="Nama Anda" {...field} />
                            </FormControl>
                            <FormDescription>
                                Nama lengkap yang akan ditampilkan di profil anda.
                            </FormDescription>
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
                                <Input placeholder="email@contoh.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                Email untuk login dan notifikasi.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Simpan Perubahan</Button>
            </form>
        </Form>
    )
}
