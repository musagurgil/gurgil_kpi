#!/bin/bash

# Gurgil KPI Management System - Production Build Script
# Bu script production için uygulamayı build eder

echo "🏗️ Gurgil KPI Management System - Production Build Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

# Environment variables
export NODE_ENV=production

# Bağımlılıkları yükle
echo -e "${BLUE}📦 Bağımlılıklar yükleniyor...${NC}"
npm install

# Prisma generate
echo -e "${BLUE}🗄️ Prisma client oluşturuluyor...${NC}"
npx prisma generate

# Veritabanını oluştur
echo -e "${BLUE}🗄️ Veritabanı oluşturuluyor...${NC}"
npx prisma db push

# Veritabanını seed et
echo -e "${BLUE}🌱 Veritabanı verileri ekleniyor...${NC}"
npm run db:seed

# Frontend build
echo -e "${BLUE}🏗️ Frontend build ediliyor...${NC}"
npm run build

# Production klasörü oluştur
echo -e "${BLUE}📁 Production klasörü oluşturuluyor...${NC}"
mkdir -p production
cp -r dist production/
cp -r prisma production/
cp -r node_modules production/
cp package.json production/
cp server.js production/
cp setup.sh production/
cp setup.bat production/
cp README.md production/

# Production package.json oluştur
cat > production/package.json << EOF
{
  "name": "gurgil-kpi-management",
  "version": "1.0.0",
  "description": "Gurgil KPI Management System - Production Build",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "concurrently \"node server.js\" \"vite\"",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed"
  },
  "prisma": {
    "seed": "node prisma/seed.cjs"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "concurrently": "^8.2.2"
  }
}
EOF

echo -e "${GREEN}🎉 Production build tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}📁 Production dosyaları 'production' klasöründe oluşturuldu${NC}"
echo -e "${YELLOW}📋 Çalıştırma talimatları:${NC}"
echo "1. production klasörüne gidin: cd production"
echo "2. Uygulamayı başlatın: npm start"
echo "3. Tarayıcıda http://localhost:3001 adresine gidin"
echo ""
echo -e "${GREEN}✨ Production build hazır!${NC}"
