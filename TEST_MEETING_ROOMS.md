# 🧪 Meeting Room Modülü - Test Senaryoları

## 📋 Test Kullanıcıları

| Rol | Email | Şifre | Departman |
|-----|-------|-------|-----------|
| **Admin** | admin@gurgil.com | 123456 | İnsan Kaynakları |
| **Manager** | manager@gurgil.com | 123456 | Bilgi İşlem |
| **Employee** | employee@gurgil.com | 123456 | Bilgi İşlem |

---

## 🔴 TEST 1: ADMIN ROLÜ

### 1.1 Login ve Sayfa Erişimi
1. Chrome'da `http://localhost:8080` açın
2. `admin@gurgil.com` / `123456` ile giriş yapın
3. Sidebar'da **"Toplantı Odaları"** menüsünü görüyor musunuz? ✅
4. Tıklayın ve sayfanın açıldığını kontrol edin

### 1.2 Oda Oluşturma (Admin Only)
1. **"Oda Ekle"** butonuna tıklayın
2. Form doldurun:
   - Oda Adı: `Toplantı Odası A`
   - Kapasite: `10`
   - Konum: `3. Kat, Binası`
   - Açıklama: `Ana toplantı odası - Projeksiyon ve beyaz tahta mevcut`
3. **"Oluştur"** butonuna tıklayın
4. ✅ Toast mesajı görüyor musunuz?
5. ✅ Odanın listede göründüğünü kontrol edin

### 1.3 İkinci Oda Oluşturma
1. Yeni oda oluşturun:
   - Oda Adı: `Toplantı Odası B`
   - Kapasite: `5`
   - Konum: `2. Kat, Binası`
   - Açıklama: `Küçük toplantı odası`
2. ✅ Başarıyla oluşturuldu mu?

### 1.4 Rezervasyon Oluşturma
1. **"Rezervasyon Oluştur"** butonuna tıklayın
2. Form doldurun:
   - Toplantı Odası: `Toplantı Odası A` seçin
   - Tarih: Bugünden sonraki bir tarih seçin
   - Başlangıç Saati: `14:00`
   - Bitiş Saati: `15:00`
   - Notlar: `Proje toplantısı`
3. **"Talep Oluştur"** butonuna tıklayın
4. ✅ Toast mesajı görüyor musunuz?
5. **"Rezervasyonlar"** tabına gidin
6. ✅ Rezervasyonunuzu "Bekliyor" durumunda görüyor musunuz?

### 1.5 Rezervasyonu Onaylama (Admin)
1. **"Rezervasyonlar"** tabında rezervasyonunuzu bulun
2. **"Onayla"** butonuna tıklayın
3. ✅ Toast mesajı görüyor musunuz?
4. ✅ Durum "Onaylandı" olarak değişti mi?
5. **"Çalışma Takvimi"** sayfasına gidin
6. ✅ Toplantı aktivitesinin Calendar'da göründüğünü kontrol edin
7. ✅ Aktivitenin başlığı "Toplantı: Toplantı Odası A" şeklinde mi?

### 1.6 Oda Silme (Admin Only)
1. Bir odanın yanındaki **🗑️ Sil** butonuna tıklayın
2. ✅ Onay dialogu açılıyor mu?
3. **"Sil"** butonuna tıklayın
4. ✅ Oda silindi mi?
5. ✅ Toast mesajı görüyor musunuz?

---

## 🟡 TEST 2: MANAGER ROLÜ

### 2.1 Login ve Sayfa Erişimi
1. **Çıkış Yap** → Yeni incognito penceresi açın (veya farklı browser)
2. `manager@gurgil.com` / `123456` ile giriş yapın
3. Sidebar'da **"Toplantı Odaları"** menüsünü görüyor musunuz? ✅
4. Sayfayı açın

### 2.2 Oda Görüntüleme (Tüm Odalar)
1. **"Odalar"** tabında admin'in oluşturduğu odaları görüyor musunuz? ✅
2. ✅ "Oda Ekle" butonu görünmüyor olmalı (sadece Admin)

### 2.3 Rezervasyon Oluşturma
1. **"Rezervasyon Oluştur"** butonuna tıklayın
2. Form doldurun:
   - Toplantı Odası: `Toplantı Odası A`
   - Tarih: Bugünden sonraki bir tarih
   - Başlangıç: `16:00`
   - Bitiş: `17:00`
   - Notlar: `Ekip toplantısı`
3. **"Talep Oluştur"** butonuna tıklayın
4. ✅ Başarı mesajı görüyor musunuz?

