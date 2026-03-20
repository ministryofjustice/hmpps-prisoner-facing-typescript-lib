export type LanguageOption = { code: string; href: string; label: string; isCurrent: boolean }

export type LaunchpadHeaderParameters = {
  user: { name: string },
  languageOptions: LanguageOption[]
}
