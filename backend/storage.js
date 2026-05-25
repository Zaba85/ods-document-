const fs = require("fs");
const path = require("path");

const UPLOAD_ROOT = path.join(__dirname, "uploads");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeJoin(root, ...parts) {
  const full = path.join(root, ...parts);
  const rootResolved = path.resolve(root) + path.sep;
  const fullResolved = path.resolve(full);
  if (!fullResolved.startsWith(rootResolved)) throw new Error("Invalid path");
  return fullResolved;
}

function saveUploadedFile(projectId, folderId, docType, fileName, buffer) {
  const safeName = String(fileName || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = safeName;

  const storagePath = `${projectId}/${folderId}/${docType}/${finalName}`;
  const fullPath = safeJoin(UPLOAD_ROOT, storagePath);

  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, buffer);

  return { storagePath, fileName: finalName };
}

function listStoredFiles(projectId, folderId, docType) {
  const dir = safeJoin(UPLOAD_ROOT, String(projectId), String(folderId), String(docType));
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => {
      try {
        return fs.statSync(path.join(dir, name)).isFile();
      } catch {
        return false;
      }
    });
}

function deleteStoredFile(storagePath) {
  const fullPath = safeJoin(UPLOAD_ROOT, storagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

module.exports = { UPLOAD_ROOT, saveUploadedFile, listStoredFiles, deleteStoredFile };