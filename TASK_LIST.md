# 🐛 Tespit Edilen Sorunlar - Task Listesi

## Öncelik Sırasına Göre Düzeltme Görevleri

---

## 🔴 KRİTİK ÖNCELİK (Hemen Düzeltilmeli)

### Task 1: KPI Oluşturma Formu - Atanan Kişi Alanı Eksik
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/components/kpi/CreateKPIDialog.tsx`
- **Sorun:** Formda "Atanan Kişi" seçimi görünmüyor ama backend "En az bir kişi atanmalıdır" hatası veriyor
- **Beklenen:** KPI oluştururken kullanıcı atama yapılabilmeli ve form görünür olmalı
- **Etki:** KPI oluşturulamıyor - **KRİTİK HATA!**
- **Öncelik:** 🔴 YÜKSEK (Kritik)

---

## 🔴 YÜKSEK ÖNCELİK (Kısa Sürede Düzeltilmeli)

### Task 2: Sidebar Kullanıcı Adı Gösterimi
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/components/layout/Sidebar.tsx`
- **Sorun:** Sidebar'da kullanıcı adı "Kullanıcı" olarak görünüyor, firstName ve lastName gösterilmiyor
- **Beklenen:** "Admin User" veya "Musa Gürgil" gibi tam isim gösterilmeli
- **Etki:** Kullanıcı deneyimi kötüleşiyor, kimlik belirsizliği
- **Öncelik:** 🔴 Yüksek

### Task 3: Dashboard - NaN Hesaplama Hatası
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/components/dashboard/DepartmentPerformance.tsx`
- **Sorun:** Departman Performansı bölümünde "%NaN kalan" görünüyor
- **Beklenen:** Doğru hesaplanmış kalan değer gösterilmeli
- **Etki:** Veri güvenilirliği sorunu
- **Öncelik:** 🔴 Yüksek

### Task 4: KPI Tahmini Bitiş Tarihi Hatası
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** KPI kartlarında
- **Sorun:** "Tahmini Bitiş" tarihi çok uzak gelecekte görünüyor (örn: 23.10.2124)
- **Beklenen:** Mantıklı bir tahmin tarihi gösterilmeli
- **Etki:** Kullanıcı güveni azalıyor
- **Öncelik:** 🔴 Yüksek

---

## 🟡 ORTA ÖNCELİK (Orta Vadede Düzeltilmeli)

### Task 5: Calendar - Günlük Çalışma Saatleri Birim Hatası
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/pages/Calendar.tsx`
- **Sorun:** "Günlük Çalışma Saatleri" grafiğinde "0.0s" ve "0.0s/gün" görünüyor
- **Beklenen:** "0.0h" ve "0.0h/gün" olmalı (saat birimi)
- **Etki:** Yanıltıcı bilgi
- **Öncelik:** 🟡 Orta

### Task 6: Calendar - Kategori Dağılımı Yüzde Hatası
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/pages/Calendar.tsx`
- **Sorun:** "Toplantı: 2.0h (133%)" görünüyor - %133 mantıklı değil
- **Beklenen:** Yüzde değeri 100%'ü geçmemeli veya doğru hesaplanmalı
- **Etki:** Yanıltıcı bilgi
- **Öncelik:** 🟡 Orta

### Task 7: Meeting Rooms - Rezervasyon Formu Dropdown Sorunu
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/pages/MeetingRooms.tsx`
- **Sorun:** Saat seçimi dropdown'ları açıldıktan sonra kapanmıyor, form doldurma zorlaşıyor
- **Beklenen:** Dropdown seçiminden sonra otomatik kapanmalı
- **Etki:** Kullanıcı deneyimi kötüleşiyor
- **Öncelik:** 🟡 Orta

### Task 8: KPI İstatistikleri Tutarsızlığı
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** KPI sayfası istatistik kartları
- **Sorun:** "Hedefte: 0", "Risk Altında: 0", "Tamamlanan: 0" gösteriliyor ama 5 KPI var
- **Beklenen:** İstatistikler doğru hesaplanmalı
- **Etki:** Kullanıcı doğru bilgi alamıyor
- **Öncelik:** 🟡 Orta

### Task 9: Dashboard - Kritik KPI'lar Tutarsızlığı
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/pages/Dashboard.tsx`
- **Sorun:** "Kritik KPI'lar" bölümünde "Henüz KPI verisi bulunmamaktadır" yazıyor ama üstte "Toplam KPI: 5" gösteriliyor
- **Beklenen:** Kritik KPI'lar listelenmeli veya mesaj tutarlı olmalı
- **Etki:** Kullanıcı kafası karışıyor
- **Öncelik:** 🟡 Orta

### Task 10: Karakter Encoding Sorunu
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** Console logları, JWT token decode
- **Sorun:** Türkçe karakterler bozuk görünüyor (örn: "Ä°nsan KaynaklarÄ±" yerine "İnsan Kaynakları")
- **Beklenen:** UTF-8 encoding doğru çalışmalı
- **Etki:** Debug zorlaşıyor, potansiyel veri sorunları
- **Öncelik:** 🟡 Orta

---

## 🟢 DÜŞÜK ÖNCELİK (İyileştirme - İsteğe Bağlı)

### Task 11: Departman Yönetimi - Ortalama Hesaplama Hatası
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** `src/pages/Users.tsx` (Departman Yönetimi tab)
- **Sorun:** "Ortalama Çalışan/Departman: 0" görünüyor ama 5 çalışan / 12 departman = 0.42 olmalı
- **Beklenen:** Doğru hesaplanmış ortalama gösterilmeli (0.42 veya yuvarlanmış değer)
- **Etki:** Yanıltıcı bilgi
- **Öncelik:** 🟢 Düşük

### Task 12: Bildirim Badge Sayısı Kontrolü
- **Durum:** ⏳ Bekliyor
- **Lokasyon:** Sidebar
- **Sorun:** Bildirimler butonunda "15" badge gösteriliyor ama gerçek sayı kontrol edilmeli
- **Beklenen:** Doğru okunmamış bildirim sayısı gösterilmeli
- **Etki:** Yanıltıcı bilgi
- **Öncelik:** 🟢 Düşük

---

## 📊 Özet İstatistikler

- **Toplam Task:** 12
- **Kritik:** 1
- **Yüksek:** 3
- **Orta:** 6
- **Düşük:** 2

---

## 🎯 Önerilen Çalışma Sırası

1. **İlk Önce:** Task 1 (KPI Oluşturma Formu) - Sistemin temel fonksiyonelliği için kritik
2. **Sonra:** Task 2, 3, 4 (Yüksek öncelikli sorunlar)
3. **Sonra:** Task 5-10 (Orta öncelikli sorunlar)
4. **Son Olarak:** Task 11-12 (Düşük öncelikli iyileştirmeler)

---

*Son güncelleme: Test raporu tamamlandıktan sonra oluşturuldu*

