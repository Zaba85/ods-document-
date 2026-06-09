import { Project } from '../lib/utils/types'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logo: any
  role: 'user' | 'admin' | null
  authError: string | null
  queryText: string
  setQueryText: (v: string) => void

  projects: Project[]
  selectedProject: Project | null
  onSelectProject: (p: Project) => void
  resetAll: () => void
  doLogout: () => void
}

export default function Sidebar({
  logo,
  role,
  authError,
  queryText,
  setQueryText,
  projects,
  selectedProject,
  onSelectProject,
  resetAll,
  doLogout,
}: Props) {
  return (
    <aside className='sidebar'>

      {/* ✅ LOGO */}
      <div className='headerCard'>
        <div className='appMark'>
        <img src={logo} alt="logo" className="appLogoImg" />
          <div className='appNameBlock'>
            <div className='appName'>ODS/TDS</div>
            <div className='appTag'>Document Center</div>
          </div>
        </div>
      </div>

      {/* ✅ LOGIN STATUS */}
      <div className='loginCard'>
        <div className='loginRow'>
          <div className='loginStatus'>
            <span className='statusDot' />
            <span className='statusText'>
              {role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>

          <button className='btn' onClick={doLogout}>
            Odhlásiť
          </button>
        </div>

        {authError && <div className='inlineError'>{authError}</div>}
      </div>

      {/* ✅ SEARCH */}
      <div className='search'>
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder='Hľadať…'
        />
      </div>

      {/* ✅ PROJECTS */}
      <div className='projectList'>
        {projects.map((p) => (
          <button
            key={p.id}
            className={`projectBtn ${
              selectedProject?.id === p.id ? 'active' : ''
            }`}
            onClick={() => onSelectProject(p)}
          >
            <div className='name'>{p.name}</div>
          </button>
        ))}
      </div>

      {/* ✅ FOOTER */}
      <div className='sidebarFooter'>
        <button className='btn' onClick={resetAll}>
          späť
        </button>
      </div>
    </aside>
  )
}
