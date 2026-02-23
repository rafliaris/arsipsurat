import { Link, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    Inbox,
    Send,
    FileCheck,
    Settings,
    User,
    Tag,
    SlidersHorizontal,
    ClipboardList,
    GalleryVerticalEnd,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Inbox, label: "Surat Masuk", href: "/surat-masuk" },
    { icon: Send, label: "Surat Keluar", href: "/surat-keluar" },
    { icon: FileCheck, label: "Disposisi", href: "/disposisi" },
]

const settingsItems = [
    { icon: Settings, label: "Profil & Umum", href: "/settings" },
    { icon: User, label: "Manajemen User", href: "/settings/users" },
    { icon: Tag, label: "Kategori Surat", href: "/settings/categories" },
    { icon: SlidersHorizontal, label: "Konfigurasi Aplikasi", href: "/settings/app-settings" },
    { icon: ClipboardList, label: "Audit Log", href: "/settings/audit" },
]

export function SidebarContent() {
    const location = useLocation()
    const inSettings = location.pathname.startsWith("/settings")

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <GalleryVerticalEnd className="h-6 w-6" />
                    <span>Arsip Surat</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-2 gap-0.5">
                    {mainItems.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}

                    {/* Settings group */}
                    <Link
                        to="/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary mt-1",
                            inSettings ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Settings className="h-4 w-4 shrink-0" />
                        Settings
                    </Link>

                    {/* Sub-items — always visible so user can navigate directly */}
                    {settingsItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg pl-9 pr-3 py-1.5 text-xs transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4">
                {/* Footer if needed */}
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
