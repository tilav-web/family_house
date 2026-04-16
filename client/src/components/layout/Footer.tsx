import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { Logo } from './Logo'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const socialLinks = [
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: Send, href: '#', label: 'Telegram' },
]

const quickLinks = [
  { href: '#about', key: 'nav.about' },
  { href: '#services', key: 'nav.services' },
  { href: '#rooms', key: 'nav.rooms' },
  { href: '#news', key: 'nav.news' },
  { href: '#contact', key: 'nav.contact' },
  { href: '#location', key: 'nav.location' },
]

export function Footer() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/'

  const scrollTo = (href: string) => {
    if (isHomePage) {
      const el = document.querySelector(href)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + href)
    }
  }

  return (
    <footer className="client-footer border-t border-white/6">
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="text-xl font-bold text-white tracking-tight">Family House</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-white/62">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/64 transition-all hover:border-primary/40 hover:bg-primary hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
                    className="text-sm text-white/62 transition-colors hover:text-white"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-white/62">{t('contact.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href={`tel:${t('contact.phoneNumber').replace(/\s/g, '')}`} className="text-sm text-white/62 transition-colors hover:text-white">
                  {t('contact.phoneNumber')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${t('contact.emailAddress')}`} className="text-sm text-white/62 transition-colors hover:text-white">
                  {t('contact.emailAddress')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row lg:px-8">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Family House. {t('footer.rights')}
          </p>
          <p className="text-xs text-white/40">
            {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  )
}
