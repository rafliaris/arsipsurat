import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function Header() {
    const { user, logout } = useAuthStore()

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between">
            <div className="w-full flex-1">
                {/* Search input placeholder */}
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user?.name || "User"}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                </Button>
            </div>
        </header>
    )
}
