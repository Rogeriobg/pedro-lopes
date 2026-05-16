const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const UPLOADS_ROOT =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../public_html/uploads")
    : path.join(__dirname, "public/uploads");

const DATA_DIR = path.join(__dirname, "data");

const DB_FILE = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, {
    recursive: true,
  });
}

["imagens", "musicas"].forEach((folder) => {
  const dir = path.join(UPLOADS_ROOT, folder);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
});

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true,
  });
}

const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      shows: [],
      posts: [],
      gallery: [],
      songs: [],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));

    console.log("Banco db.json criado");
  }
};

initDB();

const readDB = () => {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

app.use("/api/uploads", express.static(UPLOADS_ROOT));

app.use("/uploads", express.static(UPLOADS_ROOT));

const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH;

const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_HASH) {
  console.error("ADMIN_PASSWORD_HASH não encontrado no .env");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("JWT_SECRET não encontrado no .env");
  process.exit(1);
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Token não enviado",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Token expirado ou inválido",
    });
  }
};

app.post("/api/login", async (req, res) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Senha obrigatória",
      });
    }

    const match = await bcrypt.compare(password, ADMIN_HASH);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Senha inválida",
      });
    }

    const token = jwt.sign(
      {
        admin: true,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erro interno",
    });
  }
});

app.get("/api/data", (req, res) => {
  try {
    const db = readDB();

    res.json(db);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao ler dados",
    });
  }
});

app.post("/api/data/:collection", authMiddleware, (req, res) => {
  const { collection } = req.params;

  const item = req.body;

  try {
    const db = readDB();

    if (!db[collection]) {
      db[collection] = [];
    }

    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
    };

    db[collection].unshift(newItem);

    writeDB(db);

    res.json(newItem);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao salvar item",
    });
  }
});

app.delete("/api/data/:collection/:id", authMiddleware, (req, res) => {
  const { collection, id } = req.params;

  try {
    const db = readDB();

    if (db[collection]) {
      db[collection] = db[collection].filter((item) => item.id !== id);

      writeDB(db);
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao deletar item",
    });
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

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Arquivo não enviado",
    });
  }

  const folder = req.body.folder || "imagens";

  res.json({
    success: true,
    url: `/api/uploads/${folder}/${req.file.filename}`,
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,

      to: process.env.GMAIL_USER,

      subject: `CONTATO SITE: ${subject}`,

      text: `
Nome: ${name}
Email: ${email}

Mensagem:
${message}
      `,
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao enviar e-mail",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API ONLINE RODANDO NA PORTA ${PORT}`);
});
