import { Station } from '../lib/utils/types'

type Props = {
  showStations: boolean
  stations: Station[]
  selectedStation: Station | null
  onSelectStation: (st: Station) => void
}

export default function Content({
  showStations,
  stations,
  selectedStation,
  onSelectStation,
}: Props) {
  return (
    <div className="rightPanel">
      
      {showStations && (
        <div className="grid3">
          {stations.map((st) => (
            <button
              key={st.id}
              className={`cardBtn small ${
                selectedStation?.id === st.id ? 'active' : ''
              }`}
              onClick={() => onSelectStation(st)}
            >
              <div className="icon">🔲</div>
              <span>{st.name}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
