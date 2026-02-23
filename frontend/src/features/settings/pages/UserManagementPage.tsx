import { useEffect, useState } from "react"
import { type User } from "../types"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { userService } from "@/services/userService"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { UserFormDialog } from "../components/UserFormDialog"

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editUser, setEditUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAll()
                setUsers(data)
            } catch (error) {
                console.error("Failed to fetch users:", error)
                toast.error("Gagal memuat data pengguna")
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleDelete = async (id: number) => {
        if (confirm("Apakah anda yakin ingin menghapus user ini?")) {
            try {
                await userService.delete(id)
                setUsers(users.filter(u => u.id !== id))
                toast.success("User berhasil dihapus")
            } catch (error) {
                console.error("Failed to delete user:", error)
                toast.error("Gagal menghapus user")
            }
        }
    }

    const handleOpenCreate = () => {
        setEditUser(null)
        setDialogOpen(true)
    }

    const handleOpenEdit = (user: User) => {
        setEditUser(user)
        setDialogOpen(true)
    }

    const handleSuccess = (user: User) => {
        if (editUser) {
            setUsers(prev => prev.map(u => u.id === user.id ? user : u))
        } else {
            setUsers(prev => [...prev, user])
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Manajemen User</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola akun pengguna yang memiliki akses ke sistem.
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah User
                </Button>
            </div>
            <Separator />

            {loading ? <TableSkeleton columns={4} /> : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
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

            <UserFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={editUser}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
