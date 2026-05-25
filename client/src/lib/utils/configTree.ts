import { Project, Station, SubProject } from './types'

export const projects: Project[] = [
  { id: '1', name: 'BMW G26' },
  { id: '2', name: 'BMW G2X' },
  { id: '3', name: 'Foaming' },
  { id: '4', name: 'W206' },
  { id: '5', name: 'W297'},
  { id: '6', name: 'W295'},
  { id: '7', name: 'EQC' },
  { id: '8', name: 'W214' },
  { id: '9', name: 'W520' },
  { id: '10', name: 'IMG Covering' },
  { id: '11', name: 'Opel Predprocess' },
  { id: '12', name: 'Opel Assembly' },
  { id: '13', name: 'X540' },
]

export const eqcSubProjects: SubProject[] = [
  { id: '206', name: '206', allowedDocTypes: ['ODS', 'TDS'] },
  { id: '297', name: '297', allowedDocTypes: ['ODS', 'TDS'] },
  { id: '295', name: '295', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'X540', name: 'X540', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'X520', name: 'X520', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'W214', name: 'W214', allowedDocTypes: ['ODS', 'TDS'] },
]

export const stationsByProjectSides: Record<
  string,
  {
    front?: Station[]
    rear?: Station[]
    common?: boolean
  }
> = {
  '1': {
    common: true,
    front: [
      { id: 'st1', name: 'Stanica 1' },
      { id: 'st2', name: 'Stanica 2' },
      { id: 'rework', name: 'Rework' },
    ],
    rear: [
      { id: 'st1', name: 'Stanica 1' },
      { id: 'st2', name: 'Stanica 2' },
      { id: 'rework', name: 'Rework' },
    ],
  },

  '2': {
    common: true,
    front: [
      { id: 'st1', name: 'Stanica 1' },
      { id: 'qa', name: 'Quality' },
      { id: 'pack', name: 'Packing' },
    ],
    rear: [{ id: 'rework', name: 'Rework' }],
  },

  '5': {
    common: true,
    front: [
      { id: 'st1', name: 'Stanica 1' },
      { id: 'st2', name: 'Stanica 2' },
    ],
    rear: [
      { id: 'st3', name: 'Stanica 3' },
      { id: 'rework', name: 'Rework' },
    ],
  },

  '13': {
    common: true,
    front: [
      { id: 'st_tf_assy', name: 'ST T/F Assy' },
      { id: 'st0', name: 'ST0' },
      { id: 'st1', name: 'ST1' },
      { id: 'st2', name: 'ST2' },
      { id: 'st3', name: 'ST3' },
      { id: 'st4', name: 'ST4' },
      { id: 'st5', name: 'ST5' },
      { id: 'st6', name: 'ST6' },
    ],
    rear: [
      { id: 'st0', name: 'ST0' },
      { id: 'st1', name: 'ST1' },
      { id: 'st2', name: 'ST2' },
      { id: 'st3', name: 'ST3' },
      { id: 'st4', name: 'ST4' },
      { id: 'st5', name: 'ST5' },
      { id: 'st6', name: 'ST6' },
    ],
  },
}

export const commonNodesByProject: Record<string, { id: string; name: string }[]> = {
  '13': [
    { id: 'rework', name: 'Rework' },
    { id: 'simple_rework', name: 'Simple rework' },
    { id: 'fc0', name: 'FC0' },
    { id: 'fc', name: 'FC' },
    { id: 'gp12', name: 'GP12' },
    { id: 'mala_sekvencia', name: 'Malá sekvecia' },
    { id: 'vymena_nestov', name: 'Výmena nestov' },
  ],
}
