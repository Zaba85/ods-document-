type Props = {
    show: boolean
    items: { id: string; name: string }[]
    selectedItem: { id: string } | null
    onSelect: (item: { id: string; name: string }) => void
  }
  
  export default function CommonItemsGrid({
    show,
    items,
    selectedItem,
    onSelect,
  }: Props) {
    if (!show) return null
  
    return (
      <div className='grid3'>
        {items.map((item) => (
          <button
            key={item.id}
            className={`cardBtn ${
              selectedItem?.id === item.id ? 'active' : ''
            }`}
            onClick={() => onSelect(item)}
          >
            <div className='icon'>🔲</div>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    )
  }