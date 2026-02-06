#!/bin/bash

# Gurgil KPI Management System - Setup Script
# Bu script uygulamayı kurulum için hazırlar

echo "🚀 Gurgil KPI Management System - Kurulum Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı! Lütfen Node.js 18+ yükleyin.${NC}"
    echo "https://nodejs.org adresinden indirebilirsiniz."
    exit 1
fi

# Node.js versiyon kontrolü
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versiyonu 18+ olmalı! Mevcut versiyon: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) bulundu${NC}"

# npm kontrolü
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) bulundu${NC}"

# Bağımlılıkları yükle
echo -e "${BLUE}📦 Bağımlılıklar yükleniyor...${NC}"
npm install

# Prisma veritabanını oluştur
echo -e "${BLUE}🗄️ Veritabanı oluşturuluyor...${NC}"
npx prisma generate
npx prisma db push

# Veritabanını seed et
echo -e "${BLUE}🌱 Veritabanı verileri ekleniyor...${NC}"
npm run db:seed

# Build oluştur
echo -e "${BLUE}🏗️ Uygulama build ediliyor...${NC}"
npm run build

echo -e "${GREEN}🎉 Kurulum tamamlandı!${NC}"
echo ""
echo -e "${YELLOW}📋 Çalıştırma talimatları:${NC}"
echo "1. Backend server'ı başlatın: npm run server"
echo "2. Frontend'i başlatın: npm run dev"
echo "3. Tarayıcıda http://localhost:8080 adresine gidin"
echo ""
echo -e "${YELLOW}🔑 Varsayılan giriş bilgileri:${NC}"
echo "Admin: admin@gurgil.com / 123456"
echo "Manager: manager@gurgil.com / 123456"
echo "Employee: employee@gurgil.com / 123456"
echo ""
echo -e "${GREEN}✨ Gurgil KPI Management System hazır!${NC}"
