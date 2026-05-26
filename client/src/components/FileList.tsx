import type { ServerFile, DocType, Project } from '../lib/utils/types'

type Props = {
  files: ServerFile[]
  activeFile: ServerFile | null
  loading: boolean
  selectedProject: Project | null
  folderId: string | null
  selectedDocType: DocType | null
  isAdmin: boolean
  setActiveFile: (file: ServerFile) => void
  isPdfName: (name: string) => boolean
  isExcelName: (name: string) => boolean
}

export default function FileList({
  files,
  activeFile,
  loading,
  selectedProject,
  folderId,
  selectedDocType,
  isAdmin,
  setActiveFile,
  isPdfName,
  isExcelName,
}: Props) {
  return (
    <div className='panel'>
      <div className='panelHeader'>
        <div className='badge'></div>
        <div className='small'>Počet: {files.length}</div>
      </div>

      {loading && (
        <div className='docRow'>
          <div className='left'>
            <div className='docName'>Načítavam…</div>
          </div>
        </div>
      )}

      {!loading && selectedProject && folderId && selectedDocType && files.length === 0 && (
        <div className='docRow'>
          <div className='left'>
            <div className='docName'>Žiadne súbory</div>
            <div className='docMeta'>{isAdmin ? 'Použi Nahrať.' : ''}</div>
          </div>
        </div>
      )}

      {files.map((f) => {
        const selected = activeFile?.storagePath === f.storagePath

        return (
          <button
            key={f.storagePath}
            className={`docRow docRowButton ${selected ? 'activeRow' : ''}`}
            onClick={() => setActiveFile(f)}
          >
            <div className='left'>
              <div className='docName'>{f.name}</div>
              <div className='docMeta'>
                <span className='urlEllipsis'>{f.url}</span>
              </div>
            </div>

            <div className='actions'>
              <span className={`fileTag ${isPdfName(f.name) ? 'pdf' : isExcelName(f.name) ? 'xls' : ''}`}>
                {isPdfName(f.name) ? 'PDF' : isExcelName(f.name) ? 'XLS' : 'FILE'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}