# Örnek Firma Web Sitesi v2

## Çalıştırma
1. `npm install`
2. `npm start`
3. Site: http://localhost:3000
4. Admin: http://localhost:3000/admin

Varsayılan giriş:
- Kullanıcı adı: `admin`
- Şifre: `admin123`

## Render
Build Command: `npm install`
Start Command: `npm start`

Canlı kullanımda Render Environment bölümüne şunları ekleyin:
- `ADMIN_USER`
- `ADMIN_PASS`
- `SESSION_SECRET`

## Bu sürümde düzeltildi
- Admin girişinden sonra `/admin/dashboard.html` rotası sunucuda açıkça tanımlandı.
- Bilinmeyen site yollarına ana sayfa fallback eklendi.
- Açılış, scroll reveal, kart hover, buton ve menü animasyonları eklendi.
- `prefers-reduced-motion` desteği eklendi.
- Admin panelinden ana görsel ve hizmet görselleri yüklenebilir.
