import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratMasukForm } from "../components/SuratMasukForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuratMasukCreatePage() {
    return (
        <DashboardLayout>
            <div className="flex items-center space-x-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Tambah Surat Masuk</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulir Surat Masuk</CardTitle>
                    <CardDescription>
                        Masukkan data surat masuk baru. Pastikan nomor surat unik.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SuratMasukForm />
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}
