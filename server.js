const express = require("express");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "content.json");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "ornek-firma-demo-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

const upload = multer({ dest: UPLOAD_DIR });

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

app.post("/admin/save", auth, upload.fields([
  { name: "heroImage", maxCount: 1 },
  { name: "serviceImage0", maxCount: 1 },
  { name: "serviceImage1", maxCount: 1 },
  { name: "serviceImage2", maxCount: 1 }
]), (req, res) => {
  const data = getContent();
  const b = req.body;

  data.companyName = b.companyName || data.companyName;
  data.heroTitle = b.heroTitle || "";
  data.heroText = b.heroText || "";
  data.aboutTitle = b.aboutTitle || "";
  data.aboutText = b.aboutText || "";
  data.phone = b.phone || "";
  data.email = b.email || "";
  data.address = b.address || "";
  data.whatsapp = b.whatsapp || "";

  if (req.files?.heroImage?.[0]) {
    data.heroImage = "/uploads/" + req.files.heroImage[0].filename;
  }

  data.services = [0,1,2].map(i => {
    const current = data.services[i] || {};
    const image = req.files?.["serviceImage"+i]?.[0]
      ? "/uploads/" + req.files["serviceImage"+i][0].filename
      : current.image || "";
    return {
      title: b["serviceTitle"+i] || "",
      text: b["serviceText"+i] || "",
      image
    };
  });

  saveContent(data);
  res.redirect("/admin/dashboard.html?saved=1");
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin"));
});

// SPA/friendly fallback: admin dışındaki bilinmeyen GET yollarında ana sayfa gösterilir.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
