import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "../components/ProfileForm"

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
            <div className="lg:max-w-2xl">
                <ProfileForm />
            </div>
        </div>
    )
}
