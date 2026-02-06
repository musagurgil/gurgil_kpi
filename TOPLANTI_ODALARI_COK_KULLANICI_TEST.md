# Toplantı Odaları - Çoklu Kullanıcı Test Raporu

## Test Senaryoları

### Test 1: Admin Kullanıcısı - Rezervasyon Oluşturma
**Kullanıcı:** Admin (admin@gurgil.com)
**Tarih:** 21 Kasım 2025
**Adımlar:**
1. ✅ Admin olarak giriş yapıldı
2. ✅ Toplantı Odaları sayfasına gidildi
3. ✅ Rezervasyonlar sekmesine geçildi
4. ✅ Rezervasyon formu açıldı
5. ⚠️ Form dolduruldu (Oda: Ana Toplantı Salonu, Tarih: 21 Kasım 2025, Saat: 10:00-11:00, Notlar: Admin tarafından oluşturulan test rezervasyonu)
6. ✅ Form validasyonu düzeltildi - "Talep Oluştur" butonu artık aktif oluyor
7. ✅ Rezervasyon oluşturuldu (Oda: Ana Toplantı Salonu, Tarih: 22 Kasım 2025, Saat: 10:00-11:00)
8. ✅ Rezervasyonlar sekmesinde rezervasyon görüntülendi
9. ✅ Rezervasyon düzenleme dialog'u açıldı
10. ✅ Rezervasyon güncellendi (Bitiş saati 11:12'ye, notlar güncellendi) - Bildirim mesajı görüntülendi
11. ✅ Rezervasyon silme onay dialog'u açıldı
12. ✅ Rezervasyon silindi - Bildirim mesajı görüntülendi, takvimden kaldırıldı
13. ✅ Geçmiş tarihli rezervasyon engellemesi test edildi - Takvimde 26 geçmiş tarih disabled olarak işaretlenmiş, sadece bugün ve gelecek tarihler seçilebilir

### Test 2: Normal Kullanıcı - Rezervasyon Oluşturma ve Düzenleme
**Kullanıcı:** Normal Kullanıcı
**Adımlar:**
1. ⏳ Normal kullanıcı olarak giriş yapılacak
2. ⏳ Rezervasyon oluşturulacak
3. ⏳ Kendi rezervasyonu düzenlenecek
4. ⏳ Kendi rezervasyonu silinecek

### Test 3: Departman Yöneticisi - Rezervasyon Onaylama
**Kullanıcı:** Departman Yöneticisi
**Adımlar:**
1. ⏳ Departman yöneticisi olarak giriş yapılacak
2. ⏳ Bekleyen rezervasyonlar görüntülenecek
3. ⏳ Rezervasyon onaylanacak
4. ⏳ Rezervasyon reddedilecek

### Test 4: Geçmiş Tarihli Rezervasyon Engellemesi
**Kullanıcı:** Admin (admin@gurgil.com)
**Adımlar:**
1. ✅ Rezervasyon formu açıldı
2. ✅ Tarih seçici açıldı
3. ✅ Geçmiş tarihler disabled olarak görüntülendi (26 geçmiş tarih disabled)
4. ✅ Sadece bugün (21 Kasım 2025) ve gelecek tarihler seçilebilir durumda
5. ✅ Frontend'de geçmiş tarih seçimi engellendi (Calendar component'te `disabled` prop ile)
6. ✅ Backend'de de geçmiş tarih kontrolü yapılıyor (`if (start < new Date())`)

### Test 5: Çakışma Kontrolü
**Adımlar:**
1. ⏳ Aynı saatte iki rezervasyon oluşturulmaya çalışılacak
2. ⏳ Çakışma uyarısı kontrol edilecek

### Test 6: Görünüm Testleri
**Adımlar:**
1. ⏳ Farklı görünümlerde rezervasyonlar görüntülenecek
2. ⏳ Müsaitlik durumu kontrol edilecek

