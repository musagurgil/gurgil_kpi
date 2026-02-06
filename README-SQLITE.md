# Gurgil KPI Uygulaması - SQLite Versiyonu

Bu proje, Supabase yerine SQLite + Prisma kullanarak geliştirilmiş kurumsal KPI ve görev takip uygulamasıdır.

## 🚀 Özellikler

- **KPI Takibi**: Hedef belirleme, ilerleme kaydetme, yorum ekleme
- **Ticket Yönetimi**: Görev oluşturma, atama, durum takibi
- **Takvim**: Aktivite kaydetme, kategori yönetimi
- **Bildirimler**: Gerçek zamanlı bildirim sistemi
- **Admin Paneli**: Kullanıcı ve departman yönetimi
- **Rol Tabanlı Erişim**: Admin, Departman Müdürü, Çalışan rolleri

## 🛠️ Teknoloji Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Backend**: SQLite + Prisma ORM
- **Auth**: JWT (jsonwebtoken)
- **State Management**: React Query, React Hooks

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanını Oluşturun

```bash
# Prisma client'ı generate edin
npm run db:generate

# Migration'ları çalıştırın
npm run db:migrate

# Seed verilerini yükleyin
npm run db:seed
```

### 3. Uygulamayı Başlatın

```bash
npm run dev
```

## 🔐 Varsayılan Kullanıcılar

Seed işlemi sonrası aşağıdaki kullanıcılar oluşturulur:

- **Admin**: admin@gurgil.com (şifre: 123456)
- **Manager**: manager@gurgil.com (şifre: 123456)
- **Employee**: employee@gurgil.com (şifre: 123456)

## 📊 Veritabanı Yapısı

### Ana Tablolar

- **departments**: Departman bilgileri
- **profiles**: Kullanıcı profilleri
- **user_roles**: Kullanıcı rolleri
- **kpi_targets**: KPI hedefleri
- **kpi_progress**: KPI ilerleme kayıtları
- **tickets**: Görev/ticket kayıtları
- **calendar_activities**: Takvim aktiviteleri
- **notifications**: Bildirimler

### İlişkiler

- Her kullanıcının bir departmanı vardır
- KPI'lar departmanlara atanabilir
- Ticket'lar departmanlar arası gönderilebilir
- Kullanıcılar birden fazla role sahip olabilir

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Veritabanı studio'yu aç
npm run db:studio

# Yeni migration oluştur
npm run db:migrate

# Prisma client'ı yeniden generate et
npm run db:generate

# Seed verilerini yeniden yükle
npm run db:seed
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── auth/           # Kimlik doğrulama
│   ├── calendar/       # Takvim bileşenleri
│   ├── kpi/           # KPI bileşenleri
│   ├── tickets/       # Ticket bileşenleri
│   └── ui/            # UI bileşenleri
├── hooks/             # Custom React hooks
├── lib/               # Yardımcı kütüphaneler
│   ├── auth.ts        # Auth fonksiyonları
│   └── db.ts          # Prisma client
├── pages/             # Sayfa bileşenleri
├── types/             # TypeScript tip tanımları
└── utils/             # Yardımcı fonksiyonlar

prisma/
├── schema.prisma      # Veritabanı şeması
└── seed.ts           # Seed verileri
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rol tabanlı erişim kontrolü
- SQL injection koruması (Prisma ORM)
- XSS koruması (React)

## 🚀 Dağıtım

### Production Build

```bash
npm run build
```

### Environment Variables

Production için aşağıdaki environment değişkenlerini ayarlayın:

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=file:./production.db
```

## 📈 Performans

- SQLite dosya tabanlı veritabanı
- Prisma ORM ile optimize edilmiş sorgular
- React Query ile cache yönetimi
- Lazy loading ve code splitting

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:

1. Issues bölümünü kontrol edin
2. Yeni issue oluşturun
3. Detaylı hata mesajları ekleyin

## 🔄 Supabase'den Geçiş

Bu versiyon, orijinal Supabase tabanlı uygulamadan SQLite'a geçiş yapılmış halidir. Ana değişiklikler:

- Supabase client → Prisma ORM
- Supabase Auth → JWT Auth
- PostgreSQL → SQLite
- Realtime → Polling (isteğe bağlı)

Tüm UI ve iş mantığı aynı kalır, sadece veri katmanı değişir.
