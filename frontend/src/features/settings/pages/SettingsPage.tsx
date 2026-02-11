import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Informasi akun profil anda.
                </p>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
                <p>Fitur edit profil akan segera hadir.</p>
                {/* Future: Add profile form here */}
            </div>
        </div>
    )
}
