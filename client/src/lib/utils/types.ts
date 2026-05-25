export type DocType = 'ODS' | 'TDS'
export type Project = { id: string; name: string }
export type Station = { id: string; name: string }

export type SideId = 'front' | 'rear' | 'common'

export type SubProject = { id: string; name: string; allowedDocTypes: DocType[] }

export type ServerFile = { name: string; url: string; storagePath: string }
