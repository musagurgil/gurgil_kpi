import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle, LogIn, Shield } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

const REMEMBER_ME_KEY = 'remembered_email';
const LAST_LOGIN_KEY = 'last_login_info';

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY) || '';
  const lastLoginInfo = localStorage.getItem(LAST_LOGIN_KEY);

  const [credentials, setCredentials] = useState({
    email: rememberedEmail,
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(!!rememberedEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const getLastLoginMessage = () => {
    if (!lastLoginInfo || !credentials.email) return null;
    try {
      const info = JSON.parse(lastLoginInfo);
      if (info.email === credentials.email) {
        const lastLogin = new Date(info.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - lastLogin.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins < 5 ? 'Az önce giriş yaptınız' : `${diffMins} dakika önce giriş yaptınız`;
          }
          return `${diffHours} saat önce giriş yaptınız`;
        } else if (diffDays === 1) {
          return 'Dün giriş yaptınız';
        }
        return `${diffDays} gün önce giriş yaptınız`;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  };

  const lastLoginMessage = getLastLoginMessage();

  // Personalized greeting
  const getGreeting = () => {
    if (!rememberedEmail) return 'Hesabınıza Giriş Yapın';
    const name = rememberedEmail.split('@')[0];
    return `Tekrar Hoş Geldiniz, ${name.charAt(0).toUpperCase() + name.slice(1)}!`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Lütfen e-posta ve şifrenizi girin');
      return;
    }

    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, credentials.email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }

        localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify({
          email: credentials.email,
          timestamp: new Date().toISOString()
        }));

        window.location.href = '/';
      }
    } catch (error: any) {
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          {getGreeting()}
        </h2>
        <p className="text-sm text-muted-foreground">
          Devam etmek için kurumsal hesap bilgilerinizi girin
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl shadow-black/5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">E-posta Adresi</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@gurgil.com"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              required
              className="h-11 bg-background/50 border-border/50 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                required
                className="h-11 pr-11 bg-background/50 border-border/50 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-colors"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Remember Me & Last Login */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer text-muted-foreground"
              >
                Beni Hatırla
              </Label>
            </div>
            {lastLoginMessage && (
              <span className="text-xs text-muted-foreground/60 italic">
                {lastLoginMessage}
              </span>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Giriş Yapılıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
        <Shield className="w-3 h-3" />
        <span>Güvenli bağlantı ile korunmaktadır</span>
      </div>
    </div>
  );
}
