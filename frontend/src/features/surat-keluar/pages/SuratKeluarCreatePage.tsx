import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { SuratKeluarForm } from "../components/SuratKeluarForm"

export default function SuratKeluarCreatePage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Buat Surat Keluar</h2>
                    <p className="text-muted-foreground">
                        Upload file surat — sistem akan otomatis membaca dan mengisi data. Nomor surat di-generate otomatis.
                    </p>
                </div>
                <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
                    <SuratKeluarForm />
                </div>
            </div>
        </DashboardLayout>
    )
}
