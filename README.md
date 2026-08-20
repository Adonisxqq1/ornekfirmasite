# Örnek Firma — Servis Hizmetleri Sitesi

## Kurulum
1. Bilgisayarda Node.js 18+ kurulu olsun.
2. Terminalde proje klasörüne girin.
3. `npm install`
4. `npm start`
5. Site: http://localhost:3000
6. Yönetim: http://localhost:3000/admin

## İlk admin girişi
- Kullanıcı adı: `admin`
- Şifre: `admin123`

Canlıya almadan önce mutlaka değiştirin.

## Güvenli admin ayarı
Yeni şifre için bcrypt hash üretin:
`node -e "console.log(require('bcryptjs').hashSync('YENI-SIFRENIZ',10))"`

Sonra ortam değişkenleri:
- `ADMIN_USER`
- `ADMIN_PASS_HASH`
- `SESSION_SECRET`

## Panelden değiştirilebilenler
- Firma adı
- Ana slider başlığı, açıklaması ve görseli
- Hakkımızda başlığı/metni
- Telefon, e-posta, adres, WhatsApp
- 3 hizmet kartının başlık, açıklama ve görselleri

## Not
Bu sürüm MVP'dir. İletişim formu şu anda e-posta göndermez; görsel olarak çalışır ve ana sayfaya geri döner. Sonraki sürümde mesajları veritabanına kaydetme/e-posta gönderme eklenebilir.
