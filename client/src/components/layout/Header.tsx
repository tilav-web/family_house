import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { Logo } from './Logo'
import { hotelInfoService } from '../../services/hotel-info.service'
import { PaletteToggle, type ClientThemeMode } from '../shared/PaletteToggle'

const navLinks = [
  { href: '#about', key: 'nav.about' },
  { href: '#services', key: 'nav.services' },
  { href: '#rooms', key: 'nav.rooms' },
  { href: '#news', key: 'nav.news' },
  { href: '#contact', key: 'nav.contact' },
  { href: '#location', key: 'nav.location' },
]

interface HeaderProps {
  palette?: ClientThemeMode
  onTogglePalette?: () => void
}

export function Header({ palette, onTogglePalette }: HeaderProps = {}) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'
  const [scrolled, setScrolled] = useState(!isHomePage)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: hotelInfo } = useQuery({
    queryKey: ['hotelInfo'],
    queryFn: () => hotelInfoService.getInfo(),
  })
  const phoneNumber = hotelInfo?.phoneNumber || t('contact.phoneNumber')

  useEffect(() => {
    if (!isHomePage) return
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHomePage])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Sahifa o'zgarganda — detail sahifalarda doim scrolled, home da scroll holatiga moslashadi
  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true)
    } else {
      setScrolled(window.scrollY > 50)
    }
  }, [isHomePage])

  const scrollTo = (href: string) => {
    setMobileOpen(false)

    if (isHomePage) {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + href)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          !isHomePage
            ? 'border-b client-divider bg-background shadow-[0_18px_42px_var(--client-shadow)]'
            : scrolled
              ? 'border-b client-divider bg-background/80 shadow-[0_18px_42px_var(--client-shadow)] backdrop-blur-xl'
              : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); isHomePage ? scrollTo('#hero') : navigate('/') }}
              className="flex items-center gap-2 group"
            >
              <Logo white={!scrolled} />
              <span className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? 'text-foreground' : 'text-white'
              }`}>
                Family House
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                  className={`group relative px-4 py-2 text-sm font-medium transition-colors ${
                    scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t(link.key)}
                  <span
                    className={`pointer-events-none absolute bottom-1 left-4 right-4 h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                      scrolled ? 'bg-primary' : 'bg-white'
                    }`}
                  />
                </a>
              ))}
            </nav>

            {/* Phone + Language + Mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Phone call button */}
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                aria-label={phoneNumber}
                className={`group hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${
                  scrolled
                    ? 'border-[var(--client-line)] bg-background/80 text-foreground hover:border-primary hover:text-primary'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                } backdrop-blur-md`}
              >
                <Phone className="h-4 w-4 transition-transform group-hover:animate-phone-ring" />
                <span className="text-xs font-semibold tracking-wide">{phoneNumber}</span>
              </a>

              {/* Theme toggle (Sun/Moon) */}
              {palette && onTogglePalette && (
                <PaletteToggle
                  palette={palette}
                  onToggle={onTogglePalette}
                  white={!scrolled}
                />
              )}

              {/* Language switcher */}
              <div className={`hidden sm:flex items-center rounded-lg border p-0.5 ${
                scrolled
                  ? 'border-[var(--client-line)] bg-background/80 backdrop-blur-md'
                  : 'border-white/20 bg-white/10 backdrop-blur-md'
              }`}>
                {['uz', 'ru', 'en'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${
                      i18n.language === lang
                        ? 'bg-primary text-white shadow-sm'
                        : scrolled
                          ? 'text-muted-foreground hover:text-foreground'
                          : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrolled
                    ? 'text-foreground hover:bg-primary/10'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-80 border-l border-[var(--client-line)] bg-[var(--client-panel-strong)] shadow-[0_24px_64px_var(--client-shadow)] md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-primary/10"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 flex-1">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                      className="px-4 py-3 rounded-lg text-lg font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {t(link.key)}
                    </motion.a>
                  ))}
                </nav>

                {/* Mobile language switcher */}
                <div className="flex items-center gap-2 rounded-lg border border-[var(--client-line)] bg-background/80 p-1">
                  {['uz', 'ru', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => i18n.changeLanguage(lang)}
                      className={`flex-1 rounded-md py-2 text-sm font-semibold uppercase tracking-wide transition-all ${
                        i18n.language === lang
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
