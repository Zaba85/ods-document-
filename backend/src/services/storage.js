import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import fsPromises from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const UPLOAD_ROOT = path.join(__dirname, '../..', 'uploads')
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true })
}

function safeJoin(root, ...parts) {
  const fullPath = path.resolve(root, ...parts)
  if (!fullPath.startsWith(path.resolve(root))) {
    throw new Error('Invalid path: path traversal attempt.')
  }
  return fullPath
}

export async function saveUploadedFile(projectId, folderId, docType, fileName, buffer) {
  const safeName = String(fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  const finalName = `${Date.now()}_${safeName}`

  const storagePath = path.posix.join(String(projectId), String(folderId), String(docType), finalName)
  const fullPath = safeJoin(UPLOAD_ROOT, String(projectId), String(folderId), String(docType), finalName)

  await fsPromises.mkdir(path.dirname(fullPath), { recursive: true })
  await fsPromises.writeFile(fullPath, buffer)

  return { storagePath, fileName: finalName }
}

export async function listStoredFiles(projectId, folderId, docType) {
  const dir = safeJoin(UPLOAD_ROOT, String(projectId), String(folderId), String(docType))
  try {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true })
    return entries.filter((dirent) => dirent.isFile()).map((dirent) => dirent.name)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export async function deleteStoredFile(storagePath) {
  const fullPath = safeJoin(UPLOAD_ROOT, storagePath)
  try {
    await fsPromises.unlink(fullPath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
