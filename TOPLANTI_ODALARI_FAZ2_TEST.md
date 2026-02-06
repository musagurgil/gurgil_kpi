# Toplantı Odaları Sayfası - Faz 2 Test Planı

Bu test planı, Toplantı Odaları sayfasının Faz 2 geliştirmeleri kapsamında eklenen görselleştirme iyileştirmelerinin doğruluğunu ve işlevselliğini kontrol etmek için hazırlanmıştır.

## Test Ortamı
- Tarayıcı: Chrome
- Kullanıcı Rolleri: Admin, Departman Yöneticisi, Çalışan

## Test Senaryoları

### 1. Takvim Görünümü Seçici

**Senaryo 1.1: Görünüm Seçici Görünürlüğü**
- **Adımlar:**
  1. Toplantı Odaları sayfasına git
  2. "Odalar" sekmesine tıkla
- **Beklenen Sonuç:**
  - Görünüm seçici butonları görünür olmalı (Haftalık, Günlük, Aylık, Tüm Odalar)
  - Varsayılan görünüm "Haftalık" olmalı

**Senaryo 1.2: Görünüm Değiştirme**
- **Adımlar:**
  1. Her bir görünüm butonuna sırayla tıkla
- **Beklenen Sonuç:**
  - Her görünüm değiştiğinde ilgili component render edilmeli
  - Aktif görünüm butonu vurgulanmalı

### 2. Haftalık Görünüm

**Senaryo 2.1: Haftalık Takvim Görüntüleme**
- **Adımlar:**
  1. "Haftalık" görünümünü seç
- **Beklenen Sonuç:**
  - Her oda için haftalık takvim grid'i görünmeli
  - Haftanın günleri (Pzt-Paz) başlıkta görünmeli
  - Saatler (08:00-19:00) sol tarafta listelenmeli
  - Rezervasyonlar doğru saatlerde görünmeli

**Senaryo 2.2: Hafta Navigasyonu**
- **Adımlar:**
  1. "Önceki" butonuna tıkla
  2. "Sonraki" butonuna tıkla
  3. "Bugün" butonuna tıkla
- **Beklenen Sonuç:**
  - Hafta değişmeli ve rezervasyonlar güncellenmeli
  - Bugün butonu bugünün haftasını göstermeli

### 3. Günlük Görünüm

**Senaryo 3.1: Günlük Takvim Görüntüleme**
- **Adımlar:**
  1. "Günlük" görünümünü seç
- **Beklenen Sonuç:**
  - Tüm odalar yan yana listelenmeli
  - Seçilen tarih için saatler (08:00-21:00) görünmeli
  - Müsait saatler yeşil renkte vurgulanmalı
  - Dolu saatler gri renkte görünmeli

**Senaryo 3.2: Gün Navigasyonu**
- **Adımlar:**
  1. "Önceki" butonuna tıkla
  2. "Sonraki" butonuna tıkla
  3. "Bugün" butonuna tıkla
- **Beklenen Sonuç:**
  - Tarih değişmeli ve rezervasyonlar güncellenmeli
  - Bugün butonu bugünü göstermeli

**Senaryo 3.3: Müsaitlik Gösterimi**
- **Adımlar:**
  1. Günlük görünümde müsait bir saate bak
- **Beklenen Sonuç:**
  - Müsait saatler yeşil arka planla vurgulanmalı
  - Dolu saatler rezervasyon bilgisiyle gösterilmeli

### 4. Aylık Görünüm

**Senaryo 4.1: Aylık Takvim Görüntüleme**
- **Adımlar:**
  1. "Aylık" görünümünü seç
- **Beklenen Sonuç:**
  - Ay takvimi görünmeli
  - Haftanın günleri başlıkta görünmeli
  - Her gün için rezervasyonlar görünmeli
  - Bugün vurgulanmalı

**Senaryo 4.2: Ay Navigasyonu**
- **Adımlar:**
  1. "Önceki" butonuna tıkla
  2. "Sonraki" butonuna tıkla
  3. "Bugün" butonuna tıkla
- **Beklenen Sonuç:**
  - Ay değişmeli ve rezervasyonlar güncellenmeli
  - Bugün butonu bugünün ayını göstermeli

### 5. Grid Görünüm (Tüm Odalar)

**Senaryo 5.1: Grid Görünüm Görüntüleme**
- **Adımlar:**
  1. "Tüm Odalar" görünümünü seç
- **Beklenen Sonuç:**
  - Tüm odalar kart görünümünde görünmeli
  - Her kartta oda bilgileri (ad, konum, kapasite) görünmeli
  - Yaklaşan rezervasyon sayısı görünmeli

**Senaryo 5.2: Müsaitlik Durumu**
- **Adımlar:**
  1. Grid görünümde odaları kontrol et
- **Beklenen Sonuç:**
  - Müsait odalar "Müsait" badge'i ile işaretlenmeli
  - Dolu odalar "Dolu" badge'i ile işaretlenmeli

### 6. Hızlı Rezervasyon

**Senaryo 6.1: Hızlı Rezervasyon Butonu**
- **Adımlar:**
  1. Sayfanın üst kısmındaki "Hızlı Rezervasyon" butonuna tıkla
- **Beklenen Sonuç:**
  - Dialog açılmalı
  - Tarih, saat ve oda seçimi yapılabilmeli

**Senaryo 6.2: Müsait Oda Filtreleme**
- **Adımlar:**
  1. Hızlı rezervasyon dialog'unu aç
  2. Tarih ve saat seç
- **Beklenen Sonuç:**
  - Sadece seçilen saatte müsait odalar listelenmeli
  - Müsait oda sayısı gösterilmeli
  - Çakışan odalar listede görünmemeli

**Senaryo 6.3: Hızlı Rezervasyon Oluşturma**
- **Adımlar:**
  1. Tarih seç
  2. Başlangıç ve bitiş saati seç
  3. Müsait bir oda seç
  4. Not ekle (isteğe bağlı)
  5. "Rezerve Et" butonuna tıkla
- **Beklenen Sonuç:**
  - Rezervasyon başarıyla oluşturulmalı
  - Dialog kapanmalı
  - Rezervasyon listesinde görünmeli

### 7. Müsaitlik Kontrolü ve Çakışma Uyarıları

**Senaryo 7.1: Çakışma Kontrolü**
- **Adımlar:**
  1. Hızlı rezervasyon ile çakışan bir saat seç
- **Beklenen Sonuç:**
  - Çakışan oda listede görünmemeli
  - "Seçilen saatte müsait oda yok" mesajı görünmeli

**Senaryo 7.2: Görsel Çakışma Gösterimi**
- **Adımlar:**
  1. Günlük görünümde çakışan saatleri kontrol et
- **Beklenen Sonuç:**
  - Çakışan saatler gri renkte görünmeli
  - Müsait saatler yeşil renkte vurgulanmalı

### 8. Responsive Tasarım

**Senaryo 8.1: Mobil Görünüm**
- **Adımlar:**
  1. Tarayıcıyı mobil boyutuna küçült
- **Beklenen Sonuç:**
  - Tüm görünümler mobilde düzgün görünmeli
  - Butonlar ve kontroller erişilebilir olmalı
  - Görünüm seçici butonları responsive olmalı

## Test Sonuçları

Her test senaryosu için sonuçları buraya kaydedin:
- ✅ Başarılı
- ❌ Başarısız (Notlar: ...)
- ⚠️ Kısmen Başarılı (Notlar: ...)

