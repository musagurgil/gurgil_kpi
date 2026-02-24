import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';
import { BarChart3, Target, Users, TrendingUp } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Features */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute left-1/2 top-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Company */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">KPI Manager</h2>
              <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Gurgil Games</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-8 -mt-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Kurumsal Performans
                <br />
                <span className="text-white/80">Yönetim Sistemi</span>
              </h1>
              <p className="text-lg text-white/60 max-w-md leading-relaxed">
                KPI hedeflerini takip edin, departmanlar arası iletişimi güçlendirin
                ve şirket performansını analiz edin.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {[
                { icon: Target, label: 'KPI Takibi', desc: 'Hedef belirleme & analiz' },
                { icon: Users, label: 'Departman Yönetimi', desc: 'Takım koordinasyonu' },
                { icon: TrendingUp, label: 'Performans Analizi', desc: 'Detaylı raporlama' },
                { icon: BarChart3, label: 'Ticket Sistemi', desc: 'Destek & iletişim' },
              ].map((feature) => (
                <div key={feature.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{feature.label}</p>
                    <p className="text-xs text-white/50">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Gurgil Games. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-8 relative">
        {/* Subtle gradient overlay for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 lg:hidden" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile-only brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">KPI Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">Gurgil Games</p>
          </div>

          <LoginForm onSuccess={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}
