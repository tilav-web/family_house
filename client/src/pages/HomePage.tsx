import { useEffect, useState } from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Toaster } from '../components/ui/toaster'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { RoomsSection } from '@/components/sections/RoomsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { VideosSection } from '@/components/sections/VideosSection'
import { ContactSection } from '@/components/sections/ContactSection'
import {
  PaletteToggle,
  type ClientThemeMode,
} from '@/components/shared/PaletteToggle'

const CLIENT_THEME_STORAGE_KEY = 'family-house-client-theme'

function getInitialTheme(): ClientThemeMode {
  if (typeof window === 'undefined') {
    return 'gold'
  }

  const storedTheme = window.localStorage.getItem(CLIENT_THEME_STORAGE_KEY)
  return storedTheme === 'midnight' ? 'midnight' : 'gold'
}

export default function HomePage() {
  const [palette, setPalette] = useState<ClientThemeMode>(getInitialTheme)

  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.pointerEvents = ''
    document.documentElement.style.overflow = ''
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CLIENT_THEME_STORAGE_KEY, palette)
  }, [palette])

  return (
    <div data-client-theme={palette} className="client-shell relative">
      <Header />
      <PaletteToggle
        palette={palette}
        onToggle={() => setPalette((current) => (current === 'gold' ? 'midnight' : 'gold'))}
      />
      <HeroSection />
      <main className="relative z-20 bg-background">
        <AboutSection />
        <ServicesSection />
        <RoomsSection />
        <NewsSection />
        <TestimonialsSection />
        <VideosSection />
        <ContactSection />
        <Footer />
      </main>
      <Toaster />
    </div>
  )
}
