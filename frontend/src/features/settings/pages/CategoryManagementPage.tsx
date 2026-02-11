import { useEffect, useState } from "react"
import { type Category } from "../types"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { mockCategoryService } from "@/services/mockCategoryService"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await mockCategoryService.getAll()
                setCategories(data)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    const handleDelete = async (id: string) => {
        if (confirm("Apakah anda yakin ingin menghapus kategori ini?")) {
            await mockCategoryService.delete(id)
            setCategories(categories.filter(c => c.id !== id))
            toast.success("Kategori berhasil dihapus")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Kategori Surat</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola master data kategori untuk pengelompokan surat.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                </Button>
            </div>
            <Separator />

            {loading ? <TableSkeleton columns={5} /> : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Warna Label</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className="text-xs text-muted-foreground">{category.color}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(category.created_at), "dd MMM yyyy", { locale: id })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
