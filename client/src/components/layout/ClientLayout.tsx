import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from './Header'
import { Footer } from './Footer'
import { Toaster } from '../ui/toaster'
import { ScrollToTop } from '../ScrollToTop'
import type { ClientThemeMode } from '../shared/PaletteToggle'

const CLIENT_THEME_STORAGE_KEY = 'family-house-client-theme'

function getInitialTheme(): ClientThemeMode {
  if (typeof window === 'undefined') {
    return 'gold'
  }

  const storedTheme = window.localStorage.getItem(CLIENT_THEME_STORAGE_KEY)
  return storedTheme === 'midnight' ? 'midnight' : 'gold'
}

export default function ClientLayout() {
  const { i18n } = useTranslation()
  const [palette, setPalette] = useState<ClientThemeMode>(getInitialTheme)

  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.pointerEvents = ''
    document.documentElement.style.overflow = ''
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CLIENT_THEME_STORAGE_KEY, palette)
  }, [palette])

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <div data-client-theme={palette} className="client-shell relative">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Asosiy kontentga o'tish
      </a>
      <Header
        palette={palette}
        onTogglePalette={() => setPalette((current) => (current === 'gold' ? 'midnight' : 'gold'))}
      />
      <Outlet />
      <Toaster />
    </div>
  )
}
