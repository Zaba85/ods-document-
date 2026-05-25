const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const { UPLOAD_ROOT, saveUploadedFile, deleteStoredFile, listStoredFiles } = require("./storage");

const app = express();

const PORT = Number(process.env.PORT || 3000);

const ADMIN_KEY = process.env.ADMIN_KEY || "1234";

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-admin-key"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, 
    abortOnLimit: true,
  })
);

if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

app.use(
  "/uploads",
  express.static(UPLOAD_ROOT, {
    setHeaders: (res, filePath) => {
      const p = String(filePath).toLowerCase();
      if (p.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    },
  })
);

function requireAdmin(req, res, next) {
  const key = req.header("x-admin-key");
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function getBaseUrl(req) {
  const envBase = process.env.PUBLIC_BASE_URL;
  if (envBase && envBase.trim()) return envBase.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/check-admin", (req, res) => {
  const key = req.header("x-admin-key");
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ ok: false });
  res.json({ ok: true });
});

app.get("/api/files", (req, res) => {
  const { projectId, folderId, docType } = req.query;

  if (!projectId || !folderId || !docType) return res.json({ files: [] });

  const names = listStoredFiles(String(projectId), String(folderId), String(docType));
  const baseUrl = getBaseUrl(req);

  const files = names.map((fname) => ({
    name: fname,
    url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${encodeURIComponent(fname)}`,
    storagePath: `${projectId}/${folderId}/${docType}/${fname}`,
  }));

  res.json({ files });
});

app.post("/api/upload", requireAdmin, (req, res) => {
  const { projectId, folderId, docType } = req.query;

  if (!projectId || !folderId || !docType) {
    return res.status(400).json({ error: "Missing projectId/folderId/docType" });
  }

  if (!req.files || !req.files.file) return res.status(400).json({ error: "No file" });

  const uploaded = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;

  if (!uploaded || !uploaded.data) {
    return res.status(400).json({ error: "Invalid uploaded file (missing data)" });
  }

  const originalName = String(uploaded.name || "file");
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}_${safeName}`;

  try {
    const saved = saveUploadedFile(String(projectId), String(folderId), String(docType), fileName, uploaded.data);

    const baseUrl = getBaseUrl(req);

    res.json({
      name: fileName,
      url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${encodeURIComponent(fileName)}`,
      storagePath: saved.storagePath,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.delete("/api/files", requireAdmin, (req, res) => {
  const { storagePath } = req.body || {};
  if (!storagePath) return res.status(400).json({ error: "Missing storagePath" });

  try {
    deleteStoredFile(storagePath);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Invalid path" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend beží na: http://localhost:${PORT}`);
  console.log(`📁 Upload root: ${UPLOAD_ROOT}`);
});