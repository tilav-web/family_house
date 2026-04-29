import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://hotel-familyhouse.uz'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`
const SITE_NAME = 'Family House'

interface SeoProps {
  title: string
  description?: string
  path?: string
  image?: string | null
  type?: 'website' | 'article' | 'product'
  locale?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  noindex?: boolean
}

function toAbsolute(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function langToOgLocale(lang: string): string {
  if (lang.startsWith('ru')) return 'ru_RU'
  if (lang.startsWith('en')) return 'en_US'
  return 'uz_UZ'
}

export function Seo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  locale = 'uz',
  jsonLd,
  noindex,
}: SeoProps) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const ogImage = toAbsolute(image, DEFAULT_OG_IMAGE)
  const fullTitle =
    title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : []

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={langToOgLocale(locale)} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {jsonLdArray.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  )
}
