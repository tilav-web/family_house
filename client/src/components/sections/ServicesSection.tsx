import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import { servicesService } from '../../services/services.service'
import { Skeleton } from '../ui/skeleton'
import { getLocalizedField } from '../../lib/i18n-field'
import { ScrollReveal, StaggerContainer, StaggerItem } from '../shared/ScrollReveal'

export function ServicesSection() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.findAll(),
  })

  const services = Array.isArray(data) ? data : []
  const activeServices = services
    .filter((service) => service.isActive)
    .sort((left, right) => left.order - right.order)

  if (isLoading) {
    return (
      <section id="services" className="py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (activeServices.length === 0) return null

  return (
    <section id="services" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('services.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('services.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {activeServices.length.toString().padStart(2, '0')} {t('services.label')}
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {activeServices.map((service, index) => {
            const title = getLocalizedField(service.title, i18n.language)
            const description = getLocalizedField(service.description, i18n.language)
            const iconCandidate = Icons[service.iconName as keyof typeof Icons]
            const Icon =
              typeof iconCandidate === 'function'
                ? (iconCandidate as ComponentType<{ className?: string }>)
                : Icons.Star

            return (
              <StaggerItem key={service.id}>
                <article className="client-panel-strong group flex h-full flex-col rounded-lg p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-8 flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                  <p className="mt-4 flex-1 leading-7 text-muted-foreground">{description}</p>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
