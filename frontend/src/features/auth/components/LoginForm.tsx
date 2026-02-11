import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"

import { useAuthStore } from "@/store/authStore"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true)
        // Mock authentication delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock Login Logic
        if (data.email) {
            login(
                {
                    id: "1",
                    name: "Admin User",
                    email: data.email,
                    role: "admin",
                },
                "mock-jwt-token"
            )
            navigate("/dashboard")
        }
        setIsLoading(false)
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                    Masukkan email dan password untuk masuk ke aplikasi
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="admin@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                        <a href="#" className="text-sm text-muted-foreground hover:underline">
                                            Lupa password?
                                        </a>
                                    </div>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
