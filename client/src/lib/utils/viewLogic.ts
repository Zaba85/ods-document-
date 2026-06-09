import { Project, SubProject, SideId, Station } from './types'
export function computeViewState({
    selectedProject,
    selectedSubProject,
    selectedSide,
    selectedStation,
    commonItemsForProject,
    selectedCommonItem,
  }: {
    selectedProject: Project | null
    selectedSubProject: SubProject | null
    selectedSide: SideId | null
    selectedStation: Station | null
    commonItemsForProject: { id: string; name: string }[]
    selectedCommonItem: { id: string; name: string } | null
  }) {
    const isSubProjectProject =
      selectedProject?.id === '7' || selectedProject?.id === '14'
  
    const showSubprojects =
      isSubProjectProject && !!selectedProject && !selectedSubProject
  
    const showSides =
      selectedProject?.id !== '14' &&
      !!selectedProject &&
      ((!isSubProjectProject) || !!selectedSubProject)
  
    const showCommonItems =
      selectedSide === 'common' && commonItemsForProject.length > 0
  
    const showStations =
      (selectedProject?.id === '14' && !!selectedSubProject) ||
      (selectedProject?.id !== '14' && !!selectedSide && selectedSide !== 'common')
  
    const showDocTypes =
      (selectedProject?.id === '14'
        ? !!selectedStation
        : (
            selectedSide === 'common' &&
            ((commonItemsForProject.length > 0 && !!selectedCommonItem) ||
              commonItemsForProject.length === 0)
          ) ||
          (selectedSide !== null &&
            selectedSide !== 'common' &&
            !!selectedStation)
      )
  
    return {
      showSubprojects,
      showSides,
      showCommonItems,
      showStations,
      showDocTypes,
    }
  }
  