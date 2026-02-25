import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu, KeyRound, ChevronDown } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/Sidebar"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
    const { user, logout } = useAuthStore()
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                {/* Search input placeholder */}
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <ModeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                            <User className="h-4 w-4" />
                            <span className="hidden md:inline text-sm">{user?.full_name || "User"}</span>
                            <ChevronDown className="h-3 w-3 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.username} · {user?.role}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Ganti Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ChangePasswordDialog
                open={changePasswordOpen}
                onOpenChange={setChangePasswordOpen}
            />
        </header>
    )
}

