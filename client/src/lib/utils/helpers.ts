import type { SideId, SubProject } from './types'
import { eqcSubProjects, slotSubProjects } from './configTree'

/**
 * Vráti subprojekty (napr. EQC)
 */
export function getSubProjectsFor(projectId: string): SubProject[] {
  if (projectId === '7') return eqcSubProjects
  if (projectId === '14') return slotSubProjects

  return []
 
}

/**
 * Rozpozná PDF súbor podľa názvu
 */
export function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf')
}

/**
 * Rozpozná Excel súbor
 */
export function isExcelName(name: string): boolean {
  const n = name.toLowerCase()
  return n.endsWith('.xls') || n.endsWith('.xlsx')
}

/**
 * Label pre stranu (FRONT / REAR / COMMON)
 */
export function sideLabel(side: SideId): string {
  if (side === 'front') return 'FRONT'
  if (side === 'rear') return 'REAR'
  return 'FRONT/REAR'
}

/**
 * Otvorenie URL v novom tabe
 */
export function openInNewTab(url?: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Vygeneruje folderId podľa výberu v strome
 */
export function buildFolderId(
  projectId: string,
  subId: string | null,
  side: SideId,
  stationId?: string,
  commonItemId?: string,
): string {
  // EQC projekt
  if (projectId === '7') {
    if (side === 'common') {
      if (commonItemId) {
        return `eqc_${subId ?? 'na'}_common__${commonItemId}`
      }
      return `eqc_${subId ?? 'na'}_common`
    }

    return `eqc_${subId ?? 'na'}_${side}_${stationId ?? 'na'}`
  }

  // normálne projekty
  if (side === 'common') {
    if (commonItemId) {
      return `common__${commonItemId}`
    }
    return 'common'
  }

  return `${side}_${stationId ?? 'na'}`
}