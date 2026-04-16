import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, Car } from 'lucide-react'
import { hotelInfoService } from '../../services/hotel-info.service'
import { ScrollReveal } from '../shared/ScrollReveal'
import { Skeleton } from '../ui/skeleton'

// Standart koordinatalar (Qarshi) — API dan kelmaguncha ishlatiladi
const DEFAULT_LAT = 38.8606
const DEFAULT_LNG = 65.8008

function buildGoogleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3100!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1suz!2suz!4v1700000000000`
}

export function LocationSection() {
  const { t } = useTranslation()

  const { data: hotelInfo, isLoading } = useQuery({
    queryKey: ['hotelInfo'],
    queryFn: () => hotelInfoService.getInfo(),
  })

  const lat = hotelInfo?.latitude ?? DEFAULT_LAT
  const lng = hotelInfo?.longitude ?? DEFAULT_LNG
  const hasCoords = lat !== 0 && lng !== 0

  return (
    <section id="location" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('location.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('location.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('location.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            <MapPin className="mr-1.5 inline-block h-4 w-4" />
            {t('location.badge')}
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <ScrollReveal direction="left" className="lg:col-span-2">
            <div className="client-panel-strong overflow-hidden rounded-lg p-2">
              {isLoading ? (
                <Skeleton className="h-[450px] w-full rounded-lg" />
              ) : hasCoords ? (
                <iframe
                  src={buildGoogleMapsEmbedUrl(lat, lng)}
                  title={t('location.title')}
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: '0.5rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-[450px] items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">{t('contact.address')}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2} className="space-y-4">
            <div className="client-panel-strong rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('location.addressTitle')}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t('contact.address')}
                  </p>
                </div>
              </div>
            </div>

            <div className="client-panel-strong rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('location.hoursTitle')}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t('location.hoursValue')}
                  </p>
                </div>
              </div>
            </div>

            <div className="client-panel-strong rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('location.landmarkTitle')}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t('location.landmarkValue')}
                  </p>
                </div>
              </div>
            </div>

            {hasCoords && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="client-panel-strong flex items-center justify-center gap-2 rounded-lg p-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                <MapPin className="h-4 w-4" />
                {t('location.openMaps')}
              </a>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
