import { useEffect, useState } from "react"
import { auditService, type AuditLog, type ListAuditParams } from "@/services/auditService"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { RefreshCw, Search } from "lucide-react"

const ACTION_VARIANTS: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    CREATE: "default",
    UPDATE: "secondary",
    DELETE: "destructive",
    LOGIN_SUCCESS: "outline",
    LOGIN_FAILED: "destructive",
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [params, setParams] = useState<ListAuditParams>({ limit: 50, days: 30 })
    const [search, setSearch] = useState("")

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await auditService.getAll(params)
            setLogs(data)
        } catch (error) {
            console.error("Failed to fetch audit logs:", error)
            toast.error("Gagal memuat audit log")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])

    const filteredLogs = search
        ? logs.filter(log =>
            log.description.toLowerCase().includes(search.toLowerCase()) ||
            log.table_name.toLowerCase().includes(search.toLowerCase())
        )
        : logs

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Audit Log</h3>
                    <p className="text-sm text-muted-foreground">
                        Riwayat aktivitas sistem (admin only).
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
            <Separator />

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari deskripsi atau tabel..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={params.action ?? "all"}
                    onValueChange={v => setParams(p => ({ ...p, action: v === "all" ? undefined : v }))}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Semua Aksi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Aksi</SelectItem>
                        <SelectItem value="CREATE">CREATE</SelectItem>
                        <SelectItem value="UPDATE">UPDATE</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="LOGIN_SUCCESS">LOGIN_SUCCESS</SelectItem>
                        <SelectItem value="LOGIN_FAILED">LOGIN_FAILED</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={String(params.days ?? 30)}
                    onValueChange={v => setParams(p => ({ ...p, days: Number(v) }))}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7 hari terakhir</SelectItem>
                        <SelectItem value="30">30 hari terakhir</SelectItem>
                        <SelectItem value="90">90 hari terakhir</SelectItem>
                        <SelectItem value="365">1 tahun terakhir</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {loading ? (
                <TableSkeleton columns={5} />
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Aksi</TableHead>
                                <TableHead>Tabel</TableHead>
                                <TableHead>ID Record</TableHead>
                                <TableHead>Deskripsi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data audit log
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-sm whitespace-nowrap">
                                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ACTION_VARIANTS[log.action] ?? "outline"} className="text-xs">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.table_name}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {log.record_id ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-sm max-w-[400px] truncate">
                                        {log.description}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <p className="text-xs text-muted-foreground">{filteredLogs.length} entri ditampilkan</p>
        </div>
    )
}
