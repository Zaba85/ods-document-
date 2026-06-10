import type { SideId, SubProject } from './types'
import {
  eqcSubProjects,
  imgCoveringSubProjects,
  slotSubProjects,
} from './configTree'

export function getSubProjectsFor(projectId: string): SubProject[] {
  if (projectId === '7') return eqcSubProjects
  if (projectId === '10') return imgCoveringSubProjects
  if (projectId === '14') return slotSubProjects
  return []
}

export function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf')
}

export function isExcelName(name: string): boolean {
  const n = name.toLowerCase()
  return n.endsWith('.xls') || n.endsWith('.xlsx')
}

export function sideLabel(side: SideId): string {
  if (side === 'front') return 'FRONT'
  if (side === 'rear') return 'REAR'
  return 'FRONT/REAR'
}

export function openInNewTab(url?: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function buildFolderId(
projectId: string, subId: string | null, selectedSide: string, id: string, side: SideId, stationId?: string, commonItemId?: string,
): string {
  // EQC
  if (projectId === '7') {
    if (side === 'common') {
      if (commonItemId) {
        return `eqc_${subId ?? 'na'}_common__${commonItemId}`
      }
      return `eqc_${subId ?? 'na'}_common`
    }

    return `eqc_${subId ?? 'na'}_${side}_${stationId ?? 'na'}`
  }

  // IMG Covering + Slot Coater => subproject + station (bez side logiky)
  if (projectId === '10' || projectId === '14') {
    return `${projectId}_${subId ?? 'na'}_${stationId ?? 'na'}`
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