export type Item = { href: string; label: string; attributes?: { [key: string]: string } }

export type Meta = {
  hiddenDescription: string
  items: Item[]
}

export type Navigation = {
  width?: 'one-third' | 'two-thirds' | 'one-half' | 'full'
  header?: string
  columns?: number
  items: Item[]
}

export interface LaunchpadFooterLocals {
  launchpadFooterConfig?: {
    meta?: Meta
    navigation?: Navigation[]
  }
}
