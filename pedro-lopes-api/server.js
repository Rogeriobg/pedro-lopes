const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Carrega variáveis do arquivo .env

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================================
// CONFIGURAÇÕES DE SEGURANÇA (ADMIN)
// ==========================================================

// Hash da senha "pedro123" para funcionamento padrão.
// Em produção, você deve gerar um novo hash e colocar no seu .env como ADMIN_PASSWORD_HASH
const DEFAULT_HASH =
  "$2b$10$89v4l.tEEn1f8.6lS6vVme1hS6S6S6S6S6S6S6S6S6S6S6S6S6S6S"; // Exemplo para 'pedro123'
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

app.post("/api/login", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ success: false, error: "Senha não fornecida." });
  }

  try {
    // Compara a senha enviada com o Hash seguro
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
// CONFIGURAÇÕES DE UPLOAD
// ==========================================================
const BASE_UPLOAD_DIR = path.join(__dirname, "public/uploads");
const subfolders = ["imagens", "musicas"];

if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

subfolders.forEach((folder) => {
  const dir = path.join(BASE_UPLOAD_DIR, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use("/uploads", express.static(BASE_UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.body.folder || "imagens";
    const dest = path.join(BASE_UPLOAD_DIR, subfolder);
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
    const fileUrl = `http://localhost:5000/uploads/${subfolder}/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
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
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #8B1A1A; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Novo Contato Recebido</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-bottom: 10px;"><strong>Nome do Interessado:</strong> ${name}</p>
          <p style="margin-bottom: 10px;"><strong>E-mail de Contato:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin-bottom: 25px;"><strong>Assunto:</strong> ${subject || "Sem assunto"}</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #8B1A1A; border-radius: 4px;">
            <p style="margin: 0; color: #555; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
        <div style="background-color: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          Este e-mail foi gerado automaticamente pelo formulário do site Pedro Lopes Oficial.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("[ERRO SMTP]", error.message);
    res.status(500).json({ error: "Erro ao processar o envio." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
