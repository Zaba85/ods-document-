import path from 'path'

export const UPLOAD_ROOT = path.join(import.meta.dir, '..', '..', 'uploads')

function safeJoin(root: string, ...parts: string[]): string {
  const fullPath = path.resolve(root, ...parts)
  if (!fullPath.startsWith(path.resolve(root))) {
    throw new Error('Invalid path: Path traversal attempt')
  }
  return fullPath
}

export async function saveUploadFile(
  projectId: string,
  folderId: string,
  docType: string,
  fileName: string,
  arrayBuffer: ArrayBuffer,
) {
  const safeName = String(fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  const finalName = `${Date.now()}_${safeName}`

  const storagePath = path.posix.join(projectId, folderId, docType, finalName)
  const fullPath = safeJoin(UPLOAD_ROOT, projectId, folderId, docType, finalName)

  await Bun.write(fullPath, arrayBuffer)
  return { storagePath, fileName: finalName }
}

export async function listStoredFiles(projectId: string, folderId: string, docType: string): Promise<string[]> {
  const dir = safeJoin(UPLOAD_ROOT, projectId, folderId, docType)
  try {
    const glob = new Bun.Glob('*')
    const files: string[] = []
    for await (const file of glob.scan({ cwd: dir, onlyFiles: true })) {
      files.push(file)
    }
    return files
  } catch (error) {
    return []
  }
}

export async function deleteStoredFile(storagePath: string) {
  const fullPath = safeJoin(UPLOAD_ROOT, storagePath)
  const file = Bun.file(fullPath)
  if (await file.exists()) {
    await file.delete()
  }
}
