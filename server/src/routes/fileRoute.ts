import { Hono } from 'hono'
import { requireAdmin } from '../middleware/userMiddleware'
import { deleteStoredFile, listStoredFiles, saveUploadFile } from '../services/storage'

const fileRoute = new Hono()

const getBaseUrl = (c: any) => {
  const envBase = process.env.PUBLIC_BASE_URL
  if (envBase) return envBase.replace(/\/+$/, '')
  const url = new URL(c.req.url)
  return `${url.protocol}//${url.host}`
}

fileRoute.post('/api/check-admin', requireAdmin, (c) => c.json({ ok: true }))

fileRoute.get('/files', async (c) => {
  const { projectId, folderId, docType } = c.req.query()
  if (!projectId || !folderId || !docType) return c.json({ files: [] })

  try {
    const names = await listStoredFiles(projectId, folderId, docType)
    const baseUrl = getBaseUrl(c)

    const files = names.map((fname) => ({
      name: fname,
      url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${fname}`,
    }))
    return c.json({ files })
  } catch (error) {
    return c.json({ error: 'Failed to list files' }, 500)
  }
})

fileRoute.post('/upload', requireAdmin, async (c) => {
  const { projectId, folderId, docType } = c.req.query()
  if (!projectId || !folderId || !docType) return c.json({ error: 'Missing parameters' }, 400)

  const body = await c.req.parseBody()
  const fileData = body['file']
  if (!fileData || !(fileData instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }
  // max 50 MB
  if (fileData.size > 50 * 1024 * 1024) {
    return c.json({ error: 'File too large' }, 413)
  }

  try {
    const arrayBuffer = await fileData.arrayBuffer()
    const saved = await saveUploadFile(projectId, folderId, docType, fileData.name, arrayBuffer)
    const baseUrl = getBaseUrl(c)

    return c.json({
      name: saved.fileName,
      url: `${baseUrl}/uploads/${encodeURIComponent(projectId)}/${encodeURIComponent(folderId)}/${encodeURIComponent(docType)}/${encodeURIComponent(saved.fileName)}`,
      storagePath: saved.storagePath,
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

fileRoute.delete('/files', requireAdmin, async (c) => {
  const { storagePath } = await c.req.json().catch(() => ({}))
  if (!storagePath) return c.json({ error: 'Missing storagePath' }, 400)

  try {
    await deleteStoredFile(storagePath)
    return c.json({ ok: true })
  } catch (error) {
    return c.json({ error: 'Invalid path or file in use' }, 400)
  }
})

export default fileRoute
