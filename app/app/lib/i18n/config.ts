import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import local translations as fallback
import ptTranslations from './pt-PT.json';
import enTranslations from './en.json';

i18n
  .use(HttpBackend) // Load translations from backend
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    fallbackLng: 'pt-PT',
    debug: import.meta.env.DEV,
    
    ns: ['app'], // Main namespace
    defaultNS: 'app',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    backend: {
      loadPath: '/api/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Fallback resources
    resources: {
      'pt-PT': {
        app: ptTranslations,
      },
      'en': {
        app: enTranslations,
      },
    },
  });

export default i18n;
