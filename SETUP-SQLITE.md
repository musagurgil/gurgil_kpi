# SQLite Kurulum Talimatları

## 🚀 Hızlı Başlangıç

### 1. Node.js Kurulumu (Eğer yoksa)

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (Homebrew)
brew install node

# Windows (Chocolatey)
choco install nodejs
```

### 2. Proje Kurulumu

```bash
# Bağımlılıkları yükle
npm install

# Prisma client'ı generate et
npm run db:generate

# Veritabanını oluştur ve migration'ları çalıştır
npm run db:migrate

# Seed verilerini yükle
npm run db:seed

# Uygulamayı başlat
npm run dev
```

### 3. Veritabanı Yönetimi

```bash
# Prisma Studio'yu aç (veritabanı GUI)
npm run db:studio

# Yeni migration oluştur
npm run db:migrate

# Seed verilerini yeniden yükle
npm run db:seed
```

## 🔐 Varsayılan Kullanıcılar

Seed işlemi sonrası oluşturulan kullanıcılar:

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@gurgil.com | 123456 | Admin |
| manager@gurgil.com | 123456 | Departman Müdürü |
| employee@gurgil.com | 123456 | Çalışan |

## 📊 Veritabanı Dosyası

- **Konum**: `./dev.db`
- **Format**: SQLite
- **Yedekleme**: Dosyayı kopyalayın
- **Geri yükleme**: Dosyayı yerine koyun

## 🛠️ Geliştirme

### Yeni Migration Oluşturma

```bash
# Schema'yı değiştirdikten sonra
npm run db:migrate

# Migration dosyası otomatik oluşturulur
# prisma/migrations/[timestamp]_[name]/migration.sql
```

### Seed Verilerini Güncelleme

`prisma/seed.ts` dosyasını düzenleyin ve çalıştırın:

```bash
npm run db:seed
```

### Veritabanını Sıfırlama

```bash
# Veritabanını sil
rm dev.db

# Migration'ları yeniden çalıştır
npm run db:migrate

# Seed verilerini yükle
npm run db:seed
```

## 🔧 Sorun Giderme

### Prisma Client Hatası

```bash
npm run db:generate
```

### Migration Hatası

```bash
# Migration'ları sıfırla
rm -rf prisma/migrations
npm run db:migrate
```

### Veritabanı Kilitli Hatası

```bash
# Uygulamayı durdurun ve tekrar başlatın
# Veya veritabanı dosyasını silin ve yeniden oluşturun
```

## 📁 Dosya Yapısı

```
prisma/
├── schema.prisma      # Veritabanı şeması
├── seed.ts           # Seed verileri
└── migrations/       # Migration dosyaları
    └── [timestamp]_[name]/
        └── migration.sql

src/
├── lib/
│   ├── auth.ts       # JWT auth fonksiyonları
│   └── db.ts         # Prisma client
└── hooks/            # Veri yönetimi hooks'ları
```

## 🚀 Production Kurulumu

### 1. Environment Variables

```env
JWT_SECRET=your-super-secret-production-key
DATABASE_URL=file:./production.db
```

### 2. Build

```bash
npm run build
```

### 3. Veritabanı

```bash
# Production migration
NODE_ENV=production npm run db:migrate

# Production seed (isteğe bağlı)
NODE_ENV=production npm run db:seed
```

## 📈 Performans İpuçları

1. **Index'ler**: Prisma otomatik oluşturur
2. **Connection Pooling**: SQLite tek dosya olduğu için gerekli değil
3. **Backup**: Düzenli olarak `dev.db` dosyasını yedekleyin
4. **Monitoring**: Prisma Studio ile veritabanını izleyin

## 🔒 Güvenlik

1. **JWT Secret**: Güçlü bir secret key kullanın
2. **Veritabanı**: `dev.db` dosyasını güvenli tutun
3. **Environment**: `.env` dosyasını git'e eklemeyin
4. **Backup**: Veritabanı yedeklerini şifreleyin

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. Bu dosyayı kontrol edin
2. README-SQLITE.md'yi okuyun
3. Issues bölümünde arama yapın
4. Yeni issue oluşturun
