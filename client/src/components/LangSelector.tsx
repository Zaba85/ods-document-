type Props = {
    show: boolean
    selectedLang: 'EN' | 'UK' | 'SK' | null
    setSelectedLang: (l: 'EN' | 'UK' | 'SK') => void
  }
  
  export default function LangSelector({
    show,
    selectedLang,
    setSelectedLang,
  }: Props) {
    if (!show) return null
  
    return (
      <div className='langGrid'>
        <button
          className={`cardBtn smallCard ${selectedLang === 'SK' ? 'active' : ''}`}
          onClick={() => setSelectedLang('SK')}
        >
          🇸🇰 SK
        </button>
  
        <button
          className={`cardBtn smallCard ${selectedLang === 'UK' ? 'active' : ''}`}
          onClick={() => setSelectedLang('UK')}
        >
          🇺🇦 UK
        </button>
  
        <button
          className={`cardBtn smallCard ${selectedLang === 'EN' ? 'active' : ''}`}
          onClick={() => setSelectedLang('EN')}
        >
          🇬🇧 EN
        </button>
      </div>
    )
  }