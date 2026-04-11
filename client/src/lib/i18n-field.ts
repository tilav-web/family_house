import type { I18nField } from '../types'

export function getLanguageKey(language: string): keyof I18nField {
  if (language.startsWith('ru')) return 'ru'
  if (language.startsWith('en')) return 'en'
  return 'uz'
}

export function getLocalizedField(field: I18nField | null | undefined, language: string): string {
  if (!field) return ''

  const languageKey = getLanguageKey(language)
  return field[languageKey] || field.uz || field.ru || field.en || ''
}
