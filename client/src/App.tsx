import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import { DocType, Project, ServerFile, SideId, Station, SubProject } from './lib/utils/types'
import { commonNodesByProject, projects, stationsByProjectSides } from './lib/utils/configTree'
import {getSubProjectsFor,isPdfName,isExcelName,openInNewTab,sideLabel,buildFolderId,
} from './lib/utils/helpers'
import TopBar from './components/TopBar'
import FileList from './components/FileList'
import LoginScreen from './components/LoginScreen'
import PdfModal from './components/PdfModal'



const API_BASE = 'http://localhost:3000/api'

type Role = 'user' | 'admin'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [loginName, setLoginName] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedSubProject, setSelectedSubProject] = useState<SubProject | null>(null)
  const [selectedSide, setSelectedSide] = useState<SideId | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [selectedCommonItem, setSelectedCommonItem] = useState<{ id: string; name: string } | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null)

  const [queryText, setQueryText] = useState('')

  const [files, setFiles] = useState<ServerFile[]>([])
  const [activeFile, setActiveFile] = useState<ServerFile | null>(null)
  const [openDoc, setOpenDoc] = useState<ServerFile | null>(null)
  const [loading, setLoading] = useState(false)

  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const filteredProjects = useMemo(() => {
    const q = queryText.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [queryText])

  const availableSides = useMemo<SideId[]>(() => {
    if (!selectedProject) return []
    const cfg = stationsByProjectSides[selectedProject.id] ?? {}
    const sides: SideId[] = []

    if (cfg.front?.length) sides.push('front')
    if (cfg.rear?.length) sides.push('rear')
    if (cfg.common !== false) sides.push('common')

    return sides
  }, [selectedProject])

  const stationsForSelectedSide = useMemo<Station[]>(() => {
    if (!selectedProject || !selectedSide) return []
    const cfg = stationsByProjectSides[selectedProject.id] ?? {}
    if (selectedSide === 'front') return cfg.front ?? []
    if (selectedSide === 'rear') return cfg.rear ?? []
    return []
  }, [selectedProject, selectedSide])

  const commonItemsForProject = useMemo(() => {
    if (!selectedProject) return []
    return commonNodesByProject[selectedProject.id] ?? []
  }, [selectedProject])

  const folderId = useMemo(() => {
    if (!selectedProject || !selectedSide) return null

    const subId = selectedProject.id === '7' ? (selectedSubProject?.id ?? null) : null

    if (selectedSide === 'common') {
      if ((commonNodesByProject[selectedProject.id] ?? []).length > 0) {
        if (!selectedCommonItem) return null
        return buildFolderId(selectedProject.id, subId, 'common', undefined, selectedCommonItem.id)
      }
      return buildFolderId(selectedProject.id, subId, 'common')
    }

    if (!selectedStation) return null
    return buildFolderId(selectedProject.id, subId, selectedSide, selectedStation.id)
  }, [selectedProject, selectedSubProject, selectedSide, selectedStation, selectedCommonItem])

  const loadFiles = async () => {
    if (!selectedProject || !folderId || !selectedDocType) {
      setFiles([])
      setActiveFile(null)
      return
    }

    setLoading(true)
    try {
      const url = `${API_BASE}/files?projectId=${encodeURIComponent(
        selectedProject.id,
      )}&folderId=${encodeURIComponent(folderId)}&docType=${encodeURIComponent(selectedDocType)}`

      const res = await fetch(url)
      const json = await res.json()
      const list: ServerFile[] = Array.isArray(json.files) ? json.files : []
      setFiles(list)

      if (activeFile) {
        const still = list.find((x) => x.storagePath === activeFile.storagePath)
        setActiveFile(still ?? null)
      }

      setAuthError(null)
    } catch (e) {
      console.error(e)
      setFiles([])
      setActiveFile(null)
      setAuthError('Nepodarilo sa načítať súbory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, folderId, selectedDocType])

  const uploadFile = async (file: File) => {
    if (!isAdmin) return
    if (!selectedProject || !folderId || !selectedDocType) {
      setAuthError('Najprv vyber vľavo všetko (až po ODS/TDS).')
      return
    }

    setAuthError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const url = `${API_BASE}/upload?projectId=${encodeURIComponent(
        selectedProject.id,
      )}&folderId=${encodeURIComponent(folderId)}&docType=${encodeURIComponent(selectedDocType)}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: form,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setAuthError((err as { error?: string }).error ?? 'Nahratie zlyhalo.')
        return
      }

      await loadFiles()
    } catch (e) {
      console.error(e)
      setAuthError('Nahratie zlyhalo.')
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (f: ServerFile) => {
    if (!isAdmin) return
    setLoading(true)
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE}/files`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ storagePath: f.storagePath }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setAuthError((err as { error?: string }).error ?? 'Zmazanie zlyhalo.')
        return
      }

      if (activeFile?.storagePath === f.storagePath) setActiveFile(null)
      await loadFiles()
    } catch (e) {
      console.error(e)
      setAuthError('Zmazanie zlyhalo.')
    } finally {
      setLoading(false)
    }
  }

  const resetLower = () => {
    setSelectedSide(null)
    setSelectedStation(null)
    setSelectedCommonItem(null)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectProject = (p: Project) => {
    setExpandedProjectId((prev) => (prev === p.id ? null : p.id))
    setSelectedProject(p)
    setSelectedSubProject(null)
    resetLower()
  }

  const onSelectSubProject = (sp: SubProject) => {
    setSelectedSubProject(sp)
    resetLower()
  }

  const onSelectSide = (side: SideId) => {
    setSelectedSide(side)
    setSelectedStation(null)
    setSelectedCommonItem(null)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectStation = (st: Station) => {
    setSelectedStation(st)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectCommonItem = (item: { id: string; name: string }) => {
    setSelectedCommonItem(item)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectDocType = (dt: DocType) => {
    setSelectedDocType(dt)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const resetAll = () => {
    setExpandedProjectId(null)
    setSelectedProject(null)
    setSelectedSubProject(null)
    resetLower()
    setQueryText('')
    setAuthError(null)
  }

  const printFromModal = () => {
    const iframe = document.getElementById('pdfFrame') as HTMLIFrameElement | null
    iframe?.contentWindow?.focus()
    iframe?.contentWindow?.print()
  }

  const openSelected = () => {
    if (!activeFile) return
    if (isPdfName(activeFile.name)) setOpenDoc(activeFile)
    else openInNewTab(activeFile.url)
  }

  const printSelected = () => {
    if (!activeFile) return
    if (isPdfName(activeFile.name)) {
      setOpenDoc(activeFile)
      setTimeout(() => printFromModal(), 200)
    } else {
      openInNewTab(activeFile.url)
    }
  }

  const canUseOpenPrint = !!activeFile
  const canUpload = isAdmin && !!selectedDocType && !!folderId
  const canDelete = isAdmin && !!activeFile

  const title = useMemo(() => {
    if (!selectedProject) return ''
    const parts: string[] = [selectedProject.name]
    if (selectedProject.id === '7' && selectedSubProject) parts.push(selectedSubProject.name)
    if (selectedSide) parts.push(sideLabel(selectedSide))
    if (selectedSide === 'common' && selectedCommonItem) parts.push(selectedCommonItem.name)
    if (selectedSide && selectedSide !== 'common' && selectedStation) parts.push(selectedStation.name)
    if (selectedDocType) parts.push(selectedDocType)
    return parts.join(' → ')
  }, [selectedProject, selectedSubProject, selectedSide, selectedStation, selectedDocType, selectedCommonItem])

  const doLogout = () => {
    window.location.reload()
  }

  const doLogin = async () => {
    const name = loginName.trim().toLowerCase()
    setLoginError(null)

    if (!name) {
      setLoginError('Zadaj meno.')
      return
    }

    if (name === 'user') {
      setRole('user')
      setIsAdmin(false)
      setAdminKey('')
      setAuthError(null)
      setIsLoggedIn(true)
      return
    }

    if (name === 'admin') {
      if (!loginPass.trim()) {
        setLoginError('Zadaj heslo.')
        return
      }

      setLoginLoading(true)
      try {
        const res = await fetch(`${API_BASE}/check-admin`, {
          method: 'POST',
          headers: { 'x-admin-key': loginPass },
        })

        if (res.status === 200) {
          setRole('admin')
          setIsAdmin(true)
          setAdminKey(loginPass)
          setAuthError(null)
          setIsLoggedIn(true)
          return
        }

        if (res.status === 401) {
          setLoginError('Nesprávne heslo.')
          setIsAdmin(false)
          setAdminKey('')
          return
        }

        setLoginError('Neočakávaná chyba.')
        setIsAdmin(false)
        setAdminKey('')
      } catch (e) {
        console.error(e)
        setLoginError('Chyba spojenia so serverom.')
        setIsAdmin(false)
        setAdminKey('')
      } finally {
        setLoginLoading(false)
      }
      return
    }

    setLoginError("Neznáme meno. Použi 'user' alebo 'admin'.")
  }

  if (!isLoggedIn) {
  return (
    <LoginScreen
      logo={logo}
      loginName={loginName}
      loginPass={loginPass}
      loginError={loginError}
      loginLoading={loginLoading}
      setLoginName={setLoginName}
      setLoginPass={setLoginPass}
      doLogin={() => void doLogin()}
    />
  )
}
  return (
    <div className='app'>
      <aside className='sidebar'>
      <div className='headerCard'>
          <div className='appMark'>
            <img className='appLogoImg' src={logo} alt='Yanfeng' />
            <div className='appNameBlock'>
              <div className='appName'>ODS/TDS</div>
              <div className='appTag'>Document Center</div>
            </div>
          </div>
        </div>

        <div className='loginCard'>
          <div className='loginRow'>
            <div className='loginStatus'>
              <span className='statusDot' />
              <span className='statusText'>{role === 'admin' ? 'Admin' : 'User'}</span>
            </div>
            <button className='btn' onClick={doLogout}>
              Odhlásiť
            </button>
          </div>
          {authError && <div className='inlineError'>{authError}</div>}
        </div>

        <div className='search'>
          <input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder='Hľadať…' />
        </div>

        <div className='projectList'>
          {filteredProjects.map((p) => {
            const expanded = expandedProjectId === p.id
            const active = selectedProject?.id === p.id
            const isEqcProject = p.id === '7'
            const subProjects = getSubProjectsFor(p.id)
            

            return (
              <div key={p.id}>
                <button className={`projectBtn ${active ? 'active' : ''}`} onClick={() => onSelectProject(p)}>
                  <div className='name'>
                    {expanded ? '▾ ' : '▸ '} {p.name}
                  </div>
                </button>

                {expanded && (
                  <div className='folderList'>
                    {isEqcProject ? (
                      subProjects.map((sp) => {
                        const spActive = selectedProject?.id === p.id && selectedSubProject?.id === sp.id

                        return (
                          <div key={sp.id} style={{ display: 'grid', gap: 8 }}>
                            <button className={`projectBtn ${spActive ? 'active' : ''}`} onClick={() => onSelectSubProject(sp)}>
                              <div className='name'>{sp.name}</div>
                            </button>

                            {spActive && (
                              <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                {availableSides.map((side) => {
                                  const sideActive = selectedSide === side

                                  return (
                                    <div key={side} style={{ display: 'grid', gap: 8 }}>
                                      <button
                                        className={`projectBtn ${sideActive ? 'active' : ''}`}
                                        onClick={() => onSelectSide(side)}
                                      >
                                        <div className='name'>{sideLabel(side)}</div>
                                      </button>

                                      {sideActive && side === 'common' && (
                                        <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                          {commonItemsForProject.length > 0 ? (
                                            commonItemsForProject.map((it) => {
                                              const itActive = selectedCommonItem?.id === it.id
                                              return (
                                                <div key={it.id} style={{ display: 'grid', gap: 8 }}>
                                                  <button
                                                    className={`projectBtn ${itActive ? 'active' : ''}`}
                                                    onClick={() => onSelectCommonItem(it)}
                                                  >
                                                    <div className='name'>{it.name}</div>
                                                  </button>

                                                  {itActive && (
                                                    <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                                      <button
                                                        className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                                        onClick={() => onSelectDocType('ODS')}
                                                      >
                                                        <div className='name'>ODS</div>
                                                      </button>
                                                      <button
                                                        className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                                        onClick={() => onSelectDocType('TDS')}
                                                      >
                                                        <div className='name'>TDS</div>
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })
                                          ) : (
                                            <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                              <button
                                                className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                                onClick={() => onSelectDocType('ODS')}
                                              >
                                                <div className='name'>ODS</div>
                                              </button>
                                              <button
                                                className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                                onClick={() => onSelectDocType('TDS')}
                                              >
                                                <div className='name'>TDS</div>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {sideActive && side !== 'common' && (
                                        <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                          {stationsForSelectedSide.map((st) => {
                                            const stActive = selectedStation?.id === st.id

                                            return (
                                              <div key={st.id} style={{ display: 'grid', gap: 8 }}>
                                                <button
                                                  className={`projectBtn ${stActive ? 'active' : ''}`}
                                                  onClick={() => onSelectStation(st)}
                                                >
                                                  <div className='name'>{st.name}</div>
                                                </button>

                                                {stActive && (
                                                  <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                                    <button
                                                      className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                                      onClick={() => onSelectDocType('ODS')}
                                                    >
                                                      <div className='name'>ODS</div>
                                                    </button>
                                                    <button
                                                      className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                                      onClick={() => onSelectDocType('TDS')}
                                                    >
                                                      <div className='name'>TDS</div>
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {availableSides.map((side) => {
                          const sideActive = selectedProject?.id === p.id && selectedSide === side

                          return (
                            <div key={side} style={{ display: 'grid', gap: 8 }}>
                              <button className={`projectBtn ${sideActive ? 'active' : ''}`} onClick={() => onSelectSide(side)}>
                                <div className='name'>{sideLabel(side)}</div>
                              </button>

                              {sideActive && side === 'common' && (
                                <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                  {commonItemsForProject.length > 0 ? (
                                    commonItemsForProject.map((it) => {
                                      const itActive = selectedCommonItem?.id === it.id
                                      return (
                                        <div key={it.id} style={{ display: 'grid', gap: 8 }}>
                                          <button
                                            className={`projectBtn ${itActive ? 'active' : ''}`}
                                            onClick={() => onSelectCommonItem(it)}
                                          >
                                            <div className='name'>{it.name}</div>
                                          </button>

                                          {itActive && (
                                            <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                              <button
                                                className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                                onClick={() => onSelectDocType('ODS')}
                                              >
                                                <div className='name'>ODS</div>
                                              </button>
                                              <button
                                                className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                                onClick={() => onSelectDocType('TDS')}
                                              >
                                                <div className='name'>TDS</div>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })
                                  ) : (
                                    <>
                                      <button
                                        className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                        onClick={() => onSelectDocType('ODS')}
                                      >
                                        <div className='name'>ODS</div>
                                      </button>
                                      <button
                                        className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                        onClick={() => onSelectDocType('TDS')}
                                      >
                                        <div className='name'>TDS</div>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {sideActive && side !== 'common' && (
                                <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                  {(side === 'front'
                                    ? stationsByProjectSides[p.id]?.front
                                    : stationsByProjectSides[p.id]?.rear
                                  )?.map((st) => {
                                    const stActive = selectedStation?.id === st.id

                                    return (
                                      <div key={st.id} style={{ display: 'grid', gap: 8 }}>
                                        <button
                                          className={`projectBtn ${stActive ? 'active' : ''}`}
                                          onClick={() => onSelectStation(st)}
                                        >
                                          <div className='name'>{st.name}</div>
                                        </button>

                                        {stActive && (
                                          <div style={{ marginLeft: 14, display: 'grid', gap: 8 }}>
                                            <button
                                              className={`projectBtn ${selectedDocType === 'ODS' ? 'active' : ''}`}
                                              onClick={() => onSelectDocType('ODS')}
                                            >
                                              <div className='name'>ODS</div>
                                            </button>
                                            <button
                                              className={`projectBtn ${selectedDocType === 'TDS' ? 'active' : ''}`}
                                              onClick={() => onSelectDocType('TDS')}
                                            >
                                              <div className='name'>TDS</div>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className='sidebarFooter'>
          <button className='btn' onClick={resetAll}>
            späť
          </button>
        </div>
      </aside>

<div className="rightPanel">   
  <TopBar
    title={title}
    canUseOpenPrint={canUseOpenPrint}
    canUpload={canUpload}
    canDelete={canDelete}
    isAdmin={isAdmin}
    uploadInputRef={uploadInputRef}
    openSelected={openSelected}
    printSelected={printSelected}
    deleteFile={() => activeFile && deleteFile(activeFile)}
    uploadFile={uploadFile}
    loadFiles={loadFiles}
    selectedDocType={selectedDocType}
    folderId={folderId}
  />

  

<FileList
  files={files}
  activeFile={activeFile}
  loading={loading}
  selectedProject={selectedProject}
  folderId={folderId}
  selectedDocType={selectedDocType}
  isAdmin={isAdmin}
  setActiveFile={setActiveFile}
  isPdfName={isPdfName}
  isExcelName={isExcelName}

  />
  </div>
  
<PdfModal
  openDoc={openDoc}
  isPdfName={isPdfName}
  setOpenDoc={setOpenDoc}
  printFromModal={printFromModal}
/>

       
      </div>
  )
}