import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../public/locales/en/translation.json';
import hi from '../public/locales/hi/translation.json';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'hi'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
    });
}

export default i18n;