### 2.4 Kendi Departmanından Gelen Talebi Onaylama
1. **"Rezervasyonlar"** tabına gidin
2. Eğer kendi departmanından (Bilgi İşlem) bir talep varsa:
   - ✅ **"Onayla"** ve **"Reddet"** butonlarını görüyor musunuz?
   - **"Onayla"** butonuna tıklayın
   - ✅ Toast mesajı görüyor musunuz?
   - ✅ Durum değişti mi?

### 2.5 Başka Departmandan Gelen Talebi Göremez
1. Admin ile bir rezervasyon oluşturun (İnsan Kaynakları departmanından)
2. Manager ile login olun
3. **"Rezervasyonlar"** tabında sadece kendi departmanından (Bilgi İşlem) gelen talepleri görmeli
4. ✅ İnsan Kaynakları departmanından gelen talebi göremiyor musunuz?

---

## 🟢 TEST 3: EMPLOYEE ROLÜ

### 3.1 Login ve Sayfa Erişimi
1. **Çıkış Yap** → Yeni incognito penceresi
2. `employee@gurgil.com` / `123456` ile giriş yapın
3. Sidebar'da **"Toplantı Odaları"** menüsünü görüyor musunuz? ✅
4. Sayfayı açın

### 3.2 Oda Görüntüleme
1. **"Odalar"** tabında tüm odaları görüyor musunuz? ✅
2. ✅ Her odada "Rezerve Et" butonu var mı?
3. ✅ "Oda Ekle" butonu görünmüyor olmalı

### 3.3 Rezervasyon Oluşturma
1. Bir odanın **"Rezerve Et"** butonuna tıklayın
2. Form otomatik olarak o odada açılıyor mu? ✅
3. Tarih ve saat seçin:
   - Tarih: Bugünden sonraki bir tarih
   - Başlangıç: `10:00`
   - Bitiş: `11:00`
   - Notlar: `Müşteri toplantısı`
4. **"Talep Oluştur"** butonuna tıklayın
5. ✅ Başarı mesajı görüyor musunuz?

### 3.4 Sadece Kendi Rezervasyonlarını Görme
1. **"Rezervasyonlar"** tabına gidin
2. ✅ Sadece kendi rezervasyonlarınızı görüyor musunuz?
3. ✅ Diğer kullanıcıların rezervasyonlarını göremiyor musunuz?
4. ✅ **"Onayla"** / **"Reddet"** butonları görünmüyor olmalı (Employee yetkisi yok)

### 3.5 Onaylanan Rezervasyon Calendar'da Görünüyor mu?
1. Manager veya Admin ile login olun
2. Employee'nin rezervasyonunu onaylayın
3. Employee ile tekrar login olun
4. **"Çalışma Takvimi"** sayfasına gidin
5. ✅ Onaylanan toplantı Calendar'da görünüyor mu?
6. ✅ Aktivite detaylarını kontrol edin

---

## ✅ Genel Test Kontrol Listesi

### Fonksiyonellik
- [ ] Admin oda oluşturabiliyor
- [ ] Admin oda silebiliyor
- [ ] Tüm roller odaları görebiliyor
- [ ] Tüm roller rezervasyon oluşturabiliyor
- [ ] Manager sadece kendi departmanından gelen talepleri görebiliyor
- [ ] Manager kendi departmanından gelen talepleri onaylayabiliyor
- [ ] Employee sadece kendi rezervasyonlarını görebiliyor
- [ ] Employee onay/red butonlarını göremiyor
- [ ] Onaylanan rezervasyonlar Calendar'da görünüyor
- [ ] Çakışma kontrolü çalışıyor (aynı saatte 2 rezervasyon oluşturulamıyor)

### UI/UX
- [ ] Toast mesajları görünüyor
- [ ] Loading state'ler çalışıyor
- [ ] Form validasyonları çalışıyor
- [ ] Hata mesajları görünüyor
- [ ] Responsive tasarım çalışıyor (mobile/tablet)
- [ ] Badge'ler doğru renklerde (Müsait/Dolu, Bekliyor/Onaylandı/Reddedildi)

### Yetkilendirme
- [ ] Admin tüm işlemleri yapabiliyor
- [ ] Manager sadece kendi departmanına ait işlemleri yapabiliyor
- [ ] Employee sadece kendi işlemlerini yapabiliyor
- [ ] Yetkisiz işlemler için hata mesajları görünüyor

---

## 🐛 Bilinen Sorunlar (Varsa)

Test sırasında bulunan sorunları buraya ekleyin:

1. 
2. 
3. 

---

## 📸 Screenshot'lar

Test sırasında önemli ekran görüntüleri alın:
- Admin oda oluşturma ekranı
- Rezervasyon formu
- Rezervasyon tablosu
- Calendar entegrasyonu
- Toast mesajları

---

**Test Tarihi:** _____________  
**Test Eden:** _____________  
**Sonuç:** ☐ Başarılı  ☐ Başarısız (Açıklama: _____________)

