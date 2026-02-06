import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

const REMEMBER_ME_KEY = 'remembered_email';
const LAST_LOGIN_KEY = 'last_login_info';

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  // Get remembered email from localStorage
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
        } else if (diffDays < 7) {
          return `${diffDays} gün önce giriş yaptınız`;
        } else {
          return `${diffDays} gün önce giriş yaptınız`;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  };

  const lastLoginMessage = getLastLoginMessage();

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
        // Save email if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, credentials.email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
        
        // Save last login info
        const loginInfo = {
          email: credentials.email,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(loginInfo));
        
        console.log('Login successful, navigating to /');
        // Force page reload to ensure state is properly updated
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapmak için bilgilerinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@sirket.com"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Remember Me & Last Login Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Beni Hatırla
              </Label>
            </div>
            {lastLoginMessage && (
              <span className="text-xs text-muted-foreground">
                {lastLoginMessage}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Giriş Yapılıyor...
              </div>
            ) : (
              'Giriş Yap'
            )}
          </Button>

          {onSwitchToSignup && (
            <div className="text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={onSwitchToSignup}
              >
                Kayıt Olun
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
