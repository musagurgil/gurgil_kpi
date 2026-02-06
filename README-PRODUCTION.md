# Gurgil KPI Management System - Production Guide

## 🚀 Hızlı Başlangıç

### Linux/macOS Kurulumu
```bash
# Kurulum script'ini çalıştır
chmod +x setup.sh
./setup.sh

# Uygulamayı başlat
npm run dev
```

### Windows Kurulumu
```cmd
# Kurulum script'ini çalıştır
setup.bat

# Uygulamayı başlat
npm run dev
```

### Docker ile Kurulum
```bash
# Docker Compose ile başlat
docker-compose up -d

# Veya Docker ile
docker build -t gurgil-kpi .
docker run -p 3001:3001 gurgil-kpi
```

## 🔧 Sistem Gereksinimleri

- **Node.js**: 18.0.0 veya üzeri
- **npm**: 8.0.0 veya üzeri
- **RAM**: Minimum 512MB
- **Disk**: Minimum 100MB boş alan
- **İşletim Sistemi**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

## 📋 Kurulum Adımları

### 1. Otomatik Kurulum (Önerilen)
```bash
# Linux/macOS
./setup.sh

# Windows
setup.bat
```

### 2. Manuel Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Veritabanını oluştur
npx prisma generate
npx prisma db push

# Veritabanını seed et
npm run db:seed

# Uygulamayı başlat
npm run dev
```

## 🌐 Erişim Bilgileri

- **URL**: http://localhost:3001
- **Admin**: admin@gurgil.com / 123456
- **Manager**: manager@gurgil.com / 123456
- **Employee**: employee@gurgil.com / 123456

## 🔒 Güvenlik

### Production Ortamında
1. **JWT Secret'ı değiştirin**:
   ```bash
   export JWT_SECRET="your-super-secret-key-here"
   ```

2. **Veritabanı şifrelemesi**:
   - SQLite dosyasını şifreleyin
   - Backup'ları güvenli yerde saklayın

3. **HTTPS kullanın**:
   - Reverse proxy (nginx) ile HTTPS yapılandırın
   - SSL sertifikası kullanın

## 📊 Veritabanı Yönetimi

### Backup Alma
```bash
# SQLite veritabanını yedekle
cp prisma/dev.db backup-$(date +%Y%m%d).db
```

### Veritabanını Sıfırlama
```bash
# Veritabanını sil ve yeniden oluştur
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Prisma Studio ile Yönetim
```bash
# Veritabanı yönetim arayüzü
npx prisma studio
```

## 🐳 Docker Deployment

### Docker Compose ile
```bash
# Servisleri başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f

# Servisleri durdur
docker-compose down
```

### Docker ile
```bash
# Image oluştur
docker build -t gurgil-kpi .

# Container çalıştır
docker run -d -p 3001:3001 --name gurgil-kpi gurgil-kpi

# Container durdur
docker stop gurgil-kpi
docker rm gurgil-kpi
```

## 🔧 Yapılandırma

### Environment Variables
```bash
# .env dosyası oluştur
NODE_ENV=production
JWT_SECRET=your-secret-key
PORT=3001
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 Performans Optimizasyonu

### Production Build
```bash
# Production build oluştur
./build-production.sh

# Production klasöründe çalıştır
cd production
npm start
```

### Monitoring
- **Logs**: `npm start` çıktısını takip edin
- **Health Check**: `http://localhost:3001/api/dashboard/stats`
- **Resource Usage**: `htop` veya `top` ile takip edin

## 🆘 Sorun Giderme

### Yaygın Sorunlar

1. **Port 3001 kullanımda**:
   ```bash
   # Port'u değiştir
   PORT=3002 npm start
   ```

2. **Veritabanı hatası**:
   ```bash
   # Veritabanını yeniden oluştur
   rm prisma/dev.db
   npx prisma db push
   npm run db:seed
   ```

3. **Bağımlılık hatası**:
   ```bash
   # node_modules'ı sil ve yeniden yükle
   rm -rf node_modules package-lock.json
   npm install
   ```

### Log Dosyaları
```bash
# Uygulama logları
npm start > app.log 2>&1

# Hata logları
npm start 2> error.log
```

## 📞 Destek

- **Dokümantasyon**: README.md
- **Issues**: GitHub Issues
- **Email**: support@gurgil.com

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Gurgil KPI Management System v1.0.0**  
© 2024 Gurgil. Tüm hakları saklıdır.
