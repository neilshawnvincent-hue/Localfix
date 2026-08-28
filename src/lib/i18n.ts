import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import { useAuthStore } from '@/store/authStore';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Subscribe to Zustand store changes to sync language automatically
useAuthStore.subscribe((state) => {
  if (state.language && state.language !== i18n.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
