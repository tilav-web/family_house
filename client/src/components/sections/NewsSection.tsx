import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { newsService } from '../../services/news.service'
import { Skeleton } from '../ui/skeleton'
import { NewsCard } from './NewsCard'
import { ScrollReveal, StaggerContainer, StaggerItem } from '../shared/ScrollReveal'

export function NewsSection() {
  const { t } = useTranslation()
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsService.findAll(1, 6),
  })

  const news = Array.isArray(newsData?.items)
    ? newsData.items.filter((item) => item.isPublished)
    : []

  if (isLoading) {
    return (
      <section id="news" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (news.length === 0) return null

  const [featuredNews, ...secondaryNews] = news

  return (
    <section id="news" className="client-section overflow-hidden py-24 lg:py-32">
      <div className="client-grid" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <ScrollReveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="client-label">{t('news.label')}</span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('news.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('news.subtitle')}
            </p>
          </div>

          <div className="client-badge self-start lg:self-auto">
            {news.length.toString().padStart(2, '0')} {t('nav.news')}
          </div>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <ScrollReveal>
            <NewsCard item={featuredNews} variant="featured" />
          </ScrollReveal>

          {secondaryNews.length > 0 && (
            <StaggerContainer className="grid gap-6">
              {secondaryNews.slice(0, 3).map((item) => (
                <StaggerItem key={item.id}>
                  <NewsCard item={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>
    </section>
  )
}
