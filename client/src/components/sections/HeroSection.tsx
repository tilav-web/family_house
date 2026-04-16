import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { hotelInfoService } from '../../services/hotel-info.service'
import heroDesktopPoster from '../../assets/hero-desktop.jpg'
import heroMobilePoster from '../../assets/hero-mobile.jpg'
import { Button } from '../ui/button'
import { getLocalizedField } from '../../lib/i18n-field'

export function HeroSection() {
  const { t, i18n } = useTranslation()
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { data: hotelInfo, isLoading } = useQuery({
    queryKey: ['hotelInfo'],
    queryFn: () => hotelInfoService.getInfo(),
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches)

    syncViewport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport)
      return () => mediaQuery.removeEventListener('change', syncViewport)
    }

    mediaQuery.addListener(syncViewport)
    return () => mediaQuery.removeListener(syncViewport)
  }, [])

  // Sahifa yuklanib bo'lgandan keyin videoni yuklashni boshlash
  useEffect(() => {
    const start = () => setShouldLoadVideo(true)

    if (document.readyState === 'complete') {
      // Sahifa allaqachon yuklangan — biroz kutib boshlash (asosiy kontent birinchi)
      const timer = setTimeout(start, 300)
      return () => clearTimeout(timer)
    }

    window.addEventListener('load', () => setTimeout(start, 300), { once: true })
  }, [])

  // Video src o'zgarganda (mobile/desktop) reset
  useEffect(() => {
    setVideoReady(false)
  }, [isMobileViewport])

  // Video yuklashni boshlash
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.load()
    }
  }, [shouldLoadVideo, isMobileViewport])

  const onVideoCanPlay = useCallback(() => {
    setVideoReady(true)
    videoRef.current?.play().catch(() => {})
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroTitle =
    getLocalizedField(hotelInfo?.heroText ?? undefined, i18n.language) || t('hero.title')
  const heroSubtitle =
    getLocalizedField(hotelInfo?.heroSubtext ?? undefined, i18n.language) || t('hero.subtitle')
  const heroVideoUrl = isMobileViewport
    ? hotelInfo?.heroVideoMobile || '/mobile.mp4'
    : hotelInfo?.heroVideoDesktop || '/desktop.mp4'
  const posterImage = hotelInfo?.imageUrl || (isMobileViewport ? heroMobilePoster : heroDesktopPoster)

  if (isLoading) {
    return (
      <div
        id="hero"
        className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 flex items-center justify-center"
      >
        <div className="text-white text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-14 bg-white/10 rounded-2xl w-72 mx-auto" />
            <div className="h-6 bg-white/10 rounded-xl w-96 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section id="hero" className="relative z-10 h-screen w-full">
      {/* 1-qadam: Poster rasm — darhol ko'rinadi (44KB) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <img
          src={posterImage}
          alt=""
          className="h-full w-full object-cover"
          style={{
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 1s ease-out',
          }}
        />
      </div>

      {/* 2-qadam: Video — sahifa yuklanib bo'lgandan keyin yuklanadi, fade-in */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <video
          ref={videoRef}
          key={heroVideoUrl}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={onVideoCanPlay}
          className="h-full w-full object-cover"
          style={{
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 1s ease-in',
          }}
        >
          {shouldLoadVideo && <source src={heroVideoUrl} type="video/mp4" />}
        </video>
      </div>

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--client-hero-overlay)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          <span className="inline-block rounded-lg border border-white/20 bg-black/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            Family House
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight max-w-4xl leading-tight"
        >
          {heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
        >
          {heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-11 rounded-lg px-6 text-base shadow-[0_18px_45px_var(--client-shadow)] transition-all hover:bg-primary/90"
            onClick={() => scrollToSection('contact')}
          >
            {t('hero.cta')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 rounded-lg border-white/20 bg-black/10 px-6 text-base text-white backdrop-blur-sm hover:bg-white/10"
            onClick={() => scrollToSection('rooms')}
          >
            {t('rooms.title')}
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => scrollToSection('about')}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">{t('hero.scroll')}</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </section>
  )
}
