import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'

const navLinks = [
  { href: '#about', key: 'nav.about' },
  { href: '#services', key: 'nav.services' },
  { href: '#rooms', key: 'nav.rooms' },
  { href: '#news', key: 'nav.news' },
  { href: '#contact', key: 'nav.contact' },
]

export function Header() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b client-divider bg-background/80 shadow-[0_18px_42px_var(--client-shadow)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); scrollTo('#hero') }}
              className="flex items-center gap-2 group"
            >
              <Logo />
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary ${
                    scrolled ? 'text-foreground' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t(link.key)}
                </a>
              ))}
            </nav>

            {/* Language + Mobile toggle */}
            <div className="flex items-center gap-2">
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
