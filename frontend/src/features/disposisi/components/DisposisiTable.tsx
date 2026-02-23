import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { type Disposisi } from "../types"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { disposisiService } from "@/services/disposisiService"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "outline",
    PROSES: "default",
    SELESAI: "secondary",
}

export function DisposisiTable({
    data,
    onRefresh,
}: {
    data: Disposisi[]
    onRefresh: () => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [completeDialog, setCompleteDialog] = useState<number | null>(null)
    const [keterangan, setKeterangan] = useState("")
    const [completingId, setCompletingId] = useState<number | null>(null)

    const handleComplete = async (id: number) => {
        setCompletingId(id)
        try {
            await disposisiService.complete(id, { keterangan })
            toast.success("Disposisi ditandai selesai")
            setCompleteDialog(null)
            setKeterangan("")
            onRefresh()
        } catch {
            toast.error("Gagal menyelesaikan disposisi")
        } finally {
            setCompletingId(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus disposisi ini?")) return
        try {
            await disposisiService.delete(id)
            toast.success("Disposisi dihapus")
            onRefresh()
        } catch {
            toast.error("Gagal menghapus disposisi")
        }
    }

    const columns: ColumnDef<Disposisi>[] = [
        {
            accessorKey: "surat_type",
            header: "Jenis",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.getValue("surat_type")}
                </Badge>
            ),
        },
        {
            accessorKey: "instruksi",
            header: "Instruksi",
            cell: ({ row }) => (
                <div className="max-w-[280px] truncate" title={row.getValue("instruksi")}>
                    {row.getValue("instruksi")}
                </div>
            ),
        },
        {
            accessorKey: "deadline",
            header: "Deadline",
            cell: ({ row }) => {
                const val = row.getValue("deadline") as string | undefined
                return val ? format(new Date(val), "dd MMM yyyy", { locale: idLocale }) : "-"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex gap-1 justify-end">
                        {item.status !== 'SELESAI' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => setCompleteDialog(item.id)}
                                title="Tandai selesai"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    })

    return (
        <>
            <div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Tidak ada data disposisi.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>

            <Dialog open={completeDialog !== null} onOpenChange={() => setCompleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tandai Disposisi Selesai</DialogTitle>
                        <DialogDescription>Tambahkan keterangan penyelesaian (opsional).</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Keterangan penyelesaian..."
                        value={keterangan}
                        onChange={e => setKeterangan(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompleteDialog(null)}>Batal</Button>
                        <Button
                            onClick={() => completeDialog && handleComplete(completeDialog)}
                            disabled={completingId !== null}
                        >
                            {completingId !== null ? "Menyimpan..." : "Konfirmasi Selesai"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
