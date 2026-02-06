# Toplantı Odaları Sayfası Geliştirme Planı

## 📋 Mevcut Durum Analizi

### ✅ Mevcut Özellikler
1. **Oda Yönetimi**
   - Oda listesi görüntüleme (kart görünümü)
   - Oda oluşturma (admin)
   - Oda silme (admin)
   - Haftalık takvim görünümü
   - Müsait/dolu durumu gösterimi

2. **Rezervasyon Yönetimi**
   - Rezervasyon oluşturma
   - Rezervasyon onaylama/reddetme (manager)
   - Rezervasyon tablosu görüntüleme
   - Çakışma kontrolü (backend)

3. **Görselleştirme**
   - Haftalık takvim grid görünümü
   - Rezervasyon durumu renk kodlaması
   - Responsive tasarım

### ❌ Eksiklikler ve İyileştirme Alanları

1. **Rezervasyon İşlemleri**
   - ❌ Rezervasyon düzenleme yok
   - ❌ Rezervasyon iptal etme yok
   - ❌ Kullanıcı kendi rezervasyonunu göremiyor (filtreleme eksik)

2. **Filtreleme ve Arama**
   - ❌ Oda arama yok
   - ❌ Tarih aralığı filtresi yok
   - ❌ Durum filtresi yok
   - ❌ Kapasite filtresi yok

3. **İstatistikler ve Raporlama**
   - ❌ Oda kullanım istatistikleri yok
   - ❌ En çok kullanılan odalar yok
   - ❌ Rezervasyon trendleri yok

4. **Kullanıcı Deneyimi**
   - ❌ Rezervasyon öncesi müsaitlik kontrolü görsel değil
   - ❌ Hızlı rezervasyon butonu yok
   - ❌ Bildirimler eksik
   - ❌ Rezervasyon hatırlatıcıları yok

5. **Oda Özellikleri**
   - ❌ Oda ekipmanları yok (projeksiyon, beyaz tahta vb.)
   - ❌ Oda fotoğrafları yok
   - ❌ Oda düzenleme yok

6. **Görselleştirme İyileştirmeleri**
   - ❌ Günlük görünüm yok
   - ❌ Aylık görünüm yok
   - ❌ Tüm odaları bir arada görüntüleme yok

---

## 🎯 Geliştirme Planı

### Faz 1: Temel İyileştirmeler (Öncelik: Yüksek)

#### 1.1 Rezervasyon Düzenleme ve İptal Etme
- [ ] Backend: `PUT /api/meeting-reservations/:id` endpoint ekle
- [ ] Backend: `DELETE /api/meeting-reservations/:id` endpoint ekle
- [ ] Frontend: Rezervasyon düzenleme dialog'u ekle
- [ ] Frontend: Rezervasyon iptal butonu ekle
- [ ] Frontend: Sadece kendi rezervasyonlarını düzenleyebilme kontrolü

#### 1.2 Filtreleme ve Arama
- [ ] Oda adına göre arama
- [ ] Konum filtresi
- [ ] Kapasite filtresi (min-max)
- [ ] Tarih aralığı filtresi
- [ ] Durum filtresi (müsait/dolu)
- [ ] Rezervasyon durumu filtresi (pending/approved/rejected)

#### 1.3 Kullanıcı Rezervasyonları Görünümü
- [ ] "Benim Rezervasyonlarım" sekmesi ekle
- [ ] Yaklaşan rezervasyonlar widget'ı
- [ ] Geçmiş rezervasyonlar listesi

### Faz 2: Görselleştirme İyileştirmeleri (Öncelik: Orta)

#### 2.1 Takvim Görünümleri
- [ ] Günlük görünüm ekle
- [ ] Aylık görünüm ekle
- [ ] Tüm odaları bir arada görüntüleme (grid view)
- [ ] Takvim görünümü seçici ekle

#### 2.2 Müsaitlik Kontrolü
- [ ] Seçilen tarih/saat için müsait odaları vurgulama
- [ ] Çakışma uyarıları görselleştirme
- [ ] Hızlı rezervasyon butonu (müsait saatlerden seçim)

### Faz 3: İstatistikler ve Raporlama (Öncelik: Orta)

#### 3.1 Oda Kullanım İstatistikleri
- [ ] En çok kullanılan odalar
- [ ] Oda doluluk oranları
- [ ] Haftalık/aylık kullanım grafikleri
- [ ] Rezervasyon trendleri

#### 3.2 Dashboard Widget'ları
- [ ] Bugünkü rezervasyonlar widget'ı
- [ ] Yaklaşan rezervasyonlar widget'ı
- [ ] Oda kullanım özeti

### Faz 4: Gelişmiş Özellikler (Öncelik: Düşük)

#### 4.1 Oda Özellikleri
- [ ] Oda ekipmanları ekleme/düzenleme
- [ ] Oda fotoğrafları yükleme
- [ ] Oda düzenleme (admin)
- [ ] Ekipman bazlı filtreleme

