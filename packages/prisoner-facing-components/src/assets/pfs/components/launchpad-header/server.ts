export type LanguageOption = { code: string; href: string; label: string }

export type LaunchpadHeaderConfig = {
  url?: string
  user: { name: string }
  translations: {
    enabled: boolean
    currentLanguageCode: string
    options: LanguageOption[]
  }
}

export interface LaunchpadHeaderLocals {
  launchpadHeaderConfig?: LaunchpadHeaderConfig
}
