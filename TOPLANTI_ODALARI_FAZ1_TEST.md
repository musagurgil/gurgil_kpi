# Toplantı Odaları Faz 1 Test Senaryoları

## 🧪 Test Senaryoları

### Test 1: Rezervasyon Düzenleme

#### Senaryo 1.1: Kullanıcı Kendi Rezervasyonunu Düzenler
1. ✅ Bir kullanıcı olarak giriş yap
2. ✅ Toplantı Odaları sayfasına git
3. ✅ Rezervasyonlar sekmesine git
4. ✅ Kendi rezervasyonunuzu bulun (durum: "Bekliyor")
5. ✅ "Düzenle" butonuna tıklayın
6. ✅ Rezervasyon düzenleme dialog'unun açıldığını kontrol edin
7. ✅ Tarih, saat veya notları değiştirin
8. ✅ "Güncelle" butonuna tıklayın
9. ✅ Başarı mesajının göründüğünü kontrol edin
10. ✅ Rezervasyonun güncellendiğini kontrol edin

**Beklenen Sonuç:**
- Dialog açılmalı
- Form mevcut rezervasyon bilgileriyle dolu olmalı
- Güncelleme başarılı olmalı
- Rezervasyon tablosunda güncellenmiş bilgiler görünmeli

#### Senaryo 1.2: Onaylanmış Rezervasyonu Düzenleme (Admin)
1. ✅ Admin olarak giriş yap
2. ✅ Onaylanmış bir rezervasyon bulun
3. ✅ "Düzenle" butonuna tıklayın
4. ✅ Rezervasyonu güncelleyin
5. ✅ Başarılı olduğunu kontrol edin

**Beklenen Sonuç:**
- Admin onaylanmış rezervasyonları düzenleyebilmeli
- Normal kullanıcılar onaylanmış rezervasyonları düzenleyememeli

#### Senaryo 1.3: Başkasının Rezervasyonunu Düzenleme (Negatif Test)
1. ✅ Normal kullanıcı olarak giriş yap
2. ✅ Başka birinin rezervasyonunu bulun
3. ✅ "Düzenle" butonunun görünmediğini kontrol edin

**Beklenen Sonuç:**
- Başkasının rezervasyonunda "Düzenle" butonu görünmemeli

---

### Test 2: Rezervasyon Silme

#### Senaryo 2.1: Kullanıcı Kendi Rezervasyonunu Siler
1. ✅ Bir kullanıcı olarak giriş yap
2. ✅ Kendi rezervasyonunuzu bulun
3. ✅ "Sil" butonuna tıklayın
4. ✅ Onay dialog'unun açıldığını kontrol edin
5. ✅ "Sil" butonuna tıklayın
6. ✅ Başarı mesajının göründüğünü kontrol edin
7. ✅ Rezervasyonun listeden kaldırıldığını kontrol edin

**Beklenen Sonuç:**
- Onay dialog'u açılmalı
- Silme işlemi başarılı olmalı
- Rezervasyon listeden kalkmalı

#### Senaryo 2.2: Onaylanmış Rezervasyonu Silme
1. ✅ Onaylanmış bir rezervasyonu silmeyi deneyin
2. ✅ Onay dialog'unda uyarı mesajının göründüğünü kontrol edin
3. ✅ Silme işlemini tamamlayın

**Beklenen Sonuç:**
- Onaylanmış rezervasyonlar için özel uyarı mesajı görünmeli
- Silme işlemi başarılı olmalı

#### Senaryo 2.3: Başkasının Rezervasyonunu Silme (Negatif Test)
1. ✅ Normal kullanıcı olarak giriş yap
2. ✅ Başka birinin rezervasyonunu bulun
3. ✅ "Sil" butonunun görünmediğini kontrol edin

**Beklenen Sonuç:**
- Başkasının rezervasyonunda "Sil" butonu görünmemeli

---

### Test 3: Çakışma Kontrolü

#### Senaryo 3.1: Çakışan Rezervasyon Düzenleme
1. ✅ Mevcut bir rezervasyonu düzenleyin
2. ✅ Başka bir rezervasyonla çakışan bir saat seçin
3. ✅ Güncellemeyi deneyin

**Beklenen Sonuç:**
- Hata mesajı görünmeli: "This time slot is already reserved"
- Rezervasyon güncellenmemeli

#### Senaryo 3.2: Geçmiş Tarih Düzenleme
1. ✅ Mevcut bir rezervasyonu düzenleyin
2. ✅ Geçmiş bir tarih seçin
3. ✅ Güncellemeyi deneyin

**Beklenen Sonuç:**
- Hata mesajı görünmeli: "Cannot update reservation to past dates"
- Rezervasyon güncellenmemeli

---

### Test 4: Backend Endpoint Testleri

#### Senaryo 4.1: PUT /api/meeting-reservations/:id
```bash
# Test komutu (Postman veya curl ile)
PUT http://localhost:3001/api/meeting-reservations/{reservation_id}
Headers: Authorization: Bearer {token}
Body: {
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "notes": "Güncellenmiş notlar"
}
```

**Beklenen Sonuç:**
- 200 OK dönmeli
- Güncellenmiş rezervasyon bilgileri dönmeli

#### Senaryo 4.2: DELETE /api/meeting-reservations/:id
```bash
# Test komutu
DELETE http://localhost:3001/api/meeting-reservations/{reservation_id}
Headers: Authorization: Bearer {token}
```

**Beklenen Sonuç:**
- 200 OK dönmeli
- { success: true, message: "Reservation deleted successfully" } dönmeli

#### Senaryo 4.3: Yetkisiz Erişim Testi
```bash
# Başkasının rezervasyonunu düzenlemeyi deneyin
PUT http://localhost:3001/api/meeting-reservations/{other_user_reservation_id}
```

**Beklenen Sonuç:**
- 403 Forbidden dönmeli
- "You can only update your own reservations" mesajı dönmeli

---

## ✅ Test Checklist

### Frontend Testleri
- [ ] Rezervasyon düzenleme dialog'u açılıyor mu?
- [ ] Form mevcut verilerle dolu mu?
- [ ] Güncelleme başarılı oluyor mu?
- [ ] Silme onay dialog'u çalışıyor mu?
- [ ] Yetkisiz kullanıcılar düzenle/sil butonlarını göremiyor mu?
- [ ] Hata mesajları doğru gösteriliyor mu?
- [ ] Başarı mesajları gösteriliyor mu?

### Backend Testleri
- [ ] PUT endpoint çalışıyor mu?
- [ ] DELETE endpoint çalışıyor mu?
- [ ] Yetki kontrolü yapılıyor mu?
- [ ] Çakışma kontrolü yapılıyor mu?
- [ ] Geçmiş tarih kontrolü yapılıyor mu?
- [ ] Bildirimler gönderiliyor mu?

### Entegrasyon Testleri
- [ ] Rezervasyon güncellendiğinde oda müsaitliği güncelleniyor mu?
- [ ] Rezervasyon silindiğinde oda müsaitliği güncelleniyor mu?
- [ ] Rezervasyon tablosu otomatik yenileniyor mu?

---

## 🐛 Bilinen Sorunlar

Şu ana kadar bilinen sorun yok. Test sırasında bulunan sorunlar buraya eklenecek.

---

## 📝 Test Notları

Test sırasında gözlemlenen davranışlar ve notlar buraya eklenecek.