#### 4.2 Bildirimler ve Hatırlatıcılar
- [ ] Rezervasyon onaylandı bildirimi
- [ ] Rezervasyon reddedildi bildirimi
- [ ] Rezervasyon hatırlatıcıları (1 saat önce, 1 gün önce)
- [ ] Rezervasyon iptal bildirimi

#### 4.3 Tekrarlayan Rezervasyonlar
- [ ] Haftalık tekrarlayan rezervasyonlar
- [ ] Aylık tekrarlayan rezervasyonlar
- [ ] Tekrarlayan rezervasyon yönetimi

---

## 📝 Detaylı Geliştirme Adımları

### Adım 1: Backend API Geliştirmeleri

#### 1.1 Rezervasyon Güncelleme Endpoint
```javascript
PUT /api/meeting-reservations/:id
- Sadece rezervasyon sahibi veya admin güncelleyebilir
- Çakışma kontrolü yapılmalı
- Onaylanmış rezervasyonlar için özel kontrol
```

#### 1.2 Rezervasyon Silme Endpoint
```javascript
DELETE /api/meeting-reservations/:id
- Sadece rezervasyon sahibi veya admin silebilir
- Onaylanmış rezervasyonlar için bildirim gönderilmeli
```

#### 1.3 İstatistik Endpoint'leri
```javascript
GET /api/meeting-rooms/stats
- Oda kullanım istatistikleri
- En çok kullanılan odalar
- Doluluk oranları
```

### Adım 2: Frontend Component Geliştirmeleri

#### 2.1 Yeni Component'ler
- `ReservationEditDialog.tsx` - Rezervasyon düzenleme
- `RoomFilters.tsx` - Filtreleme component'i
- `RoomStats.tsx` - İstatistikler component'i
- `QuickReservation.tsx` - Hızlı rezervasyon
- `MyReservations.tsx` - Kullanıcı rezervasyonları

#### 2.2 Mevcut Component İyileştirmeleri
- `ReservationTable.tsx` - Düzenle/sil butonları ekle
- `RoomList.tsx` - Filtreleme ve arama ekle
- `ReservationForm.tsx` - Düzenleme modu ekle

### Adım 3: Hook Geliştirmeleri

#### 3.1 `useMeetingRooms.ts` Güncellemeleri
- `updateReservation` fonksiyonu
- `deleteReservation` fonksiyonu
- `getRoomStats` fonksiyonu
- Filtreleme state'leri

---

## 🎨 UI/UX İyileştirmeleri

### 1. Filtreleme Bölümü
- Oda adı arama kutusu
- Dropdown filtreler (konum, kapasite, durum)
- Tarih aralığı seçici
- Filtreleri temizle butonu

### 2. Rezervasyon Tablosu İyileştirmeleri
- Düzenle butonu (sadece kendi rezervasyonları için)
- İptal butonu (sadece kendi rezervasyonları için)
- Durum badge'leri iyileştirme
- Tarih/saat formatı iyileştirme

### 3. Takvim Görünümü İyileştirmeleri
- Görünüm seçici (haftalık/günlük/aylık)
- Tüm odaları bir arada görüntüleme
- Müsait saatleri vurgulama
- Çakışma uyarıları

### 4. İstatistikler Bölümü
- Kart görünümünde istatistikler
- Grafik görünümleri
- Trend göstergeleri

---

## 🔧 Teknik Detaylar

### Backend Değişiklikleri
1. `server.js` - Yeni endpoint'ler
2. Prisma schema - Gerekirse yeni alanlar

### Frontend Değişiklikleri
1. `src/lib/api.ts` - Yeni API metodları
2. `src/hooks/useMeetingRooms.ts` - Yeni fonksiyonlar
3. Yeni component'ler
4. Mevcut component güncellemeleri

---

## 📊 Öncelik Sıralaması

1. **Yüksek Öncelik**
   - Rezervasyon düzenleme/silme
   - Filtreleme ve arama
   - Kullanıcı rezervasyonları görünümü

2. **Orta Öncelik**
   - Takvim görünümleri
   - İstatistikler
   - Müsaitlik kontrolü iyileştirmeleri

3. **Düşük Öncelik**
   - Oda özellikleri
   - Bildirimler
   - Tekrarlayan rezervasyonlar

---

## ✅ Başarı Kriterleri

- [ ] Kullanıcılar kendi rezervasyonlarını düzenleyebilmeli
- [ ] Kullanıcılar kendi rezervasyonlarını iptal edebilmeli
- [ ] Oda ve rezervasyon filtreleme çalışmalı
- [ ] İstatistikler doğru gösterilmeli
- [ ] Tüm özellikler responsive olmalı
- [ ] Performans sorunları olmamalı

---

## 📅 Tahmini Süre

- **Faz 1**: 4-6 saat
- **Faz 2**: 3-4 saat
- **Faz 3**: 2-3 saat
- **Faz 4**: 4-5 saat

**Toplam**: ~13-18 saat

---

## 🚀 Başlangıç

Hangi fazdan başlamak istersiniz? Önerim Faz 1'den başlamak çünkü en kritik özellikler orada.

