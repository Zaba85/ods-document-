import express from 'express'
import { saveUploadedFile, deleteStoredFile, listStoredFiles } from '../services/storage.js'
import { requireAdmin } from '../middleware/middleware.js'

const router = express.Router()

const getBaseUrl = (req) => {
  const envBase = process.env.PUBLIC_BASE_URL
  return envBase ? envBase.replace(/\/+$/, '') : `${req.protocol}://${req.get('host')}`
}

router.get('/health', (req, res) => res.json({ ok: true }))
router.post('/api/check-admin', requireAdmin, (req, res) => res.json({ ok: true }))

router.get('/api/files', async (req, res) => {
  const { projectId, folderId, docType } = req.query
  if (!projectId || !folderId || !docType) return res.json({ files: [] })

  try {
    const names = await listStoredFiles(projectId, folderId, docType)
    const baseUrl = getBaseUrl(req)

    const files = names.map((fname) => ({
      name: fname,
      url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${encodeURIComponent(fname)}`,
      storagePath: `${projectId}/${folderId}/${docType}/${fname}`,
    }))

    res.json({ files })
  } catch (error) {
    console.error('Error listing files:', error)
    res.status(500).json({ error: 'Failed to list files' })
  }
})

router.post('/api/upload', requireAdmin, async (req, res) => {
  const { projectId, folderId, docType } = req.query

  if (!projectId || !folderId || !docType) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  const uploadedFile = req.files?.file
  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file provided' })
  }

  const fileData = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile

  try {
    const saved = await saveUploadedFile(projectId, folderId, docType, fileData.name, fileData.data)
    const baseUrl = getBaseUrl(req)

    res.json({
      name: saved.fileName,
      url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${encodeURIComponent(saved.fileName)}`,
      storagePath: saved.storagePath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

router.delete('/api/files', requireAdmin, async (req, res) => {
  const { storagePath } = req.body || {}
  if (!storagePath) return res.status(400).json({ error: 'Missing storagePath' })

  try {
    await deleteStoredFile(storagePath)
    res.json({ ok: true })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(400).json({ error: 'Invalid path or file in use' })
  }
})

export default router
