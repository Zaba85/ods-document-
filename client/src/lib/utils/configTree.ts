import { Project, Station, SubProject } from './types'

export const projects: Project[] = [
  { id: '1', name: 'BMW G26' },
  { id: '2', name: 'BMW G2X' },
  { id: '3', name: 'Foaming' },
  { id: '4', name: 'W206' },
  { id: '5', name: 'W297' },
  { id: '6', name: 'W295' },
  { id: '7', name: 'EQC' },
  { id: '8', name: 'W214' },
  { id: '9', name: 'W520' },
  { id: '10', name: 'IMG Covering' },
  { id: '11', name: 'Opel Predprocess' },
  { id: '12', name: 'Opel Assembly' },
  { id: '13', name: 'X540' },
  { id: '14', name: 'Slot Coater' },
]

export const eqcSubProjects: SubProject[] = [
  { id: '206', name: '206', allowedDocTypes: ['ODS', 'TDS'] },
  { id: '297', name: '297', allowedDocTypes: ['ODS', 'TDS'] },
  { id: '295', name: '295', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'X540', name: 'X540', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'X520', name: 'X520', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'W214', name: 'W214', allowedDocTypes: ['ODS', 'TDS'] },
]

export const slotSubProjects: SubProject[] = [
  { id: 'slot-206', name: '206', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'slot-214', name: '214', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'slot-297', name: '297', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'slot-520', name: '520', allowedDocTypes: ['ODS', 'TDS'] },
]

export const imgCoveringSubProjects: SubProject[] = [
  { id: 'img-297', name: '297', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'img-206', name: '206', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'img-214', name: '214', allowedDocTypes: ['ODS', 'TDS'] },
  { id: 'img-520', name: '520', allowedDocTypes: ['ODS', 'TDS'] },
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

  '11': {
    common: true,
    front: [
      { id: 'lamination-armrest-fr', name: 'Lamination Armrest FR' },
      { id: 'gluing-armrest', name: 'Gluing Armrest FR/RR' },
      { id: 'gluing-insert', name: 'Gluing Insert FR/RR' },
      { id: 'weight-control', name: 'Weight Control FR/RR' },
      { id: 'lamination-insert-fr', name: 'Lamination Insert FR' },
      { id: 'lamination-podlozka', name: 'Lamination lepenie podložky FR/RR' },
      { id: 'beltline-esl', name: 'Beltline-ESL' },
      { id: 'gluing-beltline', name: 'Gluing Beltline' },
    ],
    rear: [
      { id: 'lamination-armrest-rr', name: 'Lamination Armrest RR' },
      { id: 'lamination-insert-rr', name: 'Lamination Insert RR' },
    ],
  },

  '12': {
    common: true,
    front: [
      { id: 'st1', name: 'ST1' },
      { id: 'st2', name: 'ST2' },
      { id: 'st4', name: 'ST4' },
      { id: 'final-check', name: 'Final Check' },
      { id: 'gp12', name: 'GP12' },
    ],
    rear: [],
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

export const stationsBySubProject: Record<string, Station[]> = {
  'slot-206': [
    { id: '206-main-carrier', name: 'Main carrier glue application' },
    { id: '206-mappocet', name: 'Mappocet glue application' },
    { id: '206-beltline-glue', name: '206 Beltline glue application' },
    { id: '206-beltline-weight', name: '206 beltline meranie hmotnosti' },
  ],
  'slot-214': [
    { id: '214-main-carrier', name: '214 Main carrier glue application' },
    { id: '214-main-weight', name: '214 Main carrier meranie hmotnosti' },
  ],
  'slot-297': [],
  'slot-520': [],

  'img-297': [
    { id: 'vacuum-lamination-mc', name: 'Vacuum lamination MC' },
    { id: 'final-control-mc', name: 'Final Control MC' },
    { id: 'laser-mp', name: 'Laser MP' },
    { id: 'vacuum-lamination-mp', name: 'Vacuum Lamination MP' },
    { id: 'final-control-mp', name: 'Final Control MP' },
    { id: 'laser-pitching', name: 'Laser Pitching' },
    { id: 'final-punching-fr-mc', name: 'Final Punching FR MC' },
    { id: 'final-punching-rr-mc', name: 'Final Punching RR MC' },
  ],
  'img-206': [
    { id: 'vacuum-lamination-bl', name: 'Vacuum Lamination BL' },
    { id: 'final-control-bl', name: 'Final Control BL' },
    { id: 'laser-pitching-bl', name: 'Laser Pitching BL' },
  ],
  'img-214': [
    { id: 'vacuum-lamination-mc', name: 'Vacuum Lamination MC' },
    { id: 'final-control-mc', name: 'Final Control MC' },
    { id: 'punching-mc-fr-rr', name: 'Punching MC FR/RR' },
  ],
  'img-520': [
    { id: 'vacuum-lamination-mp', name: 'Vacuum Lamination MP' },
    { id: 'final-control-mp', name: 'Final Control MP' },
  ],
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
