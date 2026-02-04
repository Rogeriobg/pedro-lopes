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
// DIAGNÓSTICO AVANÇADO
// ==========================================================
app.get("/api/debug", (req, res) => {
  const uploadsPath =
    process.env.NODE_ENV === "production"
      ? path.join(__dirname, "../public_html/uploads")
      : path.join(__dirname, "public/uploads");

  let writeTest = "Não testado";
  try {
    const testFile = path.join(uploadsPath, "test.txt");
    fs.writeFileSync(testFile, "teste de escrita " + new Date());
    fs.unlinkSync(testFile);
    writeTest = "OK - Permissão de escrita confirmada";
  } catch (err) {
    writeTest = "ERRO: Sem permissão de escrita - " + err.message;
  }

  res.json({
    status: "online",
    ambiente: process.env.NODE_ENV || "development",
    caminho_calculado: uploadsPath,
    pasta_existe: fs.existsSync(uploadsPath),
    teste_escrita: writeTest,
    pastas_internas: {
      imagens: fs.existsSync(path.join(uploadsPath, "imagens")),
      musicas: fs.existsSync(path.join(uploadsPath, "musicas")),
    },
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
      console.log("[AUTH] Login OK");
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
const UPLOADS_ROOT =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../public_html/uploads")
    : path.join(__dirname, "public/uploads");

// Garantia de estrutura
if (!fs.existsSync(UPLOADS_ROOT))
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
["imagens", "musicas"].forEach((f) => {
  const d = path.join(UPLOADS_ROOT, f);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

app.use("/uploads", express.static(UPLOADS_ROOT));

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
  res.json({ url: `/uploads/${folder}/${req.file.filename}` });
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
app.listen(PORT, () => console.log(`🚀 API ON: Porta ${PORT}`));
