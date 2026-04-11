import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye } from 'lucide-react'
import { roomsService } from '../../services/rooms.service'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { getLocalizedField } from '../../lib/i18n-field'
import { ScrollReveal, StaggerContainer, StaggerItem } from '../shared/ScrollReveal'

export function RoomsSection() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsService.findAll(),
  })

  const rooms = Array.isArray(data) ? data : []
  const activeRooms = rooms
    .filter((room) => room.isActive)
    .sort((left, right) => left.order - right.order)

  if (isLoading) {
    return (
      <section id="rooms" className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="rooms" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('rooms.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('rooms.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('rooms.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {activeRooms.length.toString().padStart(2, '0')} {t('nav.rooms')}
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeRooms.map((room) => {
            const name = getLocalizedField(room.name, i18n.language)
            const description = getLocalizedField(room.description, i18n.language)
            const amenities = (getLocalizedField(room.amenities, i18n.language) || '')
              .split(/,|•|\n/)
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 3)
            const sceneCount = room.scenes?.filter((scene: { isActive: boolean }) => scene.isActive).length ?? 0
            const formattedPrice = room.pricePerNight.toLocaleString(
              i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US',
            )

            return (
              <StaggerItem key={room.id}>
                <Link to={`/rooms/${room.id}`} className="group block">
                  <article className="client-panel-strong relative overflow-hidden rounded-lg transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="relative h-64 overflow-hidden bg-slate-200">
                      {room.thumbnailUrl ? (
                        <img
                          src={room.thumbnailUrl}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          <Eye className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {sceneCount > 0 && (
                        <div className="absolute left-4 top-4 rounded-lg border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                          360° Tour
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_14px_32px_var(--client-shadow)]">
                        {formattedPrice} {room.currency}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                          {name}
                        </h3>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t('rooms.perNight')}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {description}
                      </p>

                      {amenities.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="rounded-lg border border-[var(--client-line)] bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex items-center text-sm font-medium text-primary">
                        <span>{t('rooms.viewDetails')}</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
