const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Logger simples para ver o que está acontecendo no terminal da VPS
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================================
// CONFIGURAÇÃO DE PASTAS E PERSISTÊNCIA (BANCO JSON)
// ==========================================================
const UPLOADS_ROOT =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../public_html/uploads")
    : path.join(__dirname, "public/uploads");

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Cria as pastas se não existirem
if (!fs.existsSync(UPLOADS_ROOT))
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
["imagens", "musicas"].forEach((f) => {
  const d = path.join(UPLOADS_ROOT, f);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Inicializa o arquivo de banco de dados se não existir
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      shows: [], // Agenda de Shows
      posts: [], // Blog
      gallery: [], // Galeria de Fotos/Vídeos
      songs: [], // Lista de Músicas
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log("✅ Banco de dados db.json criado com sucesso!");
  }
};
initDB();

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = (data) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Servir arquivos estáticos (Mídia)
app.use("/api/uploads", express.static(UPLOADS_ROOT));
app.use("/uploads", express.static(UPLOADS_ROOT));

// ==========================================================
// ROTAS DE DADOS (DADOS PERSISTENTES DA AGENDA, BLOG, ETC)
// ==========================================================

// Buscar todos os dados para o site
app.get("/api/data", (req, res) => {
  try {
    res.json(readDB());
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler dados" });
  }
});

// Adicionar Item (Funciona para 'shows', 'posts', 'gallery', 'songs')
app.post("/api/data/:collection", (req, res) => {
  const { collection } = req.params;
  const item = req.body;
  try {
    const db = readDB();
    if (!db[collection]) db[collection] = [];

    const newItem = { ...item, id: item.id || Date.now().toString() };
    db[collection].unshift(newItem); // Adiciona no topo da lista

    writeDB(db);
    console.log(`✅ Item adicionado em ${collection}:`, newItem.id);
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar item" });
  }
});

// Deletar Item
app.delete("/api/data/:collection/:id", (req, res) => {
  const { collection, id } = req.params;
  try {
    const db = readDB();
    if (db[collection]) {
      db[collection] = db[collection].filter((i) => i.id !== id);
      writeDB(db);
      console.log(`🗑️ Item deletado de ${collection}:`, id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar item" });
  }
});

// ==========================================================
// LOGIN E UPLOAD DE ARQUIVOS
// ==========================================================
const DEFAULT_HASH =
  "$2b$10$89v4l.tEEn1f8.6lS6vVme1hS6S6S6S6S6S6S6S6S6S6S6S6S6S6S"; // senha: pedro123
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  try {
    const match = await bcrypt.compare(password, ADMIN_HASH);
    res.json({ success: match });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || "imagens";
    cb(null, path.join(UPLOADS_ROOT, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Arquivo não enviado." });
  const folder = req.body.folder || "imagens";
  res.json({ url: `/api/uploads/${folder}/${req.file.filename}` });
});

// Contato por e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "studiorgonline@gmail.com",
    pass: process.env.GMAIL_PASS || "vjof xevt cmvq ywmw",
  },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await transporter.sendMail({
      from: "Site Pedro Lopes",
      to: process.env.GMAIL_USER || "studiorgonline@gmail.com",
      subject: `CONTATO SITE: ${subject}`,
      text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro e-mail" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 API PEDRO LOPES ONLINE NA PORTA ${PORT}`),
);
