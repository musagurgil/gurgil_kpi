import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
// Settings functionality with mock data
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile settings
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [kpiNotifications, setKpiNotifications] = useState(true);
  const [ticketNotifications, setTicketNotifications] = useState(true);

  // Appearance settings
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('app-font-size') || 'normal';
  });

  // Apply theme and font size on mount and when changed
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fontSizes: Record<string, string> = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = fontSizes[fontSize] || '16px';
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mock profile update
      console.log('Updating profile:', { firstName, lastName });

      toast({
        title: 'Başarılı',
        description: 'Profil bilgileriniz güncellendi',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Mock password update
      console.log('Updating password');

      // No error handling needed for mock

      toast({
        title: 'Başarılı',
        description: 'Şifreniz güncellendi',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Şifre güncellenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    // Store in localStorage for now
    localStorage.setItem('notification_settings', JSON.stringify({
      emailNotifications,
      kpiNotifications,
      ticketNotifications
    }));

    toast({
      title: 'Başarılı',
      description: 'Bildirim ayarlarınız kaydedildi',
    });
  };

  return (
    <div className="flex-1 min-h-screen bg-dashboard-bg">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-brand px-6 py-10 mb-8 sm:rounded-b-3xl sm:mx-4 lg:mx-6 sm:mt-0 shadow-lg border-b border-white/10">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
        <div className="absolute -left-40 -top-40 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 tracking-tight mb-2">
              <span className="truncate drop-shadow-md">Ayarlar</span>
            </h1>
            <p className="text-base text-white/80 max-w-xl">
              Hesap ayarlarınızı ve uygulama tercihlerinizi yönetin.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 relative z-20 -mt-14">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/60 p-1 mb-6 rounded-xl border border-border/50 shadow-inner">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Güvenlik</TabsTrigger>
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            <TabsTrigger value="appearance">Görünüm</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="font-semibold text-foreground text-lg">Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    E-posta adresiniz değiştirilemez
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Adınız"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departman</Label>
                  <Input
                    id="department"
                    value={user?.department || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Departman bilginiz yönetici tarafından değiştirilebilir
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="font-semibold text-foreground text-lg">Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesap güvenliğiniz için güçlü bir şifre kullanın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="font-semibold text-foreground text-lg">Bildirim Tercihleri</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Önemli güncellemeler için e-posta alın
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="kpi-notif">KPI Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      KPI güncellemeleri ve deadline hatırlatmaları
                    </p>
                  </div>
                  <Switch
                    id="kpi-notif"
                    checked={kpiNotifications}
                    onCheckedChange={setKpiNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ticket-notif">Ticket Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni ticket atamaları ve güncellemeler
                    </p>
                  </div>
                  <Switch
                    id="ticket-notif"
                    checked={ticketNotifications}
                    onCheckedChange={setTicketNotifications}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    Tercihleri Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-md transition-all duration-300">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="font-semibold text-foreground text-lg">Görünüm Ayarları</CardTitle>
                <CardDescription>
                  Uygulamanın görünümünü özelleştirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Tema seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Açık</SelectItem>
                      <SelectItem value="dark">Koyu</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Uygulamanın renklerini değiştirin
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Yazı Boyutu</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Boyut seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Küçük (14px)</SelectItem>
                      <SelectItem value="normal">Normal (16px)</SelectItem>
                      <SelectItem value="large">Büyük (18px)</SelectItem>
                      <SelectItem value="xlarge">Çok Büyük (20px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Metin boyutunu ayarlayın
                  </p>
                </div>

                <Separator />

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Önizleme</p>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Başlık Örneği</p>
                    <p className="text-base">Normal metin örneği - Lorem ipsum dolor sit amet.</p>
                    <p className="text-sm text-muted-foreground">Küçük metin örneği</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
