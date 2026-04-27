import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { testimonialsService } from '../../services/testimonials.service'
import { Skeleton } from '../ui/skeleton'
import { getLocalizedField } from '../../lib/i18n-field'
import { getCountryFlagUrl } from '../../lib/countries'
import { ScrollReveal } from '../shared/ScrollReveal'

const swipeThreshold = 80

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

function TestimonialCard({
  testimonial,
  lang,
}: {
  testimonial: {
    id: string
    authorName: string
    authorPhotoUrl?: string | null
    authorCountry?: string | null
    text: { uz: string; ru: string; en: string }
    rating: number
  }
  lang: string
}) {
  const text = getLocalizedField(testimonial.text, lang)

  return (
    <article className="client-panel-strong flex h-full w-[310px] shrink-0 flex-col rounded-lg p-7 sm:w-[360px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Quote className="h-8 w-8 text-primary/20" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < testimonial.rating
                  ? 'fill-primary text-primary'
                  : 'fill-[var(--client-line)] text-[var(--client-line)]'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="flex-1 text-base leading-7 text-foreground/90">
        &ldquo;{text}&rdquo;
      </p>

      <div className="mt-8 flex items-center gap-4 border-t client-divider pt-5">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
          {testimonial.authorPhotoUrl ? (
            <img
              src={testimonial.authorPhotoUrl}
              alt={testimonial.authorName}
              className="h-full w-full object-cover"
            />
          ) : (
            testimonial.authorName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
            {testimonial.authorCountry && getCountryFlagUrl(testimonial.authorCountry) && (
              <img
                src={getCountryFlagUrl(testimonial.authorCountry)!}
                alt={testimonial.authorCountry.toUpperCase()}
                className="h-4 w-6 shrink-0 rounded-sm object-cover"
              />
            )}
            {testimonial.authorName}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Family House
          </p>
        </div>
      </div>
    </article>
  )
}

export function TestimonialsSection() {
  const { t, i18n } = useTranslation()
  const [isPaused, setIsPaused] = useState(false)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [mobileDirection, setMobileDirection] = useState(0)
  const { data, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => testimonialsService.findAll(),
  })

  const testimonials = Array.isArray(data) ? data : []
  const activeTestimonials = testimonials
    .filter((testimonial) => testimonial.isActive)
    .sort((left, right) => left.order - right.order)
  const averageRating = activeTestimonials.length
    ? (
        activeTestimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0) /
        activeTestimonials.length
      ).toFixed(1)
    : '0.0'
  const duration = Math.max(activeTestimonials.length * 7.5, 24)

  const paginateMobile = (direction: number) => {
    setMobileDirection(direction)
    setMobileIndex((current) => getWrappedIndex(current + direction, activeTestimonials.length))
  }

  useEffect(() => {
    if (!activeTestimonials.length) {
      setMobileIndex(0)
      return
    }

    if (mobileIndex > activeTestimonials.length - 1) {
      setMobileIndex(0)
    }
  }, [activeTestimonials.length, mobileIndex])

  useEffect(() => {
    if (activeTestimonials.length <= 1) return

    const interval = window.setInterval(() => {
      paginateMobile(1)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [activeTestimonials.length])

  if (isLoading) {
    return (
      <section id="testimonials" className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-72 w-[360px] shrink-0 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (activeTestimonials.length === 0) return null

  const activeMobileTestimonial = activeTestimonials[mobileIndex]

  return (
    <section id="testimonials" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('testimonials.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {averageRating} / 5
          </div>
        </ScrollReveal>

        <div className="md:hidden">
          <div className="client-panel rounded-lg p-3">
            <div className="relative overflow-hidden rounded-lg">
              <AnimatePresence initial={false} custom={mobileDirection} mode="wait">
                <motion.div
                  key={activeMobileTestimonial.id}
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
                  className="touch-pan-y"
                  style={{ touchAction: 'pan-y' }}
                >
                  <article className="client-panel-strong flex min-h-[290px] flex-col rounded-lg p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <Quote className="h-7 w-7 text-primary/20" />
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < activeMobileTestimonial.rating
                                ? 'fill-primary text-primary'
                                : 'fill-[var(--client-line)] text-[var(--client-line)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="flex-1 text-sm leading-7 text-foreground/90">
                      &ldquo;{getLocalizedField(activeMobileTestimonial.text, i18n.language)}&rdquo;
                    </p>

                    <div className="mt-6 flex items-center gap-3 border-t client-divider pt-4">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                        {activeMobileTestimonial.authorPhotoUrl ? (
                          <img
                            src={activeMobileTestimonial.authorPhotoUrl}
                            alt={activeMobileTestimonial.authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          activeMobileTestimonial.authorName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                          {activeMobileTestimonial.authorCountry && getCountryFlagUrl(activeMobileTestimonial.authorCountry) && (
                            <img
                              src={getCountryFlagUrl(activeMobileTestimonial.authorCountry)!}
                              alt={activeMobileTestimonial.authorCountry.toUpperCase()}
                              className="h-4 w-6 shrink-0 rounded-sm object-cover"
                            />
                          )}
                          {activeMobileTestimonial.authorName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Family House
                        </p>
                      </div>
                    </div>
                  </article>
                </motion.div>
              </AnimatePresence>
            </div>

            {activeTestimonials.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {activeTestimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
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

        <div
          className="relative hidden md:block"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent" />

          <div className="overflow-hidden py-2">
            <div
              className="flex gap-6 pr-6"
              style={{
                animation: `family-testimonials-marquee ${duration}s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {[...activeTestimonials, ...activeTestimonials].map((testimonial, index) => (
                <TestimonialCard
                  key={`${testimonial.id}-${index}`}
                  testimonial={testimonial}
                  lang={i18n.language}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes family-testimonials-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
