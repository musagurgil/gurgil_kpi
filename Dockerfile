# Gurgil KPI Management System - Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package.json ve package-lock.json'ı kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama dosyalarını kopyala
COPY . .

# Prisma client'ı oluştur
RUN npx prisma generate

# Port'u expose et
EXPOSE 3001

# Veritabanını oluştur ve seed et
RUN npx prisma db push && npm run db:seed

# Uygulamayı başlat
CMD ["npm", "start"]
