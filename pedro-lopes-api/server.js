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

// ==========================================================
// CONFIGURAÇÕES DE SEGURANÇA (ADMIN)
// ==========================================================
const DEFAULT_HASH =
  "$2b$10$89v4l.tEEn1f8.6lS6vVme1hS6S6S6S6S6S6S6S6S6S6S6S6S6S6S"; // pedro123
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  if (!password)
    return res
      .status(400)
      .json({ success: false, error: "Senha não fornecida." });

  try {
    const match = await bcrypt.compare(password, ADMIN_HASH);
    if (match) {
      console.log("[AUTH] Acesso administrativo concedido.");
      res.json({ success: true });
    } else {
      console.warn("[AUTH] Tentativa de login com senha incorreta.");
      res.status(401).json({ success: false, error: "Senha inválida." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erro interno na autenticação." });
  }
});

// ==========================================================
// CONFIGURAÇÕES DE UPLOAD E CAMINHOS (VPS vs LOCAL)
// ==========================================================

// Se estiver na VPS (production), salva em uma pasta fora da API para o Nginx acessar fácil
// Se estiver local, salva dentro da pasta public/uploads da API
const UPLOADS_ROOT =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../public_html/uploads")
    : path.join(__dirname, "public/uploads");

// Garante que as subpastas existam
const subfolders = ["imagens", "musicas"];
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}
subfolders.forEach((folder) => {
  const dir = path.join(UPLOADS_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Servir estáticos como fallback
app.use("/uploads", express.static(UPLOADS_ROOT));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.body.folder || "imagens";
    const dest = path.join(UPLOADS_ROOT, subfolder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const cleanName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, cleanName);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    const subfolder = req.body.folder || "imagens";

    // IMPORTANTE: Retornamos o caminho relativo.
    // O Nginx ou o Proxy se encarregam de resolver o domínio.
    const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    res.status(500).json({ error: "Erro no upload." });
  }
});

// ==========================================================
// CONFIGURAÇÃO DE E-MAIL (GMAIL)
// ==========================================================
const GMAIL_USER = process.env.GMAIL_USER || "studiorgonline@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS || "vjof xevt cmvq ywmw";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const mailOptions = {
    from: GMAIL_USER,
    to: GMAIL_USER,
    replyTo: email,
    subject: `🎤 SITE PEDRO LOPES: ${subject || "Novo Contato"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #8B1A1A; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Novo Contato Recebido</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Assunto:</strong> ${subject || "Sem assunto"}</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #8B1A1A; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; color: #555; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Gerado pelo formulário do site Pedro Lopes Oficial.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("[SMTP ERROR]", error.message);
    res.status(500).json({ error: "Erro ao processar o envio." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta: ${PORT}`);
  console.log(`📁 Pasta de uploads: ${UPLOADS_ROOT}`);
});
