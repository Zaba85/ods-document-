type Props = {
    show: boolean
    selectedDocType: string | null
    onSelect: (dt: 'ODS' | 'TDS') => void
  }
  
  export default function DocTypeGrid({
    show,
    selectedDocType,
    onSelect,
  }: Props) {
    if (!show) return null
  
    return (
      <div className='docTypeGrid'>
        <button
          className={`cardBtn smallCard ${selectedDocType === 'ODS' ? 'active' : ''}`}
          onClick={() => onSelect('ODS')}
        >
          📄 ODS
        </button>
  
        <button
          className={`cardBtn smallCard ${selectedDocType === 'TDS' ? 'active' : ''}`}
          onClick={() => onSelect('TDS')}
        >
          📑 TDS
        </button>
      </div>
    )
  }