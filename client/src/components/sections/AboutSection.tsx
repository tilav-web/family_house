import { useTranslation } from 'react-i18next'
import { useQueries, useQuery } from '@tanstack/react-query'
import { ArrowRight, DoorOpen, Newspaper, Settings } from 'lucide-react'
import { hotelInfoService } from '../../services/hotel-info.service'
import { servicesService } from '../../services/services.service'
import { newsService } from '../../services/news.service'
import heroFallback from '../../assets/hero.png'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { getLocalizedField } from '../../lib/i18n-field'
import { ScrollReveal } from '../shared/ScrollReveal'

export function AboutSection() {
  const { t, i18n } = useTranslation()
  const { data: hotelInfo, isLoading } = useQuery({
    queryKey: ['hotelInfo'],
    queryFn: () => hotelInfoService.getInfo(),
  })
  const [servicesQuery, newsQuery] = useQueries({
    queries: [
      {
        queryKey: ['services'],
        queryFn: () => servicesService.findAll(),
      },
      {
        queryKey: ['news'],
        queryFn: () => newsService.findAll(1, 6),
      },
    ],
  })

  const description = getLocalizedField(hotelInfo?.description, i18n.language)
  const aboutStats = [
    {
      label: t('rooms.title'),
      value: hotelInfo?.roomsCount ?? 0,
      icon: DoorOpen,
    },
    {
      label: t('services.title'),
      value: Array.isArray(servicesQuery.data)
        ? servicesQuery.data.filter((service) => service.isActive).length
        : 0,
      icon: Settings,
    },
    {
      label: t('news.title'),
      value: Array.isArray(newsQuery.data?.items)
        ? newsQuery.data.items.filter((item) => item.isPublished).length
        : 0,
      icon: Newspaper,
    },
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section id="about" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div>
              <Skeleton className="h-10 w-40 mb-6" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <ScrollReveal direction="left" className="order-2 lg:order-1">
            <div className="client-panel rounded-lg p-3">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={hotelInfo?.imageUrl || heroFallback}
                  alt={t('about.title')}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    Family House
                  </p>
                  <p className="mt-1 text-base font-semibold">{t('about.title')}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {aboutStats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-[var(--client-line)] bg-background/80 px-4 py-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-semibold text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15} className="order-1 lg:order-2">
            <span className="client-label">{t('about.label')}</span>
            <h2 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('about.title')}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="client-panel-strong rounded-lg px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  360°
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">{t('rooms.title')}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('rooms.subtitle')}
                </p>
              </div>

              <div className="client-panel-strong rounded-lg px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Insta
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {t('videos.title')}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('videos.subtitle')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 rounded-lg px-6"
                onClick={() => scrollToSection('rooms')}
              >
                {t('nav.rooms')}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-lg border-[var(--client-line)] bg-transparent px-6 hover:bg-primary/10"
                onClick={() => scrollToSection('contact')}
              >
                {t('hero.cta')}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
