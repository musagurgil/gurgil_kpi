import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    console.log('AuthPage useEffect:', { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      console.log('Navigating to /');
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get remembered email for personalized greeting
  const rememberedEmail = localStorage.getItem('remembered_email');
  const getPersonalizedGreeting = () => {
    if (!rememberedEmail) {
      return {
        title: 'Hoş Geldiniz!',
        subtitle: 'Kurumsal İş Takip Sistemi',
        description: 'Departmanlar arası iletişim ve KPI yönetimi'
      };
    }
    
    // Extract name from email (before @)
    const emailName = rememberedEmail.split('@')[0];
    const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    
    return {
      title: `Tekrar Hoş Geldiniz, ${capitalizedName}!`,
      subtitle: 'KPI Manager',
      description: 'Hesabınıza giriş yaparak devam edin'
    };
  };

  const greeting = getPersonalizedGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {greeting.title}
          </h1>
          <p className="text-lg font-semibold text-primary mb-1">
            {greeting.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {greeting.description}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm 
              onSuccess={() => navigate('/')}
              onSwitchToSignup={() => setActiveTab('signup')}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm 
              onSuccess={() => setActiveTab('login')}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
