import { useEffect, useState, useCallback } from "react"
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { notificationService, type Notification } from "@/services/notificationService"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const TIPE_ICONS: Record<string, string> = {
    surat_masuk: "📥",
    surat_keluar: "📤",
    disposisi: "📋",
    deadline: "⏰",
    status_update: "🔄",
    system: "🔔",
}

function NotificationItem({
    notif,
    onRead,
    onDelete,
}: {
    notif: Notification
    onRead: (id: number) => void
    onDelete: (id: number) => void
}) {
    const navigate = useNavigate()

    const handleClick = () => {
        if (!notif.is_read) onRead(notif.id)
        if (notif.link) navigate(notif.link)
    }

    return (
        <div
            className={cn(
                "flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer group transition-colors",
                !notif.is_read && "bg-primary/5"
            )}
            onClick={handleClick}
        >
            <div className="text-xl mt-0.5 shrink-0">
                {TIPE_ICONS[notif.tipe] ?? "🔔"}
            </div>
            <div className="flex-1 min-w-0">
                <div className={cn("text-sm leading-tight", !notif.is_read && "font-semibold")}>
                    {notif.judul}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notif.pesan}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: idLocale })}
                </div>
            </div>
            <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(notif.id)
                    }}
                >
                    <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
            </div>
        </div>
    )
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const [list, stats] = await Promise.all([
                notificationService.getAll({ limit: 20 }),
                notificationService.getStats(),
            ])
            setNotifications(list)
            setUnreadCount(stats.unread)
        } catch {
            // Silently fail — don't toast on polling
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch on mount and poll every 60s
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60_000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Refresh when popover opens
    useEffect(() => {
        if (open) fetchNotifications()
    }, [open, fetchNotifications])

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {
            toast.error("Gagal menandai notifikasi")
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
            toast.success("Semua notifikasi ditandai sebagai dibaca")
        } catch {
            toast.error("Gagal menandai semua notifikasi")
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await notificationService.delete(id)
            const wasUnread = notifications.find(n => n.id === id)?.is_read === false
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {
            toast.error("Gagal menghapus notifikasi")
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" title="Notifikasi">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 text-xs flex items-center justify-center"
                            variant="destructive"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <h4 className="font-semibold text-sm">Notifikasi</h4>
                        {unreadCount > 0 && (
                            <p className="text-xs text-muted-foreground">{unreadCount} belum dibaca</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleMarkAllRead}>
                            <CheckCheck className="h-3 w-3" />
                            Tandai semua
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                            Memuat...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                            <Bell className="h-8 w-8 opacity-30" />
                            <span className="text-sm">Tidak ada notifikasi</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notif, index) => (
                                <div key={notif.id}>
                                    <NotificationItem
                                        notif={notif}
                                        onRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                    {index < notifications.length - 1 && <Separator className="opacity-50" />}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="border-t px-4 py-2">
                        <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1 text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            Lihat semua notifikasi
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
