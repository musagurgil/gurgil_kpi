# Gurgil KPI Manager - Geliştirici Dokümantasyonu

## 📋 Genel Bakış

**Gurgil KPI Manager**, şirketlerde yerelde çalışan bir KPI, ticket ve çalışma takvimi yönetim sistemidir. Sistem, admin, departman yöneticisi ve çalışan rollerine sahip kullanıcılar için farklı yetki seviyeleri sunar.

## 🏗️ Mimari Genel Bakış

### Teknoloji Stack

**Backend:**
- Node.js + Express.js
- Prisma ORM (SQLite veritabanı)
- JWT (JSON Web Token) authentication
- bcryptjs (şifreleme)

**Frontend:**
- React 18.3
- TypeScript 5.9
- Vite (build tool)
- React Router v6
- TanStack Query (React Query)

**UI Framework:**
- Tailwind CSS
- shadcn/ui (Radix UI bileşenleri)
- Lucide React (iconlar)

**Araçlar:**
- ESLint
- Docker (production için)
- concurrently (dev ve server'ı birlikte çalıştırma)

---

## 📁 Proje Yapısı

```
gurgil-kpi-main/
├── prisma/                 # Veritabanı şeması ve seed data
│   ├── schema.prisma       # Prisma şeması (modeller)
│   ├── seed.js             # Başlangıç verileri
│   ├── dev.db              # SQLite veritabanı
│   └── migrations/         # Veritabanı migration'ları
│
├── src/
│   ├── components/         # React bileşenleri
│   │   ├── admin/          # Admin paneli bileşenleri
│   │   ├── auth/           # Giriş/kayıt bileşenleri
│   │   ├── calendar/       # Takvim bileşenleri
│   │   ├── common/         # Ortak bileşenler
│   │   ├── dashboard/      # Dashboard bileşenleri
│   │   ├── departments/    # Departman yönetimi
│   │   ├── kpi/            # KPI bileşenleri
│   │   ├── layout/         # Layout ve sidebar
│   │   ├── notifications/  # Bildirimler
│   │   ├── tickets/        # Ticket yönetimi
│   │   ├── ui/             # shadcn/ui bileşenleri (50+ bileşen)
│   │   └── users/          # Kullanıcı yönetimi
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Kimlik doğrulama
│   │   ├── useKPI.ts       # KPI işlemleri
│   │   ├── useTickets.ts   # Ticket işlemleri
│   │   ├── useCalendar.ts  # Takvim işlemleri
│   │   ├── useNotifications.ts # Bildirimler
│   │   ├── useAdmin.ts     # Admin işlemleri
│   │   └── useDashboard.ts # Dashboard verileri
│   │
│   ├── lib/                # Utility fonksiyonlar
│   │   ├── api.ts          # API client
│   │   ├── auth.ts         # Auth yardımcıları
│   │   ├── db.ts           # Prisma client
│   │   └── utils.ts        # Genel yardımcılar
│   │
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── Dashboard.tsx
│   │   ├── KPITracking.tsx
│   │   ├── Tickets.tsx
│   │   ├── Calendar.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── Analytics.tsx
│   │   ├── Reports.tsx
│   │   ├── Users.tsx
│   │   ├── Notifications.tsx
│   │   └── Settings.tsx
│   │
│   ├── types/              # TypeScript tipleri
│   │   ├── kpi.ts
│   │   ├── ticket.ts
│   │   ├── user.ts
│   │   ├── calendar.ts
│   │   └── admin.ts
│   │
│   ├── App.tsx             # Ana uygulama bileşeni
│   └── main.tsx             # Uygulama entry point
│
├── server.js               # Express backend server
├── package.json            # Proje bağımlılıkları
├── vite.config.ts          # Vite yapılandırması
├── tailwind.config.ts      # Tailwind yapılandırması
├── docker-compose.yml      # Docker compose dosyası
└── Dockerfile              # Docker image tanımı
```

---

## 🔐 Yetkilendirme Sistemi (Authentication & Authorization)

### Roller ve Yetkiler

Sistem 3 ana rol destekler:

#### 1. **Admin** (Yönetici)
- ✅ Tüm KPI'ları görüntüleyebilir
- ✅ KPI oluşturabilir, düzenleyebilir, silebilir
- ✅ Tüm departmanların verilerine erişim
- ✅ Kullanıcı yönetimi (oluşturma, düzenleme, silme)
- ✅ Departman yönetimi
- ✅ Tüm ticketları görebilir ve yönetebilir
- ✅ Tüm aktiviteleri görebilir

#### 2. **Department Manager** (Departman Yöneticisi)
- ✅ Sadece kendi departmanının KPI'larını görebilir
- ✅ Kendi departmanı için KPI oluşturabilir, düzenleyebilir, silebilir
- ✅ Kendi departmanının çalışanlarını görebilir
- ✅ Kendi departmanının aktivitelerini görebilir
- ✅ Ticket oluşturabilir ve departman bazlı yönetebilir
- ✅ KPI ilerlemesi kaydedebilir
- ❌ Admin paneli erişimi yok
- ❌ Kullanıcı oluşturma yetkisi yok

#### 3. **Employee** (Çalışan)
- ✅ Sadece kendisine atanan KPI'ları görebilir
- ✅ Kendi KPI ilerlemesini kaydedebilir
- ✅ Ticket oluşturabilir
- ✅ Kendi aktivitelerini yönetebilir
- ❌ KPI oluşturma, düzenleme, silme yetkisi yok
- ❌ Diğer kullanıcıların verilerini göremez
- ❌ Admin/departman yöneticisi özelliklerine erişim yok

### Yetkilendirme Implementasyonu

**ProtectedRoute Bileşeni:**
```typescript
// src/components/auth/ProtectedRoute.tsx
- Role-based routing
- Department-based access control
- Loading states
```

**useAuth Hook:**
```typescript
// src/hooks/useAuth.ts
- hasRole(role: string): boolean
- hasPermission(requiredRole: string): boolean
- canAccessDepartment(department: string): boolean
```

**Backend Yetkilendirme:**
- JWT token kontrolü (`server.js`)
- Token içinde kullanıcı bilgileri ve rolleri
- Her API endpoint'inde yetki kontrolü

---

## 🗄️ Veritabanı Yapısı (Database Schema)

### Ana Tablolar

#### 1. **Department** (Departmanlar)
```prisma
model Department {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  profiles     Profile[]
  kpiTargets   KpiTarget[]
}
```

#### 2. **Profile** (Kullanıcı Profilleri)
```prisma
model Profile {
  id         String    @id @default(cuid())
  email      String    @unique
  firstName  String
  lastName   String
  department String
  avatar     String?
  isActive   Boolean   @default(true)
  lastLogin  DateTime?
  createdAt  DateTime  @default(now())
  
  userRoles     UserRole[]
  kpiTargets    KpiTarget[]
  kpiAssignments KpiAssignment[]
  ticketsCreated Ticket[]
  ticketsAssigned Ticket[]
  calendarActivities CalendarActivity[]
  notifications Notification[]
}
```

#### 3. **UserRole** (Kullanıcı Rolleri)
```prisma
model UserRole {
  id     String   @id @default(cuid())
  userId String
  role   String   // admin, department_manager, employee
  createdAt DateTime @default(now())
  
  user Profile @relation(...)
  
  @@unique([userId, role])
}
```

#### 4. **KpiTarget** (KPI Hedefleri)
```prisma
model KpiTarget {
  id          String     @id @default(cuid())
  title       String
  description String?
  department  String
  targetValue Float
  currentValue Float     @default(0)
  unit        String
  startDate   String
  endDate     String
  period      String     // monthly, quarterly, yearly
  priority    String     // low, medium, high, critical
  status      String     @default("active")
  createdBy   String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @default(now())
  
  departmentRef Department @relation(...)
  creator       Profile    @relation(...)
  assignments   KpiAssignment[]
  progress      KpiProgress[]
  comments      KpiComment[]
}
```

#### 5. **Ticket** (Biletler/Destek Talepleri)
```prisma
model Ticket {
  id              String        @id @default(cuid())
  title           String
  description     String
  priority        String        // low, medium, high, urgent
  status          String        @default("open")
  sourceDepartment String
  targetDepartment String
  createdBy       String
  assignedTo      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now())
  resolvedAt      DateTime?
  closedAt        DateTime?
  
  sourceDepartmentRef Department @relation(...)
  targetDepartmentRef Department @relation(...)
  creator              Profile   @relation(...)
  assignee             Profile?  @relation(...)
  comments             TicketComment[]
}
```

#### 6. **CalendarActivity** (Aktiviteler)
```prisma
model CalendarActivity {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  date        String
  startTime   String?
  endTime     String?
  duration    Int
  categoryId  String?
  createdAt   DateTime @default(now())
  
  user     Profile           @relation(...)
  category CalendarCategory? @relation(...)
}
```

### İlişkiler (Relationships)

```
Profile (1) ──→ (Many) UserRole
Profile (1) ──→ (Many) KpiAssignment
KpiTarget (1) ──→ (Many) KpiProgress
KpiTarget (1) ──→ (Many) KpiComment
Department (1) ──→ (Many) Profile
Department (1) ──→ (Many) KpiTarget
Ticket (Many) ──→ (1) Profile (creator)
Ticket (Many) ──→ (1) Profile (assignee)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/signup` - Yeni kullanıcı kaydı

### KPI Endpoints
- `GET /api/kpis` - Tüm KPI'ları getir (yetkiye göre filtrelenmiş)
- `POST /api/kpis` - Yeni KPI oluştur
- `PUT /api/kpis/:id` - KPI güncelle
- `DELETE /api/kpis/:id` - KPI sil
- `POST /api/kpis/:id/progress` - KPI ilerlemesi kaydet
- `POST /api/kpis/:id/comments` - KPI'ya yorum ekle

### Ticket Endpoints
- `GET /api/tickets` - Ticket'ları getir (departmana göre filtrelenmiş)
- `POST /api/tickets` - Yeni ticket oluştur
- `PUT /api/tickets/:id` - Ticket güncelle
- `POST /api/tickets/:id/comments` - Ticket'a yorum ekle
- `GET /api/tickets/:id/comments` - Ticket yorumlarını getir

### Calendar Endpoints
- `GET /api/calendar/activities` - Aktiviteleri getir (role'e göre)
- `POST /api/calendar/activities` - Aktivite oluştur
- `PUT /api/calendar/activities/:id` - Aktivite güncelle
- `DELETE /api/calendar/activities/:id` - Aktivite sil

### Admin Endpoints
- `GET /api/admin/profiles` - Tüm profilleri getir
- `POST /api/admin/profiles` - Yeni profil oluştur
- `PUT /api/admin/profiles/:id` - Profil güncelle
- `DELETE /api/admin/profiles/:id` - Profil sil

### Departments
- `GET /api/departments` - Tüm departmanlar
- `POST /api/departments` - Yeni departman oluştur

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri

### Notifications
- `GET /api/notifications` - Kullanıcının bildirimlerini getir

---

## 🎨 Frontend Mimari

### Routing (React Router v6)

```typescript
// src/App.tsx
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  
  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/kpi" element={<KPITracking />} />
    <Route path="/tickets" element={<Tickets />} />
    
    <Route path="/analytics" element={
      <ProtectedRoute requiredRole="department_manager">
        <Analytics />
      </ProtectedRoute>
    } />
    
    <Route path="/admin" element={
      <ProtectedRoute requiredRole="admin">
        <AdminPanel />
      </ProtectedRoute>
    } />
  </Route>
</Routes>
```

### Custom Hooks Pattern

**useKPI Hook:**
```typescript
// src/hooks/useKPI.ts
- kpiStats: KPIStats[]
- loading: boolean
- error: string | null
- createKPI(data)
- updateKPI(id, data)
- deleteKPI(id)
- recordProgress(kpiId, value, note)
- addComment(kpiId, content)
```

**useAuth Hook:**
```typescript
// src/hooks/useAuth.ts
- user: AuthUser | null
- isAuthenticated: boolean
- loading: boolean
- login(email, password)
- logout()
- hasRole(role)
- hasPermission(role)
- canAccessDepartment(dep)
```

### Component Hierarchy

```
App
├── QueryClientProvider
│   ├── TooltipProvider
│   │   ├── Toaster
│   │   ├── BrowserRouter
│   │   │   └── Routes
│   │   │       ├── AuthPage (Public)
│   │   │       └── ProtectedRoute
│   │   │           └── Layout
│   │   │               ├── Sidebar
│   │   │               └── Outlet
│   │   │                   ├── Dashboard
│   │   │                   ├── KPITracking
│   │   │                   ├── Tickets
│   │   │                   ├── Calendar
│   │   │                   └── ...
```

---

## 🎯 Önemli Özellikler

### 1. KPI Yönetimi
- **Oluşturma**: Admin ve departman yöneticileri tarafından
- **Takip**: İlerleme yüzdesi, kalan günler, velocity hesaplama
- **Raporlama**: Departman bazlı performans metrikleri
- **Yorumlama**: KPI'lar için yorum ve feedback sistemi
- **Durum Yönetimi**: active, completed, paused, cancelled

### 2. Ticket Sistemi
- **Departmanlar Arası**: Kaynak ve hedef departman tanımlama
- **Yetki Kontrolü**: Hedef departman ticket durumunu değiştirebilir
- **Yorum Sistemi**: İç ve dış yorum ayrımı
- **Durum Takibi**: open → in_progress → resolved → closed

### 3. Takvim Sistemi
- **Haftalık/Aylık Görünüm**: Kullanıcı tercihine göre
- **Kategori Yönetimi**: Toplantı, Proje, Eğitim, vb.
- **Yetki Bazlı**: Kullanıcılar kendi aktivitelerini görür
- **İstatistikler**: Haftalık/aylık toplam çalışma saatleri

### 4. Bildirim Sistemi
- **Kategori Bazlı**: kpi, ticket, calendar, system, user
- **Öncelik Seviyeleri**: low, medium, high, critical
- **Okunmamış Sayacı**: Sidebar'da badge gösterimi
- **Otomatik Bildirimler**: KPI oluşturma, ticket atama, vb.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- (Opsiyonel) Docker

### Kurulum Adımları

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Veritabanını oluştur
npx prisma generate
npx prisma db push

# 3. Seed data'yı yükle
npm run db:seed

# 4. Geliştirme ortamını başlat
npm run dev:full
# veya ayrı ayrı:
npm run server  # Port 3001
npm run dev      # Port 5173
```

### Production Build

```bash
# Build et
npm run build

# Production server'ı başlat
npm run start
```

### Docker ile Çalıştırma

```bash
# Docker image oluştur
npm run docker:build

# Docker Compose ile çalıştır
docker-compose up -d
```

---

## 🔑 Test Kullanıcıları

Seed data ile birlikte 4 test kullanıcısı oluşturulur:

1. **Admin**
   - Email: `admin@gurgil.com`
   - Şifre: `123456`
   - Departman: İnsan Kaynakları

2. **Department Manager (Bilgi İşlem)**
   - Email: `manager@gurgil.com`
   - Şifre: `123456`
   - Departman: Bilgi İşlem

3. **Department Manager (IT)**
   - Email: `musa@gurgil.com`
   - Şifre: `123456`
   - Departman: IT
   - Tam Adı: Musa Gürgil

4. **Employee**
   - Email: `employee@gurgil.com`
   - Şifre: `123456`
   - Departman: Bilgi İşlem

---

## 🛠️ Geliştirme Notları

### 1. API Client Kullanımı
```typescript
// src/lib/api.ts
import { apiClient } from '@/lib/api';

// Login
await apiClient.login(email, password);

// KPI oluşturma
await apiClient.createKPI({
  title: 'Aylık Satış',
  targetValue: 100000,
  // ...
});

// Ticket oluşturma
await apiClient.createTicket({
  title: 'Bug Düzeltmesi',
  priority: 'high',
  targetDepartment: 'IT',
  // ...
});
```

### 2. Custom Hook Kullanımı
```typescript
// Component içinde
import { useKPI } from '@/hooks/useKPI';
import { useAuth } from '@/hooks/useAuth';

const { kpiStats, createKPI, loading } = useKPI();
const { user, hasRole } = useAuth();

if (hasRole('admin')) {
  // Admin işlemleri
}
```

### 3. Yetki Kontrolü (Backend)
```javascript
// server.js
const isAdmin = user.roles && user.roles.includes('admin');
const isDepartmentManager = user.roles && user.roles.includes('department_manager');

// KPI oluşturma yetkisi
if (!isAdmin && !isDepartmentManager) {
  return res.status(403).json({ error: 'Unauthorized' });
}

// Departman kontrolü
if (isDepartmentManager && !isAdmin && department !== user.department) {
  return res.status(403).json({ error: 'Department access denied' });
}
```

### 4. Veritabanı İşlemleri (Prisma)
```typescript
// Prisma client kullanımı
import { prisma } from '@/lib/db';

// KPI oluşturma
const kpi = await prisma.kpiTarget.create({
  data: {
    title: 'Satış Hedefi',
    targetValue: 100000,
    department: 'Satış',
    // ...
  },
  include: {
    assignments: { include: { user: true } },
    progress: true,
  }
});

// Filtrelenmiş sorgu
const kpis = await prisma.kpiTarget.findMany({
  where: {
    department: user.department,
    status: 'active',
  },
});
```

---

## 📊 Veri Akışı (Data Flow)

### KPI Oluşturma Akışı

1. **Frontend**: Kullanıcı formu doldurur
2. **Hook**: `useKPI().createKPI(data)` çağrılır
3. **API Client**: `apiClient.createKPI(data)` POST isteği
4. **Backend**: `server.js` endpoint kontrol ve yetki doğrulama
5. **Database**: Prisma ile veri kaydı
6. **Response**: Oluşturulan KPI döner
7. **State Update**: React Query ile cache güncelleme
8. **UI Update**: Yeni KPI listeye eklenir

### Ticket İşleme Akışı

1. **Kaynak Departman**: Ticket oluşturur
2. **Hedef Departman**: Ticket'ı görür ve durumu günceller
3. **Yetki Kontrolü**: Sadece hedef departman durumu değiştirebilir
4. **Yorumlar**: Her iki taraf yorum ekleyebilir
5. **Bildirimler**: Durum değişikliğinde bildirim gönderilir

---

## 🎨 UI Komponenti Kütüphanesi (shadcn/ui)

Sistem, 50+ Radix UI tabanlı bileşen kullanır:

### Ana Bileşenler
- `Button`, `Card`, `Dialog`, `Input`, `Select`
- `Table`, `Badge`, `Avatar`, `Toast`, `Skeleton`
- `Accordion`, `Alert`, `Checkbox`, `Radio`
- `Tabs`, `Sheet`, `Dropdown Menu`, `Command`
- `Popover`, `Tooltip`, `Calendar`, `Progress`
- `Separator`, `Scroll Area`, `Switch`, `Slider`
- ve daha fazlası...

### Stil Sistemi (Tailwind)

```typescript
// tailwind.config.ts
colors: {
  primary: '#your-color',
  secondary: '#your-color',
  // Custom theme colors
  'kpi-success': '#success-color',
  'kpi-warning': '#warning-color',
  'kpi-danger': '#danger-color',
}
```

---

## 🔍 Önemli Dosyalar ve Sorumlulukları

| Dosya | Görev |
|-------|-------|
| `server.js` | Backend API, authentication, authorization logic |
| `prisma/schema.prisma` | Veritabanı şeması ve ilişkiler |
| `src/App.tsx` | Ana routing ve protected route logic |
| `src/hooks/useAuth.ts` | Authentication state ve yetki kontrolü |
| `src/lib/api.ts` | API client, HTTP istekleri |
| `src/components/layout/Sidebar.tsx` | Role-based menu gösterimi |
| `src/components/auth/ProtectedRoute.tsx` | Route yetkilendirmesi |

---

## 🐛 Debug ve Troubleshooting

### Veritabanı Reset
```bash
npx prisma migrate reset
npx prisma db push
npm run db:seed
```

### JWT Secret
Production'da mutlaka değiştirin:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

### CORS Ayarları
Development için CORS açık (`server.js`):
```javascript
app.use(cors());
```

### Log Seviyeleri
Backend'de console.log ile debug:
```javascript
console.log('[KPI CREATE] User:', user.email);
console.log('[KPI CREATE] Request body:', req.body);
```

---

## 📝 Notlar ve Öneriler

### Güvenlik
1. ⚠️ Şu anda tüm kullanıcılar `123456` şifresi ile giriş yapabilir
2. ⚠️ JWT secret production'da değiştirilmeli
3. ⚠️ CORS ayarları production'da sınırlandırılmalı
4. ⚠️ bcryptjs ile şifre hashleme implement edilmeli

### Performans
- React Query ile cache yönetimi
- Prisma includes ile N+1 problemini önleme
- Loading states ile UX iyileştirme

### Geliştirme
- TypeScript strict mode aktif
- ESLint ile kod kalitesi
- Component-based architecture
- Custom hooks ile logic separation

---

## 📚 Kaynak Kod Yapısı Özeti

### Backend (server.js)
- Express.js middleware
- JWT authentication
- Role-based authorization
- Prisma ORM queries
- RESTful API endpoints

### Frontend Architecture
- **Pages**: Sayfa bileşenleri (Dashboard, KPI, Tickets, vb.)
- **Components**: Yeniden kullanılabilir UI bileşenleri
- **Hooks**: Custom React hooks (useKPI, useAuth, vb.)
- **Lib**: Utility fonksiyonlar (api client, auth helpers)
- **Types**: TypeScript tip tanımları

### State Management
- React Query: Server state (API data)
- useState/useEffect: Local component state
- localStorage: Authentication token
- Context API: Theme, sidebar state

---

## 🎉 Sonuç

Bu uygulama, modern web teknolojileri kullanılarak geliştirilmiş, production-ready bir KPI ve iş yönetim sistemidir. 

**Ana Güçlü Yönler:**
- ✅ Type-safe (TypeScript)
- ✅ Rol bazlı yetkilendirme
- ✅ Modern UI (shadcn/ui + Tailwind)
- ✅ API-driven architecture
- ✅ Responsive design
- ✅ Docker support

**Geliştirme Hızlandırmaları:**
- 🔧 Hot reload (Vite)
- 🔧 Concurrently ile backend+frontend birlikte
- 🔧 Seed data ile hızlı test
- 🔧 Prisma Studio ile DB görselleştirme

---

**Geliştirici İçin Özet:**
- 3 rol sistemi (Admin, Manager, Employee)
- 6 ana modül (KPI, Ticket, Calendar, Dashboard, Analytics, Reports)
- 50+ UI komponenti
- Type-safe API client
- Role-based routing ve yetkilendirme
- SQLite veritabanı (production için PostgreSQL geçiş kolay)

Bu sistem, şirket içi yerel deployment için tasarlanmıştır ve Docker ile kolayca deploy edilebilir.

---

*Son Güncelleme: 2024*
*Geliştirici: Musa Gürgil | Gurgil Games*

