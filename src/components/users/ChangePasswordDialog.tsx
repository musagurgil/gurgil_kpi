import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, KeyRound, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ChangePasswordDialogProps {
    userId: string;
    userName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ userId, userName, open, onOpenChange }: ChangePasswordDialogProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false);
    };

    // Password strength checker
    const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: 'Zayıf', color: 'bg-red-500' };
        if (score <= 2) return { level: 2, label: 'Orta', color: 'bg-orange-500' };
        if (score <= 3) return { level: 3, label: 'İyi', color: 'bg-yellow-500' };
        if (score <= 4) return { level: 4, label: 'Güçlü', color: 'bg-green-500' };
        return { level: 5, label: 'Çok Güçlü', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword) {
            setError('Lütfen yeni şifreyi girin');
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        setLoading(true);

        try {
            await apiClient.adminResetPassword(userId, newPassword);

            toast({
                title: "Başarılı",
                description: `${userName} kullanıcısının şifresi başarıyla güncellendi.`,
            });

            resetForm();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || 'Şifre güncellenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md overflow-hidden p-0">
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-5">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:12px_12px]" />
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-white flex items-center gap-2 text-lg">
                            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <KeyRound className="w-5 h-5 text-white" />
                            </div>
                            Şifre Değiştir
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm">
                            <strong>{userName}</strong> kullanıcısının şifresini değiştirin.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* New password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                            Yeni Şifre
                        </Label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                                placeholder="Yeni şifre girin..."
                                className="pl-10 pr-10"
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Strength indicator */}
                        {newPassword && (
                            <div className="space-y-1.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.level ? passwordStrength.color : 'bg-muted'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Şifre gücü: <span className="font-medium">{passwordStrength.label}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Şifre Tekrar
                        </Label>
                        <div className="relative">
                            <CheckCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${confirmPassword && confirmPassword === newPassword ? 'text-green-500' : 'text-muted-foreground'
                                }`} />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                                placeholder="Şifreyi tekrar girin..."
                                className="pl-10"
                                disabled={loading}
                            />
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-destructive">Şifreler eşleşmiyor</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                            disabled={loading || !newPassword || newPassword !== confirmPassword}
                        >
                            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
