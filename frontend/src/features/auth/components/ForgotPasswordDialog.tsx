import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Phone, Mail } from "lucide-react"

interface ForgotPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Lupa Password
                    </DialogTitle>
                    <DialogDescription>
                        Sistem ini tidak menggunakan reset password via email.
                        Hubungi administrator untuk mereset password Anda.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        Administrator dapat mereset password Anda melalui panel manajemen pengguna.
                        Setelah di-reset, Anda akan menerima password sementara yang harus segera diganti.
                    </p>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <p className="text-sm font-medium">Hubungi Administrator:</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>Hubungi langsung admin sistem</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span>Informasikan username atau email akun Anda</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Mengerti</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
