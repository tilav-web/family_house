import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { videosService } from '../../services/videos.service'
import { Skeleton } from '../ui/skeleton'
import { ScrollReveal } from '../shared/ScrollReveal'

const swipeThreshold = 80

type VideoCardData = {
  id: string
  instagramUrl?: string | null
  thumbnailUrl?: string | null
  previewVideoUrl?: string | null
  caption?: string | null
}

function getWrappedIndex(nextIndex: number, length: number) {
  if (length === 0) return 0
  return (nextIndex + length) % length
}

const mobileSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 56 : -56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -56 : 56,
    opacity: 0,
  }),
}

function splitIntoColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, index) => {
    columns[index % cols].push(item)
  })
  return columns
}

function VideoCard({
  video,
  previewing,
  onPreviewChange,
  onVideoClick,
}: {
  video: VideoCardData
  previewing: boolean
  onPreviewChange: (open: boolean) => void
  onVideoClick: (video: VideoCardData) => void
}) {
  const caption = video.caption || 'Family House'

  return (
    <button
      type="button"
      onMouseEnter={() => onPreviewChange(true)}
      onMouseLeave={() => onPreviewChange(false)}
      onFocus={() => onPreviewChange(true)}
      onBlur={() => onPreviewChange(false)}
      onClick={() => onVideoClick(video)}
      className="group mb-4 block w-full text-left"
    >
      <div className="client-panel-strong overflow-hidden rounded-lg p-2 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative overflow-hidden rounded-lg bg-slate-950">
          {previewing && video.previewVideoUrl ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={video.thumbnailUrl ?? undefined}
              className="aspect-[9/16] w-full object-cover"
            >
              <source src={video.previewVideoUrl} type="video/mp4" />
            </video>
          ) : video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={caption}
              className="aspect-[9/16] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : video.previewVideoUrl ? (
            <video
              muted
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full object-cover"
            >
              <source src={video.previewVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="flex aspect-[9/16] w-full items-center justify-center text-white/70">
              Family House
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 rounded-lg border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            Video
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-white">
                  {caption}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="h-4 w-4" fill="white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

function MarqueeColumn({
  videos,
  duration,
  direction,
  previewingId,
  onPreviewChange,
  onVideoClick,
}: {
  videos: VideoCardData[]
  duration: number
  direction: 'up' | 'down'
  previewingId: string | null
  onPreviewChange: (id: string | null) => void
  onVideoClick: (video: VideoCardData) => void
}) {
  const animationName = direction === 'up' ? 'family-marquee-up' : 'family-marquee-down'

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-background to-transparent" />

      <div
        className="flex flex-col"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          animationPlayState: previewingId ? 'paused' : 'running',
        }}
      >
        {[...videos, ...videos].map((video, index) => (
          <VideoCard
            key={`${video.id}-${index}`}
            video={video}
            previewing={previewingId === `${video.id}-${index}`}
            onPreviewChange={(open) => onPreviewChange(open ? `${video.id}-${index}` : null)}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>
    </div>
  )
}

export function VideosSection() {
  const { t } = useTranslation()
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [mobileDirection, setMobileDirection] = useState(0)
  const [modalVideo, setModalVideo] = useState<VideoCardData | null>(null)

  const openVideoModal = (video: VideoCardData) => {
    if (video.previewVideoUrl) {
      setModalVideo(video)
      document.body.style.overflow = 'hidden'
    }
  }

  const closeVideoModal = () => {
    setModalVideo(null)
    document.body.style.overflow = ''
  }
  const { data, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosService.findAll(),
  })

  const activeVideos = useMemo(() => {
    const videos = Array.isArray(data) ? data : []

    return videos
      .filter((video) => video?.isActive)
      .sort((left, right) => (left?.order ?? 0) - (right?.order ?? 0))
  }, [data])

  const columnCount = activeVideos.length <= 3 ? Math.max(activeVideos.length, 1) : 4
  const columns = useMemo(
    () => splitIntoColumns(activeVideos, columnCount).filter((column) => column.length > 0),
    [activeVideos, columnCount],
  )

  const paginateMobile = (direction: number) => {
    setMobileDirection(direction)
    setMobileIndex((current) => getWrappedIndex(current + direction, activeVideos.length))
  }

  useEffect(() => {
    if (!activeVideos.length) {
      setMobileIndex(0)
      return
    }

    if (mobileIndex > activeVideos.length - 1) {
      setMobileIndex(0)
    }
  }, [activeVideos.length, mobileIndex])

  useEffect(() => {
    if (activeVideos.length <= 1) return

    const interval = window.setInterval(() => {
      paginateMobile(1)
    }, 4600)

    return () => window.clearInterval(interval)
  }, [activeVideos.length])

  if (isLoading) {
    return (
      <section id="videos" className="py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="mx-auto mb-4 h-10 w-48" />
          </div>
          <div className="grid h-[620px] grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (activeVideos.length === 0) return null

  const baseDuration = Math.max(activeVideos.length * 4.5, 18)
  const activeMobileVideo = activeVideos[mobileIndex]

  return (
    <section id="videos" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('videos.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('videos.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('videos.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {activeVideos.length.toString().padStart(2, '0')} {t('nav.videos')}
          </div>
        </ScrollReveal>

        <div className="md:hidden">
          <div className="client-panel rounded-lg p-3">
            <div className="relative overflow-hidden rounded-lg">
              <AnimatePresence initial={false} custom={mobileDirection} mode="wait">
                <motion.button
                  key={activeMobileVideo.id}
                  type="button"
                  custom={mobileDirection}
                  variants={mobileSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragEnd={(_, info) => {
                    if (info.offset.x <= -swipeThreshold) {
                      paginateMobile(1)
                    }
                    if (info.offset.x >= swipeThreshold) {
                      paginateMobile(-1)
                    }
                  }}
                  onClick={() => openVideoModal(activeMobileVideo)}
                  className="block w-full touch-pan-y text-left"
                  style={{ touchAction: 'pan-y' }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-950">
                    {activeMobileVideo.previewVideoUrl ? (
                      <video
                        key={activeMobileVideo.id}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={activeMobileVideo.thumbnailUrl ?? undefined}
                        className="aspect-[9/14] w-full object-cover"
                      >
                        <source src={activeMobileVideo.previewVideoUrl} type="video/mp4" />
                      </video>
                    ) : activeMobileVideo.thumbnailUrl ? (
                      <img
                        src={activeMobileVideo.thumbnailUrl}
                        alt={activeMobileVideo.caption || t('videos.title')}
                        className="aspect-[9/14] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[9/14] w-full items-center justify-center text-white/70">
                        Family House
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 rounded-lg border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                      Video
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="flex items-end justify-between gap-3">
                        <p className="line-clamp-2 max-w-[80%] text-sm font-semibold text-white">
                          {activeMobileVideo.caption || t('videos.subtitle')}
                        </p>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-sm">
                          <Play className="h-4 w-4" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </AnimatePresence>
            </div>

            {activeVideos.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {activeVideos.map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => {
                      setMobileDirection(index > mobileIndex ? 1 : -1)
                      setMobileIndex(index)
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      index === mobileIndex ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="client-panel hidden rounded-lg p-3 md:block">
          <div className="flex h-[620px] gap-4 md:h-[720px]">
            {columns.map((column, index) => (
              <MarqueeColumn
                key={index}
                videos={column}
                direction={index % 2 === 0 ? 'up' : 'down'}
                duration={baseDuration + index * 2.8}
                previewingId={previewingId}
                onPreviewChange={setPreviewingId}
                onVideoClick={openVideoModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
            onClick={closeVideoModal}
          >
            <button
              type="button"
              onClick={closeVideoModal}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/12 bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/18"
            >
              <X className="h-6 w-6" />
            </button>

            <div
              className="relative w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={modalVideo.previewVideoUrl!}
                autoPlay
                controls
                playsInline
                className="w-full rounded-lg"
              />
              {modalVideo.caption && (
                <p className="mt-3 text-center text-sm text-white/80">
                  {modalVideo.caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes family-marquee-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        @keyframes family-marquee-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
