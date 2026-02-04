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

// Logger de requisições para o PM2
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================================
// CONFIGURAÇÃO DE CAMINHOS
// ==========================================================
const UPLOADS_ROOT =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../public_html/uploads")
    : path.join(__dirname, "public/uploads");

// Garantia de estrutura de pastas
if (!fs.existsSync(UPLOADS_ROOT))
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
["imagens", "musicas"].forEach((f) => {
  const d = path.join(UPLOADS_ROOT, f);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// IMPORTANTE: Servir os arquivos através de /api/uploads para o Nginx aceitar
app.use("/api/uploads", express.static(UPLOADS_ROOT));
// Manter compatibilidade local caso necessário
app.use("/uploads", express.static(UPLOADS_ROOT));

// ==========================================================
// DIAGNÓSTICO
// ==========================================================
app.get("/api/debug", (req, res) => {
  let writeTest = "Não testado";
  try {
    const testFile = path.join(UPLOADS_ROOT, "test.txt");
    fs.writeFileSync(testFile, "teste " + new Date());
    fs.unlinkSync(testFile);
    writeTest = "OK";
  } catch (err) {
    writeTest = "ERRO: " + err.message;
  }

  res.json({
    status: "online",
    ambiente: process.env.NODE_ENV || "development",
    caminho_uploads: UPLOADS_ROOT,
    teste_escrita: writeTest,
    info: "Use /api/uploads/imagens/[nome] para acessar arquivos",
  });
});

// ==========================================================
// LOGIN
// ==========================================================
const DEFAULT_HASH =
  "$2b$10$89v4l.tEEn1f8.6lS6vVme1hS6S6S6S6S6S6S6S6S6S6S6S6S6S6S"; // pedro123
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  try {
    const match = await bcrypt.compare(password, ADMIN_HASH);
    if (match) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Senha incorreta." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro interno." });
  }
});

// ==========================================================
// UPLOAD
// ==========================================================
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
  if (!req.file)
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  const folder = req.body.folder || "imagens";
  // Retornamos a URL com o prefixo /api para o Nginx redirecionar corretamente
  res.json({ url: `/api/uploads/${folder}/${req.file.filename}` });
});

// ==========================================================
// CONTATO
// ==========================================================
const GMAIL_USER = process.env.GMAIL_USER || "studiorgonline@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS || "vjof xevt cmvq ywmw";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await transporter.sendMail({
      from: GMAIL_USER,
      to: GMAIL_USER,
      replyTo: email,
      subject: `SITE PEDRO LOPES: ${subject}`,
      text: `De: ${name} (${email})\n\nMensagem:\n${message}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Falha ao enviar e-mail." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API RODANDO NA PORTA: ${PORT}`));
