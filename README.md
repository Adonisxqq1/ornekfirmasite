# Örnek Firma Web Sitesi v3

Bu sürümde:
- Üst menüde firma adı yerine admin panelinden logo yükleme desteği.
- Footer ve admin panelinde logo desteği.
- "İş Başvurusu" menüsü ve formu.
- Alanlar: Ad Soyad, Telefon, E-posta, Pozisyon, Açıklama ve CV.
- CV türleri: PDF, DOC, DOCX. Maksimum 7 MB.
- Başvuru, CV ekiyle birlikte e-posta adresine gönderilir.
- Önceki animasyonlar ve admin yönlendirme düzeltmesi korunmuştur.

## Çalıştırma
npm install
npm start

Site: http://localhost:3000
Admin: http://localhost:3000/admin

Varsayılan admin:
- Kullanıcı adı: admin
- Şifre: admin123

## Render
Build Command: npm install
Start Command: npm start

### Admin güvenliği
Render > Environment:
- ADMIN_USER
- ADMIN_PASS
- SESSION_SECRET

### İş başvurusu e-posta ayarları
Render > Environment:
- SMTP_HOST (ör. smtp.gmail.com)
- SMTP_PORT (587)
- SMTP_SECURE (false)
- SMTP_USER (gönderen e-posta)
- SMTP_PASS (SMTP / uygulama şifresi)
- JOB_RECIPIENT (başvuruların geleceği e-posta)
- MAIL_FROM (isteğe bağlı, varsayılan SMTP_USER)

Gmail için normal hesap şifresi değil, Google hesabından oluşturulan Uygulama Şifresi kullanılmalıdır.

Not: Render'ın normal dosya sistemi kalıcı değildir. Admin panelinden yüklenen logo/görseller yeni deploy veya servis yeniden oluşturma sonrasında kaybolabilir. Canlı kullanımda görselleri Cloudinary/S3 gibi kalıcı depolamaya taşımak daha doğru olur.


## v4 - Hizmet detay sayfaları
- Ana sayfadaki 3 hizmet kartı tıklanabilir hale getirildi.
- Her kart `/hizmet/0`, `/hizmet/1`, `/hizmet/2` şeklinde kendi detay sayfasına gider.
- Detay sayfasında üst görsel, hizmet başlığı, kısa özet ve uzun açıklama bulunur.
- Admin panelinden her hizmet için:
  - Kart başlığı
  - Kart kısa açıklaması
  - Kart görseli
  - Detay sayfası üst görseli
  - Detay sayfası uzun açıklaması
  düzenlenebilir.
