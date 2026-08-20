const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'content.json');
const UPLOAD_DIR = path.join(ROOT, 'public', 'uploads');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || bcrypt.hashSync('admin123', 10);

function readContent() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeContent(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'].includes(file.mimetype);
    cb(ok ? null : new Error('Sadece görsel dosyaları yüklenebilir.'), ok);
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(ROOT, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-before-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

const requireAuth = (req, res, next) => req.session.auth ? next() : res.redirect('/admin/login');

app.get('/', (req, res) => res.render('index', { data: readContent() }));
app.get('/admin/login', (req, res) => res.render('login', { error: null }));
app.post('/admin/login', async (req, res) => {
  const userOk = req.body.username === ADMIN_USER;
  const passOk = await bcrypt.compare(req.body.password || '', ADMIN_PASS_HASH);
  if (!userOk || !passOk) return res.status(401).render('login', { error: 'Kullanıcı adı veya şifre hatalı.' });
  req.session.auth = true;
  res.redirect('/admin');
});
app.post('/admin/logout', requireAuth, (req, res) => req.session.destroy(() => res.redirect('/admin/login')));
app.get('/admin', requireAuth, (req, res) => res.render('admin', { data: readContent(), saved: req.query.saved === '1' }));

app.post('/admin/general', requireAuth, upload.single('heroImage'), (req, res) => {
  const data = readContent();
  data.companyName = req.body.companyName || data.companyName;
  data.hero.title = req.body.heroTitle || '';
  data.hero.subtitle = req.body.heroSubtitle || '';
  data.about.title = req.body.aboutTitle || '';
  data.about.text = req.body.aboutText || '';
  data.contact.phone = req.body.phone || '';
  data.contact.email = req.body.email || '';
  data.contact.address = req.body.address || '';
  data.contact.whatsapp = (req.body.whatsapp || '').replace(/\D/g, '');
  if (req.file) data.hero.image = `/uploads/${req.file.filename}`;
  writeContent(data);
  res.redirect('/admin?saved=1');
});

app.post('/admin/service/:index', requireAuth, upload.single('serviceImage'), (req, res) => {
  const data = readContent();
  const i = Number(req.params.index);
  if (!Number.isInteger(i) || !data.services[i]) return res.status(404).send('Hizmet bulunamadı.');
  data.services[i].title = req.body.title || '';
  data.services[i].text = req.body.text || '';
  if (req.file) data.services[i].image = `/uploads/${req.file.filename}`;
  writeContent(data);
  res.redirect('/admin?saved=1');
});

app.post('/contact', (req, res) => {
  res.redirect('/?message=sent#iletisim');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).send(err.message || 'Bir hata oluştu.');
});

app.listen(PORT, () => console.log(`Örnek Firma: http://localhost:${PORT}`));
