import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { Separator } from "@/components/ui/separator"
import { Outlet, useLocation } from "react-router-dom"

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
    "/settings": {
        title: "Profil & Umum",
        description: "Kelola preferensi akun dan konfigurasi sistem.",
    },
    "/settings/users": {
        title: "Manajemen User",
        description: "Kelola akun pengguna yang memiliki akses ke sistem.",
    },
    "/settings/categories": {
        title: "Kategori Surat",
        description: "Kelola kategori dan klasifikasi surat.",
    },
    "/settings/app-settings": {
        title: "Konfigurasi Aplikasi",
        description: "Kelola pengaturan sistem dan konfigurasi global.",
    },
    "/settings/audit": {
        title: "Audit Log",
        description: "Rekam jejak seluruh aktivitas pengguna pada sistem.",
    },
}

export function SettingsLayout() {
    const location = useLocation()
    const page = PAGE_TITLES[location.pathname] ?? {
        title: "Settings",
        description: "Kelola preferensi akun dan konfigurasi sistem.",
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6 pb-16">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">{page.title}</h2>
                    <p className="text-muted-foreground">{page.description}</p>
                </div>
                <Separator />
                <Outlet />
            </div>
        </DashboardLayout>
    )
}
