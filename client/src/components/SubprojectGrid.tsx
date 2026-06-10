import { SubProject } from '../lib/utils/types'

type Props = {
  show: boolean
  subProjects: SubProject[]
  selectedSubProject: SubProject | null
  onSelect: (sp: SubProject) => void
}

export default function SubprojectGrid({
  show,
  subProjects,
  selectedSubProject,
  onSelect,
}: Props) {
  if (!show) return null

  return (
    <div className='grid3'>
      {subProjects.map((sp) => (
        <button
          key={sp.id}
          className={`cardBtn ${selectedSubProject?.id === sp.id ? 'active' : ''}`}
          onClick={() => onSelect(sp)}
        >
          <div className='icon'>📁</div>
          <span>{sp.name}</span>
        </button>
      ))}
    </div>
  )
}