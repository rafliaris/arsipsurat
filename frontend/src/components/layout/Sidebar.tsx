import { Link, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    Inbox,
    Send,
    FileCheck,
    Bell,
    Settings,
    Users,
    GalleryVerticalEnd
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Inbox, label: "Surat Masuk", href: "/surat-masuk" },
    { icon: Send, label: "Surat Keluar", href: "/surat-keluar" },
    { icon: FileCheck, label: "Disposisi", href: "/disposisi" },
    { icon: Users, label: "Users", href: "/settings/users" }, // Shortcut to users
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function SidebarContent() {
    const location = useLocation()

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <GalleryVerticalEnd className="h-6 w-6" />
                    <span className="">Arsip Surat</span>
                </Link>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4">
                {/* Footer or Upgrade Card if needed */}
            </div>
        </div>
    )
}

export function Sidebar() {
    return (
        <div className="hidden border-r bg-muted/40 md:block w-64 min-h-screen">
            <SidebarContent />
        </div>
    )
}
