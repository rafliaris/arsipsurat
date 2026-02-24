import { useEffect, useState } from "react"
import { type Kategori, type CreateKategoriPayload, type UpdateKategoriPayload } from "../types"
import { kategoriService } from "@/services/kategoriService"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateSlug(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = { nama: "", slug: "", deskripsi: "", color: "#3B82F6" }

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Kategori[]>([])
    const [loading, setLoading] = useState(true)

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Kategori | null>(null) // null = create mode
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchCategories = async () => {
        try {
            const data = await kategoriService.getAll()
            setCategories(data)
        } catch {
            toast.error("Gagal memuat data kategori")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    // ── Open dialog ────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null)
        setForm(EMPTY_FORM)
        setDialogOpen(true)
    }

    const openEdit = (category: Kategori) => {
        setEditTarget(category)
        setForm({
            nama: category.nama,
            slug: category.slug,
            deskripsi: category.deskripsi ?? "",
            color: category.color,
        })
        setDialogOpen(true)
    }

    // ── Form helpers ───────────────────────────────────────────────────────────
    const handleNamaChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            nama: value,
            // Auto-generate slug only when creating
            slug: editTarget ? prev.slug : generateSlug(value),
        }))
    }

    // ── Save ───────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.nama.trim()) {
            toast.error("Nama kategori tidak boleh kosong")
            return
        }

        setSaving(true)
        try {
            if (editTarget) {
                // Update
                const payload: UpdateKategoriPayload = {
                    nama: form.nama,
                    slug: form.slug,
                    deskripsi: form.deskripsi || undefined,
                    color: form.color,
                }
                const updated = await kategoriService.update(editTarget.id, payload)
                setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
                toast.success("Kategori berhasil diperbarui")
            } else {
                // Create
                const payload: CreateKategoriPayload = {
                    nama: form.nama,
                    slug: form.slug || generateSlug(form.nama),
                    deskripsi: form.deskripsi || undefined,
                    color: form.color,
                }
                const created = await kategoriService.create(payload)
                setCategories(prev => [...prev, created])
                toast.success("Kategori berhasil ditambahkan")
            }
            setDialogOpen(false)
        } catch (err: any) {
            const detail = err?.response?.data?.detail
            toast.error(detail ?? "Gagal menyimpan kategori")
        } finally {
            setSaving(false)
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async (categoryId: number) => {
        if (!confirm("Apakah anda yakin ingin menghapus kategori ini?")) return
        try {
            await kategoriService.delete(categoryId)
            setCategories(prev => prev.filter(c => c.id !== categoryId))
            toast.success("Kategori berhasil dihapus")
        } catch {
            toast.error("Gagal menghapus kategori")
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Kategori Surat</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola master data kategori untuk pengelompokan surat.
                    </p>
                </div>
                <Button onClick={openCreate}>
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
                                <TableHead>Slug</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Warna Label</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Tidak ada kategori.
                                    </TableCell>
                                </TableRow>
                            ) : categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.nama}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{category.slug}</TableCell>
                                    <TableCell>{category.deskripsi ?? "-"}</TableCell>
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
                                        {category.created_at
                                            ? format(new Date(category.created_at), "dd MMM yyyy", { locale: id })
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(category)}
                                                title="Edit kategori"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(category.id)}
                                                title="Hapus kategori"
                                            >
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

            {/* ── Create / Edit Dialog ─────────────────────────────────────────── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "Edit Kategori" : "Tambah Kategori"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Nama */}
                        <div className="space-y-1">
                            <Label htmlFor="cat-nama">Nama Kategori <span className="text-destructive">*</span></Label>
                            <Input
                                id="cat-nama"
                                placeholder="contoh: Surat Perintah"
                                value={form.nama}
                                onChange={e => handleNamaChange(e.target.value)}
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-1">
                            <Label htmlFor="cat-slug">Slug</Label>
                            <Input
                                id="cat-slug"
                                placeholder="surat-perintah"
                                value={form.slug}
                                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Digunakan sebagai ID unik. Akan digenerate otomatis dari nama.
                            </p>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1">
                            <Label htmlFor="cat-deskripsi">Deskripsi</Label>
                            <Textarea
                                id="cat-deskripsi"
                                placeholder="Deskripsi singkat kategori (opsional)"
                                rows={2}
                                value={form.deskripsi}
                                onChange={e => setForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                            />
                        </div>

                        {/* Warna */}
                        <div className="space-y-1">
                            <Label htmlFor="cat-color">Warna Label</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="cat-color"
                                    type="color"
                                    className="h-9 w-14 cursor-pointer rounded border p-1"
                                    value={form.color}
                                    onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                                />
                                <Input
                                    className="flex-1"
                                    placeholder="#3B82F6"
                                    value={form.color}
                                    onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={saving}>Batal</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
