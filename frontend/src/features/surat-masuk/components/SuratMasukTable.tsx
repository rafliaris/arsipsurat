import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
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
import { type SuratMasuk } from "../types"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function SuratMasukTable({
    data,
    onView,
}: {
    data: SuratMasuk[]
    onView: (id: string) => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns: ColumnDef<SuratMasuk>[] = [
        {
            accessorKey: "nomor_surat",
            header: "No. Surat",
            cell: ({ row }) => <div className="font-medium">{row.getValue("nomor_surat")}</div>,
        },
        {
            accessorKey: "pengirim",
            header: "Pengirim",
        },
        {
            accessorKey: "perihal",
            header: "Perihal",
            cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue("perihal")}>{row.getValue("perihal")}</div>,
        },
        {
            accessorKey: "tanggal_terima",
            header: "Tgl Terima",
            cell: ({ row }) => {
                return format(new Date(row.getValue("tanggal_terima")), "dd MMM yyyy", { locale: id })
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                let variant: "default" | "secondary" | "outline" | "destructive" = "outline"
                let className = ""

                switch (status) {
                    case "selesai":
                        variant = "default"
                        className = "bg-green-500 hover:bg-green-600"
                        break
                    case "disposisi":
                        variant = "secondary"
                        className = "bg-blue-500 text-white hover:bg-blue-600"
                        break
                    case "pending":
                        variant = "destructive"
                        className = "bg-orange-500 hover:bg-orange-600"
                        break
                }

                return (
                    <Badge variant={variant} className={className}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => onView(row.original.id)}>
                            <Eye className="h-4 w-4" />
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
        state: {
            sorting,
        },
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
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
                                    Tidak ada data surat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
