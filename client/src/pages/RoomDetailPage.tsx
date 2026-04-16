import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize2,
  Phone,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { roomsService } from '../services/rooms.service'
import { getLocalizedField } from '../lib/i18n-field'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Tour360Viewer } from '../components/Tour360Viewer'
import { Footer } from '../components/layout/Footer'

function splitAmenities(text: string): string[] {
  return text
    .split(/\n|,|•/)
    .map((value) => value.trim())
    .filter(Boolean)
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [selectedImg, setSelectedImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsService.findOne(id!),
    enabled: !!id,
  })

  const images = useMemo(
    () => [...(room?.images ?? [])].sort((left, right) => left.order - right.order),
    [room?.images],
  )
  const scenes = useMemo(
    () =>
      [...(room?.scenes ?? [])]
        .filter((scene) => scene.isActive && scene.panoramaUrl)
        .sort((left, right) => left.order - right.order),
    [room?.scenes],
  )

  useEffect(() => {
    const lockScroll = tourOpen || lightboxOpen
    document.body.style.overflow = lockScroll ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [tourOpen, lightboxOpen])

  useEffect(() => {
    if (selectedImg > Math.max(images.length - 1, 0)) {
      setSelectedImg(0)
    }
  }, [images.length, selectedImg])

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <div className="client-section flex min-h-[80vh] items-center justify-center px-4">
          <div className="client-grid" />
          <div className="client-panel rounded-lg px-8 py-10 text-center">
            <h1 className="text-4xl font-bold text-foreground">{t('rooms.notFound')}</h1>
            <Button className="mt-6 h-11 rounded-lg px-6" onClick={() => navigate('/')}>
              {t('news.backHome')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <div className="container mx-auto px-4 pt-8 lg:px-8">
          <Skeleton className="mb-8 h-[62vh] w-full rounded-lg" />
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <Skeleton className="h-[520px] rounded-lg" />
            <Skeleton className="h-[420px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!room) return null

  const name = getLocalizedField(room.name, i18n.language)
  const description = getLocalizedField(room.description, i18n.language)
  const amenities = splitAmenities(getLocalizedField(room.amenities, i18n.language))
  const selectedImage = images[selectedImg]

  const prevImg = () => {
    setSelectedImg((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  const nextImg = () => {
    setSelectedImg((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  const formattedPrice = room.pricePerNight?.toLocaleString(
    i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US',
  )

  return (
    <>
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <section className="client-section overflow-hidden pb-24">
          <div className="client-grid" />

          <div className="relative h-[68vh] min-h-[540px] w-full overflow-hidden bg-slate-950">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage.url}
                  alt={name}
                  className="h-full w-full cursor-zoom-in object-cover"
                  onClick={() => setLightboxOpen(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImg}
                      className="absolute left-5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImg}
                      className="absolute right-5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white/60">
                <Eye className="h-16 w-16" />
              </div>
            )}

            <div className="absolute left-0 right-0 top-6 z-20">
              <div className="container mx-auto px-4 lg:px-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="h-10 rounded-lg border-white/15 bg-black/25 px-4 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {t('news.back')}
                </Button>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20">
              <div className="container mx-auto px-4 pb-12 lg:px-8">
                <div className="max-w-4xl">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                    {t('rooms.featuredStay')}
                  </span>
                  <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {name}
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
                    {description}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <div className="rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        {t('rooms.price')}
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {formattedPrice} {room.currency}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white/90 backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        {t('rooms.gallery')}
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {images.length} {t('rooms.imagesCount')}
                      </p>
                    </div>
                    {scenes.length > 0 && (
                      <div className="rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white/90 backdrop-blur-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                          360°
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {scenes.length} {t('rooms.sceneCount')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container relative mx-auto -mt-14 px-4 lg:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <div className="client-panel rounded-lg p-8">
                  <span className="client-label">{t('about.title')}</span>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="client-panel-strong rounded-lg px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {t('rooms.price')}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-foreground">
                        {formattedPrice}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {room.currency} / {t('rooms.perNight')}
                      </p>
                    </div>
                    <div className="client-panel-strong rounded-lg px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {t('rooms.gallery')}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-foreground">{images.length}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('rooms.imagesCount')}</p>
                    </div>
                    <div className="client-panel-strong rounded-lg px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        360°
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-foreground">{scenes.length}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('rooms.sceneCount')}</p>
                    </div>
                  </div>
                </div>

                {amenities.length > 0 && (
                  <div className="client-panel-strong rounded-lg p-8">
                    <span className="client-label">{t('rooms.amenities')}</span>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {amenities.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-lg border border-[var(--client-line)] bg-background/80 px-4 py-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <div className="client-panel rounded-lg p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="client-label">{t('rooms.gallery')}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-lg border-[var(--client-line)] bg-transparent px-4"
                        onClick={() => setLightboxOpen(true)}
                      >
                        {t('rooms.exploreRoom')}
                      </Button>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => {
                            setSelectedImg(index)
                            setLightboxOpen(true)
                          }}
                          className={`overflow-hidden rounded-lg border transition-transform hover:-translate-y-0.5 ${
                            index === selectedImg
                              ? 'border-primary shadow-[0_18px_42px_var(--client-shadow)]'
                              : 'border-[var(--client-line)]'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${name} ${index + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {scenes.length > 0 && (
                  <div className="client-panel rounded-lg p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <span className="client-label">{t('rooms.virtualTour')}</span>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                          {t('rooms.virtualTourSubtitle')}
                        </p>
                      </div>
                      <Button className="h-11 rounded-lg px-6" onClick={() => setTourOpen(true)}>
                        <Maximize2 className="h-4 w-4" />
                        {t('rooms.virtualTour')}
                      </Button>
                    </div>

                    <div className="mt-6">
                      <Tour360Viewer
                        scenes={scenes}
                        initialSceneId={scenes.find((scene) => scene.isDefault)?.id}
                        heightClassName="h-[400px] md:h-[500px]"
                        showThumbnails={false}
                      />
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-6">
                <div className="client-panel sticky top-24 rounded-lg p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {t('rooms.featuredStay')}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">
                    {formattedPrice}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {room.currency} / {t('rooms.perNight')}
                  </p>

                  <div className="mt-6 space-y-3">
                    <Button
                      size="lg"
                      className="h-11 w-full rounded-lg"
                      onClick={() => window.location.assign('/#contact')}
                    >
                      <Phone className="h-4 w-4" />
                      {t('rooms.bookNow')}
                    </Button>

                    {scenes.length > 0 && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full rounded-lg border-[var(--client-line)] bg-transparent"
                        onClick={() => setTourOpen(true)}
                      >
                        <Eye className="h-4 w-4" />
                        {t('rooms.virtualTour')}
                      </Button>
                    )}
                  </div>

                  {amenities.length > 0 && (
                    <div className="mt-6 border-t client-divider pt-6">
                      <p className="text-sm font-semibold text-foreground">{t('rooms.amenities')}</p>
                      <div className="mt-4 space-y-3">
                        {amenities.slice(0, 6).map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-primary" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
        <Footer />
      </div>

      <AnimatePresence>
        {tourOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/75" />

            <div className="relative flex h-[100dvh] flex-col px-4 pb-4 pt-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {t('rooms.virtualTour')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTourOpen(false)}
                  className="rounded-full border border-white/15 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex-1">
                <Tour360Viewer
                  scenes={scenes}
                  initialSceneId={scenes.find((scene) => scene.isDefault)?.id}
                  heightClassName="h-[calc(100dvh-6.5rem)]"
                  showThumbnails={false}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/12 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/18"
            >
              <X className="h-6 w-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-4 rounded-full border border-white/12 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/18"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-4 rounded-full border border-white/12 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/18"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <img
              src={selectedImage.url}
              alt={name}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
