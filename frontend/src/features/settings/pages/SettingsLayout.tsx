import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Tag, Settings } from "lucide-react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"

export function SettingsLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    const sidebarNavItems = [
        {
            title: "Profile",
            href: "/settings",
            icon: Settings,
        },
        {
            title: "Manajemen User",
            href: "/settings/users",
            icon: User,
        },
        {
            title: "Kategori Surat",
            href: "/settings/categories",
            icon: Tag,
        },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6 p-10 pb-16">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Kelola preferensi akun dan konfigurasi sistem.
                    </p>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="-mx-4 lg:w-1/5">
                        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                            {sidebarNavItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                                    className="justify-start"
                                    onClick={() => navigate(item.href)}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Button>
                            ))}
                        </nav>
                    </aside>
                    <div className="flex-1 lg:max-w-4xl">
                        <Outlet />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
