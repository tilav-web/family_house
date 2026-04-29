import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, ChevronLeft, Clock, Share2 } from 'lucide-react'
import { newsService } from '../services/news.service'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { getLocalizedField } from '../lib/i18n-field'
import { LexicalRenderer } from '../components/editor/LexicalRenderer'
import { Footer } from '../components/layout/Footer'
import { Seo } from '../components/Seo'

const SITE_URL = 'https://hotel-familyhouse.uz'

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const {
    data: news,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsService.findOne(id!),
    enabled: !!id,
  })

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <div className="client-section flex min-h-[80vh] items-center justify-center px-4">
          <div className="client-grid" />
          <div className="client-panel rounded-lg px-8 py-10 text-center">
            <h1 className="text-4xl font-bold text-foreground">{t('news.notFound')}</h1>
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
        <div className="container mx-auto max-w-5xl px-4 pt-8 lg:px-8">
          <Skeleton className="mb-8 h-[52vh] w-full rounded-lg" />
          <Skeleton className="h-[540px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (!news) return null

  const title = getLocalizedField(news.title, i18n.language)
  const content = getLocalizedField(news.content, i18n.language)
  const excerpt = getLocalizedField(news.excerpt, i18n.language)

  const locale =
    i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
  const date = new Date(news.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href })
      return
    }

    await navigator.clipboard.writeText(window.location.href)
  }

  const seoDescription = truncate(
    excerpt || content || `${title} — Family House Qarshi mehmonxonasi yangiliklari.`,
  )
  const seoImage = absoluteUrl(news.thumbnailUrl)

  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: seoDescription,
    url: `${SITE_URL}/news/${news.id}`,
    datePublished: news.createdAt,
    dateModified: news.updatedAt || news.createdAt,
    inLanguage: i18n.language,
    ...(seoImage ? { image: [seoImage] } : {}),
    author: {
      '@type': 'Organization',
      name: 'Family House',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Family House',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${news.id}`,
    },
  }

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Family House', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: t('news.label') || 'Yangiliklar', item: `${SITE_URL}/#news` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/news/${news.id}` },
    ],
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <Seo
        title={`${title} — Family House Qarshi`}
        description={seoDescription}
        path={`/news/${news.id}`}
        image={seoImage}
        type="article"
        locale={i18n.language}
        jsonLd={[articleJsonLd, breadcrumbJsonLd]}
      />
      <section className="client-section overflow-hidden pb-24">
        <div className="client-grid" />

        <div className="relative h-[58vh] min-h-[480px] w-full overflow-hidden bg-slate-950">
          {news.thumbnailUrl ? (
            <>
              <img
                src={news.thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--client-glow),transparent_34%),linear-gradient(135deg,var(--primary),transparent_65%)] opacity-80" />
          )}

          <div className="absolute left-0 right-0 top-6 z-20">
            <div className="container mx-auto max-w-5xl px-4 lg:px-8">
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
            <div className="container mx-auto max-w-5xl px-4 pb-12 lg:px-8">
              <div className="max-w-4xl">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                  {t('news.label')}
                </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {excerpt && (
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
                    {excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container relative mx-auto -mt-14 max-w-5xl px-4 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="client-panel rounded-lg p-6 md:p-10"
          >
            <div className="flex flex-col gap-6 border-b client-divider pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="client-panel-strong flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {date}
                </div>
                <div className="client-panel-strong flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  {readingTime} {t('news.readingTime')}
                </div>
              </div>

              <Button
                variant="outline"
                className="h-11 rounded-lg border-[var(--client-line)] bg-transparent px-5"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                {t('news.share')}
              </Button>
            </div>

            {excerpt && (
              <div className="mt-8 rounded-lg border border-[var(--client-line)] bg-background/75 px-5 py-5">
                <p className="text-lg leading-8 text-muted-foreground">{excerpt}</p>
              </div>
            )}

            <div className="mt-10">
              <LexicalRenderer content={content} className="news-content" />
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t client-divider pt-8 sm:flex-row">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-[var(--client-line)] bg-transparent px-5"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('news.backHome')}
              </Button>
              <Button className="h-11 rounded-lg px-5" onClick={handleShare}>
                {t('news.share')}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.article>
        </div>
      </section>
      <Footer />
    </div>
  )
}
