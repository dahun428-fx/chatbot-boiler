import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

const base = import.meta.env.BASE_URL || '/';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'ko',
    lng: 'ko',
    ns: ['common', 'chatbot'], // 필요한 네임스페이스만 유지
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: `${base}locales/{{lng}}/{{ns}}.json`,
    },
  });

export default i18n;
