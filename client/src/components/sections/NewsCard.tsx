import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Calendar } from 'lucide-react'
import type { News } from '../../types'
import { getLocalizedField } from '../../lib/i18n-field'

interface NewsCardProps {
  item: News
  variant?: 'default' | 'featured'
}

export function NewsCard({ item, variant = 'default' }: NewsCardProps) {
  const { t, i18n } = useTranslation()
  const title = getLocalizedField(item.title, i18n.language)
  const excerpt = getLocalizedField(item.excerpt, i18n.language)

  const date = new Date(item.createdAt).toLocaleDateString(
    i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
  const isFeatured = variant === 'featured'

  return (
    <Link to={`/news/${item.id}`} className="group block">
      <article
        className={`client-panel-strong overflow-hidden rounded-lg transition-transform duration-300 group-hover:-translate-y-1 ${
          isFeatured ? 'h-full lg:grid lg:grid-cols-[1.08fr_0.92fr]' : 'h-full'
        }`}
      >
        <div className={`relative overflow-hidden bg-slate-100 ${isFeatured ? 'h-72 lg:h-full' : 'h-52'}`}>
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Family House
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/46 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <div className={`p-6 ${isFeatured ? 'flex flex-col justify-center lg:p-8' : ''}`}>
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>

          <h3
            className={`font-semibold text-foreground transition-colors group-hover:text-primary ${
              isFeatured ? 'line-clamp-3 text-2xl leading-tight sm:text-3xl' : 'line-clamp-2 text-xl'
            }`}
          >
            {title}
          </h3>

          <p
            className={`text-muted-foreground ${
              isFeatured ? 'mt-4 line-clamp-4 text-base leading-7' : 'mt-3 line-clamp-3 text-sm leading-7'
            }`}
          >
            {excerpt}
          </p>

          <div className="mt-6 flex items-center text-sm font-medium text-primary">
            <span>{t('news.readMore')}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  )
}
