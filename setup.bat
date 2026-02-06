@echo off
REM Gurgil KPI Management System - Windows Setup Script
REM Bu script uygulamayı kurulum için hazırlar

echo 🚀 Gurgil KPI Management System - Kurulum Başlatılıyor...

REM Node.js kontrolü
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js bulunamadı! Lütfen Node.js 18+ yükleyin.
    echo https://nodejs.org adresinden indirebilirsiniz.
    pause
    exit /b 1
)

echo ✅ Node.js bulundu

REM npm kontrolü
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm bulunamadı!
    pause
    exit /b 1
)

echo ✅ npm bulundu

REM Bağımlılıkları yükle
echo 📦 Bağımlılıklar yükleniyor...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Bağımlılık yükleme hatası!
    pause
    exit /b 1
)

REM Prisma veritabanını oluştur
echo 🗄️ Veritabanı oluşturuluyor...
call npx prisma generate
call npx prisma db push

REM Veritabanını seed et
echo 🌱 Veritabanı verileri ekleniyor...
call npm run db:seed

REM Build oluştur
echo 🏗️ Uygulama build ediliyor...
call npm run build

echo 🎉 Kurulum tamamlandı!
echo.
echo 📋 Çalıştırma talimatları:
echo 1. Backend server'ı başlatın: npm run server
echo 2. Frontend'i başlatın: npm run dev
echo 3. Tarayıcıda http://localhost:8080 adresine gidin
echo.
echo 🔑 Varsayılan giriş bilgileri:
echo Admin: admin@gurgil.com / 123456
echo Manager: manager@gurgil.com / 123456
echo Employee: employee@gurgil.com / 123456
echo.
echo ✨ Gurgil KPI Management System hazır!
pause
