import { SideId } from '../lib/utils/types'
import { sideLabel } from '../lib/utils/helpers'

type Props = {
  show: boolean
  availableSides: SideId[]
  selectedSide: SideId | null
  onSelect: (side: SideId) => void
}

export default function SideGrid({
  show,
  availableSides,
  selectedSide,
  onSelect,
}: Props) {
  if (!show) return null

  return (
    <div className='grid3'>
      {availableSides.map((side) => (
        <button
          key={side}
          className={`cardBtn big ${selectedSide === side ? 'active' : ''}`}
          onClick={() => onSelect(side)}
        >
          <div className='icon'>
            {side === 'front' && '🟦'}
            {side === 'rear' && '🟧'}
            {side === 'common' && '🟪'}
          </div>
          <span>{sideLabel(side)}</span>
        </button>
      ))}
    </div>
  )
}