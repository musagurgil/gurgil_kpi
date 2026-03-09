import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { DEPARTMENTS, ROLES } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Edit2, KeyRound } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: 'admin' | 'department_manager' | 'employee';
  isActive: boolean;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const { hasRole, user: currentUser, refreshAuth } = useAuth();
  const { updateUserPassword } = useAdmin();
  
  // States for general info
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'employee' as User['role'],
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // States for password reset
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        role: user.role,
        isActive: user.isActive
      });
      setNewPassword('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      await apiClient.updateProfile(user.id, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        roles: [formData.role]
      });

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla güncellendi"
      });

      if (user.id === currentUser?.id) {
        await refreshAuth();
      }

      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('[EditUserDialog] Error updating profile:', error);
      let errorMessage = 'Kullanıcı güncellenemedi';
      if (error.message) errorMessage = error.message;
      setError(errorMessage);
      toast({ title: "Hata", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsResettingPassword(true);
    setError('');

    try {
      await updateUserPassword(user.id, newPassword);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlanırken hata oluştu');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-6 py-5 shrink-0">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:12px_12px]" />
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-white flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              Kullanıcı Düzenle
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              <strong>{user?.firstName} {user?.lastName}</strong> kullanıcı bilgilerini düzenleyin.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departman</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  disabled={loading}
                />
                <Label htmlFor="isActive">Aktif kullanıcı</Label>
              </div>
            </div>

            {/* Admin Password Reset Section */}
            {isAdmin && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Şifre İşlemleri (Sadece Yönetici)
                </h3>
                
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Kullanıcının şifresini güvenli bir şekilde sıfırlayabilirsiniz. Yeni şifre en az 6 karakter olmalıdır.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Yeni şifreyi girin"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isResettingPassword}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        disabled={!newPassword || newPassword.length < 6 || isResettingPassword}
                        onClick={handlePasswordReset}
                      >
                        {isResettingPassword ? "Sıfırlanıyor..." : "Şifreyi Güncelle"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10 shrink-0">
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white"
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : 'Profili Kaydet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}