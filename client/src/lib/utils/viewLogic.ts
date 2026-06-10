import { Project, SideId, Station, SubProject } from './types'

type CommonItem = {
  id: string
  name: string
}

type Input = {
  selectedProject: Project | null
  selectedSubProject: SubProject | null
  selectedSide: SideId | null
  selectedStation: Station | null
  commonItemsForProject: CommonItem[]
  selectedCommonItem: CommonItem | null
  selectedLang?: 'EN' | 'UK' | null
}

export function computeViewState({
  selectedProject,
  selectedSubProject,
  selectedSide,
  selectedStation,
  commonItemsForProject,
  selectedCommonItem,
  selectedLang,
}: Input) {
  const isSubProjectProject =
    selectedProject?.id === '7' ||
    selectedProject?.id === '10' ||
    selectedProject?.id === '14'

  const showSubprojects =
    isSubProjectProject && !!selectedProject && !selectedSubProject

  const showSides =
    selectedProject?.id !== '10' &&
    selectedProject?.id !== '14' &&
    !!selectedProject &&
    ((!isSubProjectProject) || !!selectedSubProject)

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

  return {
    showSubprojects,
    showSides,
    showCommonItems,
    showStations,
    showDocTypes,
  }
}