const express = require("express");
const session = require("express-session");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "content.json");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "ornek-firma-demo-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

const siteUpload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 8 * 1024 * 1024 }
});

const jobUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const allowedExt = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) return cb(null, true);
    return cb(new Error("CV yalnızca PDF, DOC veya DOCX formatında olabilir."));
  }
});

function getContent() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveContent(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function auth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect("/admin");
}

function clean(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465,
    auth: { user, pass }
  });
}

app.get("/api/content", (req, res) => res.json(getContent()));

app.get("/admin", (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect("/admin/dashboard.html");
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

app.post("/admin/login", (req, res) => {
  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASS || "admin123";

  if (req.body.username === username && req.body.password === password) {
    req.session.isAdmin = true;
    return res.redirect("/admin/dashboard.html");
  }
  return res.redirect("/admin?error=1");
});

app.get("/admin/dashboard.html", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

app.post("/admin/save", auth, siteUpload.fields([
  { name: "logo", maxCount: 1 },
  { name: "heroImage", maxCount: 1 },
  { name: "serviceImage0", maxCount: 1 },
  { name: "serviceImage1", maxCount: 1 },
  { name: "serviceImage2", maxCount: 1 },
  { name: "serviceDetailImage0", maxCount: 1 },
  { name: "serviceDetailImage1", maxCount: 1 },
  { name: "serviceDetailImage2", maxCount: 1 }
]), (req, res) => {
  const content = getContent();
  const b = req.body;

  content.companyName = b.companyName || content.companyName;
  content.heroTitle = b.heroTitle || "";
  content.heroText = b.heroText || "";
  content.aboutTitle = b.aboutTitle || "";
  content.aboutText = b.aboutText || "";
  content.phone = b.phone || "";
  content.email = b.email || "";
  content.jobRecipient = b.jobRecipient || content.jobRecipient || content.email || "";
  content.address = b.address || "";
  content.whatsapp = b.whatsapp || "";

  if (req.files?.logo?.[0]) {
    content.logo = "/uploads/" + req.files.logo[0].filename;
  }
  if (req.files?.heroImage?.[0]) {
    content.heroImage = "/uploads/" + req.files.heroImage[0].filename;
  }

  content.services = [0, 1, 2].map(i => {
    const current = content.services[i] || {};
    const image = req.files?.["serviceImage" + i]?.[0]
      ? "/uploads/" + req.files["serviceImage" + i][0].filename
      : current.image || "";

    const detailImage = req.files?.["serviceDetailImage" + i]?.[0]
      ? "/uploads/" + req.files["serviceDetailImage" + i][0].filename
      : current.detailImage || "";

    return {
      title: b["serviceTitle" + i] || "",
      text: b["serviceText" + i] || "",
      image,
      detailImage,
      detailText: b["serviceDetailText" + i] || ""
    };
  });

  saveContent(content);
  res.redirect("/admin/dashboard.html?saved=1");
});

app.post("/job-application", (req, res) => {
  jobUpload.single("cv")(req, res, async (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE"
        ? "CV dosyası en fazla 7 MB olabilir."
        : err.message || "Dosya yüklenemedi.";
      return res.status(400).send(`<h2>Başvuru gönderilemedi</h2><p>${message}</p><p><a href="/#is-basvurusu">Forma dön</a></p>`);
    }

    try {
      const fullName = clean(req.body.fullName, 150);
      const phone = clean(req.body.phone, 50);
      const email = clean(req.body.email, 180);
      const position = clean(req.body.position, 150);
      const about = clean(req.body.about, 5000);

      if (!fullName || !phone || !email || !position || !about || !req.file) {
        return res.redirect("/?job=missing#is-basvurusu");
      }

      const transporter = createMailer();
      if (!transporter) {
        console.error("İş başvurusu alınamadı: SMTP environment değişkenleri eksik.");
        return res.redirect("/?job=mailconfig#is-basvurusu");
      }

      const content = getContent();
      const recipient = content.jobRecipient || process.env.JOB_RECIPIENT || content.email || process.env.SMTP_USER;
      const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"${content.companyName || "Web Sitesi"} İş Başvurusu" <${fromAddress}>`,
        to: recipient,
        replyTo: email,
        subject: `Yeni İş Başvurusu - ${fullName} - ${position}`,
        text: [
          "Yeni bir iş başvurusu alındı.",
          "",
          `Ad Soyad: ${fullName}`,
          `Telefon: ${phone}`,
          `E-posta: ${email}`,
          `Pozisyon: ${position}`,
          "",
          "Açıklama:",
          about
        ].join("\n"),
        html: `
          <h2>Yeni İş Başvurusu</h2>
          <p><strong>Ad Soyad:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
          <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
          <p><strong>Pozisyon:</strong> ${escapeHtml(position)}</p>
          <p><strong>Açıklama:</strong></p>
          <p>${escapeHtml(about).replace(/\n/g, "<br>")}</p>
        `,
        attachments: [{
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: req.file.mimetype
        }]
      });

      return res.redirect("/?job=success#is-basvurusu");
    } catch (error) {
      console.error("İş başvurusu e-posta hatası:", error);
      return res.redirect("/?job=error#is-basvurusu");
    }
  });
});

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

app.get("/hizmet/:id", (req, res) => {
  const id = Number(req.params.id);
  const content = getContent();

  if (!Number.isInteger(id) || id < 0 || id >= (content.services || []).length) {
    return res.redirect("/#hizmetler");
  }

  return res.sendFile(path.join(__dirname, "public", "service-detail.html"));
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
