import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import uz from '../locales/uz.json'
import ru from '../locales/ru.json'
import en from '../locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'uz',
    defaultNS: 'translation',
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
  })

export default i18n
