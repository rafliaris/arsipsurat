import { useEffect, useState } from "react"
import { settingsService } from "@/services/settingsService"
import type { AppSetting } from "@/features/settings/types"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/shared/TableSkeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Save, RotateCcw } from "lucide-react"

export default function AppSettingsPage() {
    const [settings, setSettings] = useState<AppSetting[]>([])
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getAll()
                setSettings(data)
                // Initialise edit values
                const values: Record<string, string> = {}
                data.forEach(s => { values[s.setting_key] = s.setting_value })
                setEditValues(values)
            } catch (error) {
                console.error("Failed to fetch settings:", error)
                toast.error("Gagal memuat konfigurasi aplikasi")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async (key: string) => {
        setSaving(key)
        try {
            const updated = await settingsService.update(key, editValues[key])
            setSettings(prev => prev.map(s => s.setting_key === key ? updated : s))
            toast.success(`Setting "${key}" berhasil disimpan`)
        } catch (error) {
            console.error("Failed to save setting:", error)
            toast.error("Gagal menyimpan setting")
        } finally {
            setSaving(null)
        }
    }

    const handleReset = async () => {
        if (!confirm("Reset semua setting ke nilai default? Tindakan ini tidak dapat dibatalkan.")) return
        try {
            await settingsService.reset()
            toast.success("Setting berhasil direset ke default")
            // Reload
            const data = await settingsService.getAll()
            setSettings(data)
            const values: Record<string, string> = {}
            data.forEach(s => { values[s.setting_key] = s.setting_value })
            setEditValues(values)
        } catch (error) {
            console.error("Failed to reset settings:", error)
            toast.error("Gagal mereset setting")
        }
    }

    const isDirty = (key: string) => {
        const original = settings.find(s => s.setting_key === key)?.setting_value
        return original !== editValues[key]
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Konfigurasi Aplikasi</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola pengaturan sistem dan konfigurasi global.
                    </p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Default
                </Button>
            </div>
            <Separator />

            {loading ? (
                <TableSkeleton columns={3} />
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Nilai</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead className="text-right">Simpan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.map((setting) => (
                                <TableRow key={setting.setting_key}>
                                    <TableCell>
                                        <div className="font-mono text-xs">{setting.setting_key}</div>
                                        {setting.description && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{setting.description}</div>
                                        )}
                                        {setting.is_public && (
                                            <Badge variant="outline" className="text-xs mt-1">publik</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="w-64">
                                        <Input
                                            value={editValues[setting.setting_key] ?? ""}
                                            onChange={e => setEditValues(prev => ({
                                                ...prev,
                                                [setting.setting_key]: e.target.value,
                                            }))}
                                            className="h-8 text-sm"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {setting.setting_type ?? "string"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={isDirty(setting.setting_key) ? "default" : "ghost"}
                                            disabled={!isDirty(setting.setting_key) || saving === setting.setting_key}
                                            onClick={() => handleSave(setting.setting_key)}
                                            className="h-7 text-xs"
                                        >
                                            <Save className="h-3 w-3 mr-1" />
                                            {saving === setting.setting_key ? "Menyimpan..." : "Simpan"}
                                        </Button>
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
