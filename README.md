# KPI Manager - Performans Yönetim Sistemi

**Geliştirici:** Musa Gürgil | **Şirket:** Gurgil Games

## Proje Bilgileri

**URL**: https://lovable.dev/projects/8f3f4a81-15a8-4be5-ae42-5f91720795a4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8f3f4a81-15a8-4be5-ae42-5f91720795a4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8f3f4a81-15a8-4be5-ae42-5f91720795a4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## 🚀 Yerel Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Prisma veritabanını oluştur
npx prisma generate
npx prisma db push

# 3. Seed data'yı yükle (test kullanıcıları)
npm run db:seed

# 4. Geliştirme ortamını başlat
npm run dev:full

# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

---

## 🔑 Test Kullanıcıları

Sistem seed data ile birlikte 4 test kullanıcısı oluşturur:

| Rol | Email | Şifre | Departman | Açıklama |
|-----|-------|-------|-----------|----------|
| **Admin** | admin@gurgil.com | 123456 | İnsan Kaynakları | Tüm yetkilere sahip |
| **Department Manager** | manager@gurgil.com | 123456 | Bilgi İşlem | Bilgi İşlem yöneticisi |
| **Department Manager** | musa@gurgil.com | 123456 | IT | IT departman yöneticisi |
| **Employee** | employee@gurgil.com | 123456 | Bilgi İşlem | Normal çalışan |

---

## 📚 Geliştirici Dokümantasyonu

Detaylı geliştirici dokümantasyonu için: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

**Dokümantasyon İçeriği:**
- 🏗️ Mimari yapı
- 🗄️ Veritabanı şeması
- 🔐 Yetkilendirme sistemi
- 🔌 API endpoints
- 🎨 UI bileşenleri
- 🔧 Geliştirme notları
