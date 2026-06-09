import { createPortal } from 'react-dom'
import type { ServerFile } from '../lib/utils/types'

type Props = {
  openDoc: ServerFile | null
  isPdfName: (name: string) => boolean
  setOpenDoc: (file: ServerFile | null) => void
  printFromModal: () => void
}

export default function PdfModal({
  openDoc,
  isPdfName,
  setOpenDoc,
  printFromModal,
}: Props) {
  if (!openDoc?.url || !isPdfName(openDoc.name)) return null

  return createPortal(
    <div className='modalBackdrop' onClick={() => setOpenDoc(null)}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <div className='modalTop'>
          <div className='docTitle'>{openDoc.name}</div>
          <div className='btnRow'>
            <button className='btn' onClick={printFromModal}>
              Tlačiť
            </button>
            <button className='btn primary' onClick={() => setOpenDoc(null)}>
              Zavrieť
            </button>
          </div>
        </div>

        <iframe id='pdfFrame' title='pdf' src={openDoc.url} />
      </div>
    </div>,
    document.body
  )
}