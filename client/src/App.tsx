import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import SubprojectGrid from './components/SubprojectGrid'
import LangSelector from './components/LangSelector'
import DocTypeGrid from './components/DocTypeGrid'
import {DocType,Project,ServerFile,SideId,Station,SubProject,} from './lib/utils/types'
import {commonNodesByProject,projects,stationsByProjectSides,stationsBySubProject,} from './lib/utils/configTree'
import {getSubProjectsFor,isPdfName,isExcelName,openInNewTab,sideLabel,} from './lib/utils/helpers'
import TopBar from './components/TopBar'
import FileList from './components/FileList'
import LoginScreen from './components/LoginScreen'
import PdfModal from './components/PdfModal'
import Sidebar from './components/Sidebar'
import Content from './components/Content'
import SideGrid from './components/SideGrid'
import CommonItemsGrid from './components/CommonItemsGrid'

const API_BASE = 'http://localhost:3000/api'

type Role = 'user' | 'admin'
type CommonItem = { id: string; name: string }
type Lang = 'EN' | 'UK' | 'SK'
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

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedSubProject, setSelectedSubProject] = useState<SubProject | null>(null)
  const [selectedSide, setSelectedSide] = useState<SideId | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [selectedLang, setSelectedLang] = useState<Lang | null>(null)
  const [selectedCommonItem, setSelectedCommonItem] = useState<CommonItem | null>(null)
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

  const isSubProjectProject =
    selectedProject?.id === '7' ||
    selectedProject?.id === '10' ||
    selectedProject?.id === '14'

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

  const stationsForSelectedSubProject = useMemo<Station[]>(() => {
    if (!selectedSubProject) return []
    return stationsBySubProject[selectedSubProject.id] ?? []
  }, [selectedSubProject])

  const commonItemsForProject = useMemo<CommonItem[]>(() => {
    if (!selectedProject) return []
    return commonNodesByProject[selectedProject.id] ?? []
  }, [selectedProject])

  const stationsToRender =
    selectedProject?.id === '10' || selectedProject?.id === '14'
      ? stationsForSelectedSubProject
      : stationsForSelectedSide

  const showSubprojects =
    isSubProjectProject && !!selectedProject && !selectedSubProject

  // Slot a IMG nepoužívajú FRONT/REAR
  const showSides =
    selectedProject?.id !== '10' &&
    selectedProject?.id !== '14' &&
    !!selectedProject &&
    (!isSubProjectProject || !!selectedSubProject)

  const showCommonItems =
    selectedSide === 'common' && commonItemsForProject.length > 0

  const showStations =
    ((selectedProject?.id === '10' || selectedProject?.id === '14') && !!selectedSubProject) ||
    (
      selectedProject?.id !== '10' &&
      selectedProject?.id !== '14' &&
      !!selectedSide &&
      selectedSide !== 'common'
    )

  const showLangSelector =
    ((selectedProject?.id === '10' || selectedProject?.id === '14') && !!selectedStation) ||
    (
      selectedProject?.id !== '10' &&
      selectedProject?.id !== '14' &&
      (
        (selectedSide === 'common' &&
          ((commonItemsForProject.length > 0 && !!selectedCommonItem) ||
            commonItemsForProject.length === 0)
        ) ||
        (selectedSide !== null &&
          selectedSide !== 'common' &&
          !!selectedStation)
      )
    )

  const showDocTypes =
    ((selectedProject?.id === '7' ||
      selectedProject?.id === '10' ||
      selectedProject?.id === '14')
      ? !!selectedStation && !!selectedLang
      : (
          (selectedSide === 'common' &&
            ((commonItemsForProject.length > 0 && !!selectedCommonItem) ||
              commonItemsForProject.length === 0)
          ) ||
          (selectedSide !== null &&
            selectedSide !== 'common' &&
            !!selectedStation)
        ) && !!selectedLang
    )

  const folderId = useMemo(() => {
    if (!selectedProject) return null
    if (!selectedLang) return null

    // EQC + IMG + Slot = subproject projekty
    if (
      selectedProject.id === '7' ||
      selectedProject.id === '10' ||
      selectedProject.id === '14'
    ) {
      if (!selectedSubProject || !selectedStation) return null
      return `${selectedProject.id}_${selectedSubProject.id}_${selectedStation.id}_${selectedLang}`
    }

    // normálne projekty
    if (!selectedSide) return null

    if (selectedSide === 'common') {
      if ((commonNodesByProject[selectedProject.id] ?? []).length > 0) {
        if (!selectedCommonItem) return null
        return `common__${selectedCommonItem.id}_${selectedLang}`
      }
      return `common_${selectedLang}`
    }

    if (!selectedStation) return null

    return `${selectedSide}_${selectedStation.id}_${selectedLang}`
  }, [
    selectedProject,
    selectedSubProject,
    selectedSide,
    selectedStation,
    selectedCommonItem,
    selectedLang,
  ])

  const loadFiles = async () => {
    if (!selectedProject || !folderId || !selectedDocType) {
      setFiles([])
      setActiveFile(null)
      return
    }

    setLoading(true)
    try {
      const url =
        `${API_BASE}/files?projectId=${encodeURIComponent(selectedProject.id)}` +
        `&folderId=${encodeURIComponent(folderId)}` +
        `&docType=${encodeURIComponent(selectedDocType)}`

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
      setAuthError('Najprv vyber všetko až po ODS/TDS.')
      return
    }

    setAuthError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const url =
        `${API_BASE}/upload?projectId=${encodeURIComponent(selectedProject.id)}` +
        `&folderId=${encodeURIComponent(folderId)}` +
        `&docType=${encodeURIComponent(selectedDocType)}`

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
    setSelectedLang(null)
    setSelectedCommonItem(null)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectProject = (p: Project) => {
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
    setSelectedLang(null)
    setSelectedCommonItem(null)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectStation = (st: Station) => {
    setSelectedStation(st)
    setSelectedLang(null)
    setSelectedDocType(null)
    setFiles([])
    setActiveFile(null)
    setOpenDoc(null)
  }

  const onSelectCommonItem = (item: CommonItem) => {
    setSelectedCommonItem(item)
    setSelectedLang(null)
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

    if (
      (selectedProject.id === '7' ||
        selectedProject.id === '10' ||
        selectedProject.id === '14') &&
      selectedSubProject
    ) {
      parts.push(selectedSubProject.name)
    }

    if (selectedProject.id !== '10' && selectedProject.id !== '14' && selectedSide) {
      parts.push(sideLabel(selectedSide))
    }

    if (selectedCommonItem) {
      parts.push(selectedCommonItem.name)
    }

    if (selectedStation) {
      parts.push(selectedStation.name)
    }

    if (selectedLang) {
      parts.push(selectedLang)
    }

    if (selectedDocType) {
      parts.push(selectedDocType)
    }

    return parts.join(' → ')
  }, [
    selectedProject,
    selectedSubProject,
    selectedSide,
    selectedStation,
    selectedCommonItem,
    selectedLang,
    selectedDocType,
  ])

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
          headers: { 'x-admin-key': loginPass.trim() },
        })

        if (res.status === 200) {
          setRole('admin')
          setIsAdmin(true)
          setAdminKey(loginPass.trim())
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
      <Sidebar
        logo={logo}
        role={role}
        authError={authError}
        queryText={queryText}
        setQueryText={setQueryText}
        projects={filteredProjects}
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
        resetAll={resetAll}
        doLogout={doLogout}
      />

      <div className='rightPanel'>
        <TopBar
          title={title}
          canUseOpenPrint={canUseOpenPrint}
          canUpload={canUpload}
          canDelete={canDelete}
          isAdmin={isAdmin}
          uploadInputRef={uploadInputRef}
          openSelected={openSelected}
          printSelected={printSelected}
          deleteFile={() => {
            if (!activeFile) return
            const confirmDelete = window.confirm(
              `Naozaj chceš zmazať "${activeFile.name}"?`
            )
            if (confirmDelete) {
              void deleteFile(activeFile)
            }
          }}
          uploadFile={uploadFile}
          loadFiles={loadFiles}
          selectedDocType={selectedDocType}
          folderId={folderId}
        />

<SubprojectGrid
  show={showSubprojects}
  subProjects={getSubProjectsFor(selectedProject?.id || '')}
  selectedSubProject={selectedSubProject}
  onSelect={onSelectSubProject}
/>
<SideGrid
  show={showSides}
  availableSides={availableSides}
  selectedSide={selectedSide}
  onSelect={onSelectSide}
/>

<CommonItemsGrid
  show={showCommonItems}
  items={commonItemsForProject}
  selectedItem={selectedCommonItem}
  onSelect={onSelectCommonItem}
/>
 <Content
  showStations={showStations}
  stations={stationsToRender}
  selectedStation={selectedStation}
  onSelectStation={onSelectStation}
 />

<LangSelector
  show={showLangSelector}
  selectedLang={selectedLang}
  setSelectedLang={setSelectedLang}
/>
<DocTypeGrid
  show={showDocTypes}
  selectedDocType={selectedDocType}
  onSelect={onSelectDocType}
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