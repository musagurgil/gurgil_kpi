# 📋 TO-DO Listesi - Gurgil KPI Manager

**Oluşturulma Tarihi:** 16 Kasım 2025  
**Test Sonrası Geliştirme Önerileri**

---

## 🔴 Kritik Hatalar (Yüksek Öncelik)

### 1. Sidebar Kullanıcı Adı Gösterimi
- **Dosya:** `src/components/layout/Sidebar.tsx`
- **Sorun:** Sidebar'da kullanıcı adı "Kullanıcı" olarak görünüyor
- **Çözüm:** firstName ve lastName'i birleştirip göster
- **Öncelik:** Yüksek
- **Durum:** 🔴 Bekliyor

### 2. Dashboard NaN Hesaplama Hatası
- **Dosya:** `src/components/dashboard/DepartmentPerformance.tsx`
- **Sorun:** "%NaN kalan" görünüyor
- **Çözüm:** Hesaplama fonksiyonunu kontrol et ve düzelt
- **Öncelik:** Yüksek
- **Durum:** 🔴 Bekliyor

### 3. KPI Tahmini Bitiş Tarihi Hatası
- **Dosya:** KPI kartları / hesaplama fonksiyonu
- **Sorun:** "Tahmini Bitiş" tarihi çok uzak gelecekte (örn: 23.10.2124)
- **Çözüm:** Tarih hesaplama algoritmasını düzelt
- **Öncelik:** Yüksek
- **Durum:** 🔴 Bekliyor

### 4. KPI Oluşturma - Atanan Kişi Alanı Görünmüyor
- **Dosya:** `src/components/kpi/CreateKPIDialog.tsx`
- **Sorun:** Formda "Atanan Kişi" seçimi görünmüyor ama backend zorunlu kılıyor
- **Çözüm:** 
  - Departman seçildikten sonra "Atanan Kişiler" bölümünün görünür olduğundan emin ol
  - Eğer departmanda kullanıcı yoksa uyarı göster
  - Form validasyonunu iyileştir
- **Öncelik:** Yüksek (Kritik - KPI oluşturulamıyor!)
- **Durum:** 🔴 Bekliyor

---

## 🟡 Orta Öncelikli Sorunlar

### 5. Dashboard - Kritik KPI'lar Tutarsızlığı
- **Dosya:** `src/pages/Dashboard.tsx`
- **Sorun:** "Kritik KPI'lar" bölümünde "Henüz KPI verisi bulunmamaktadır" yazıyor ama üstte "Toplam KPI: 5" gösteriliyor
- **Çözüm:** Kritik KPI filtreleme mantığını kontrol et ve düzelt
- **Öncelik:** Orta
- **Durum:** 🟡 Bekliyor

### 6. KPI İstatistikleri Tutarsızlığı
- **Dosya:** KPI sayfası istatistik kartları
- **Sorun:** "Hedefte: 0", "Risk Altında: 0", "Tamamlanan: 0" gösteriliyor ama 5 KPI var
- **Çözüm:** İstatistik hesaplama fonksiyonlarını kontrol et ve düzelt
- **Öncelik:** Orta
- **Durum:** 🟡 Bekliyor

### 7. Karakter Encoding Sorunu
- **Dosya:** JWT token decode, console logları
- **Sorun:** Türkçe karakterler bozuk görünüyor (örn: "Ä°nsan KaynaklarÄ±")
- **Çözüm:** UTF-8 encoding'i doğru kullan
- **Öncelik:** Orta
- **Durum:** 🟡 Bekliyor

### 8. Bildirim Badge Sayısı Kontrolü
- **Dosya:** Sidebar bildirim badge
- **Sorun:** Bildirimler butonunda "15" badge gösteriliyor ama gerçek sayı kontrol edilmeli
- **Çözüm:** Okunmamış bildirim sayısını doğru hesapla
- **Öncelik:** Orta
- **Durum:** 🟡 Bekliyor

---

## 🟢 Düşük Öncelikli / İyileştirmeler

### 9. Form Validasyon Mesajları İyileştirme
- **Dosya:** Tüm formlar
- **Sorun:** Form validasyon mesajları kullanıcı dostu olmalı
- **Çözüm:** Tüm form validasyon mesajlarını gözden geçir ve iyileştir
- **Öncelik:** Düşük
- **Durum:** 🟢 Bekliyor

### 10. Loading States Tutarlılığı
- **Dosya:** Tüm sayfalar
- **Sorun:** Loading state'leri tutarlı mı kontrol edilmeli
- **Çözüm:** Tüm async işlemlerde loading gösterilmeli
- **Öncelik:** Düşük
- **Durum:** 🟢 Bekliyor

### 11. Error Handling İyileştirme
- **Dosya:** API çağrıları
- **Sorun:** Network hatalarında kullanıcıya bilgi veriliyor mu?
- **Çözüm:** Kullanıcı dostu hata mesajları ekle
- **Öncelik:** Orta
- **Durum:** 🟢 Bekliyor

### 12. Accessibility İyileştirmeleri
- **Dosya:** Dialog bileşenleri
- **Sorun:** Console'da "Missing Description or aria-describedby" uyarısı
- **Çözüm:** Dialog'lara aria-describedby ekle
- **Öncelik:** Düşük
- **Durum:** 🟢 Bekliyor

### 13. Form Autocomplete Özellikleri
- **Dosya:** Login formu
- **Sorun:** Console'da "Input elements should have autocomplete attributes" uyarısı
- **Çözüm:** Form input'larına autocomplete özellikleri ekle
- **Öncelik:** Düşük
- **Durum:** 🟢 Bekliyor

---

## ✅ Tamamlanan Testler

- ✅ Admin girişi testi
- ✅ Dashboard görüntüleme testi
- ✅ KPI listesi görüntüleme testi
- ✅ KPI oluşturma formu açma testi
- ✅ Ticket oluşturma testi
- ✅ Ticket listesi görüntüleme testi

---

## 🔄 Devam Eden Testler

- 🔄 Calendar modülü testi
- 🔄 Meeting Rooms testi
- 🔄 Admin Panel testi
- 🔄 Manager kullanıcı testi
- 🔄 Employee kullanıcı testi
- 🔄 Bildirimler testi

---

## 📊 Özet

- **Toplam Sorun:** 13
- **Kritik:** 4
- **Orta Öncelikli:** 4
- **Düşük Öncelikli:** 5
- **Tamamlanan Test:** 6
- **Devam Eden Test:** 6

---

**Not:** Bu liste test sürecinde bulunan sorunlar ve geliştirme önerilerini içermektedir. Öncelik sırasına göre düzeltmeler yapılmalıdır.

