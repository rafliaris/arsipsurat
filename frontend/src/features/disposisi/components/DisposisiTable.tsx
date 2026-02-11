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
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function DisposisiTable({
    data,
    onView,
}: {
    data: Disposisi[]
    onView: (id: string) => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns: ColumnDef<Disposisi>[] = [
        {
            accessorKey: "dari",
            header: "Dari",
            cell: ({ row }) => <div className="font-medium">{row.getValue("dari")}</div>,
        },
        {
            accessorKey: "instruksi",
            header: "Instruksi",
            cell: ({ row }) => <div className="max-w-[300px] truncate" title={row.getValue("instruksi")}>{row.getValue("instruksi")}</div>,
        },
        {
            accessorKey: "sifat",
            header: "Sifat",
            cell: ({ row }) => {
                const sifat = row.getValue("sifat") as string
                let variant: "default" | "secondary" | "outline" | "destructive" = "secondary"

                switch (sifat) {
                    case "Segera":
                        variant = "destructive"
                        break
                    case "Penting":
                        variant = "default"
                        break
                    case "Rutin":
                        variant = "secondary"
                        break
                    case "Rahasia":
                        variant = "outline"
                        break
                }

                return (
                    <Badge variant={variant}>
                        {sifat}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "batas_waktu",
            header: "Batas Waktu",
            cell: ({ row }) => {
                return format(new Date(row.getValue("batas_waktu")), "dd MMM yyyy", { locale: id })
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant="outline">
                        {status}
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
                                    Tidak ada data disposisi.
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
