import type { DocType } from '../lib/utils/types'

type Props = {
  title: string
  canUseOpenPrint: boolean
  canUpload: boolean
  canDelete: boolean
  isAdmin: boolean
  uploadInputRef: React.RefObject<HTMLInputElement>

  openSelected: () => void
  printSelected: () => void
  deleteFile: () => void
  uploadFile: (file: File) => void
  loadFiles: () => void

  selectedDocType: DocType | null
  folderId: string | null
}

export default function TopBar({
  title,
  canUseOpenPrint,
  canUpload,
  canDelete,
  isAdmin,
  uploadInputRef,
  openSelected,
  printSelected,
  deleteFile,
  uploadFile,
  loadFiles,
  selectedDocType,
  folderId,
}: Props) {
  return (
    <div className='topbar'>
      <div className='breadcrumb'>
        <p className='title'>{title}</p>
        <p className='sub'></p>
      </div>

      <div className='actionBar'>
        <button className='btn' onClick={openSelected} disabled={!canUseOpenPrint}>
          Otvoriť
        </button>

        <button className='btn' onClick={printSelected} disabled={!canUseOpenPrint}>
          Tlačiť
        </button>

        {isAdmin && (
          <>
            <button
              className='btn primary'
              onClick={() => uploadInputRef.current?.click()}
              disabled={!canUpload}
            >
              Nahrať
            </button>

            <button className='btn danger' onClick={deleteFile} disabled={!canDelete}>
              Zmazať
            </button>
          </>
        )}

        <button className='btn' onClick={loadFiles} disabled={!selectedDocType || !folderId}>
          Refresh
        </button>

        <input
          ref={uploadInputRef}
          type='file'
          style={{ display: 'none' }}
          accept='.pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            uploadFile(f)
            e.currentTarget.value = ''
          }}
        />
      </div>
    </div>
  )
}