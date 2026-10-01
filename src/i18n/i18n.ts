import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

const LANGUAGE_KEY = 'localfix-language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

/** Detect the language persisted in AsyncStorage, or fall back to the device locale. */
async function detectLanguage(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && (stored === 'en' || stored === 'hi')) return stored;
  } catch {
    // AsyncStorage unavailable — fall through to device detection.
  }

  // expo-localization returns the device's locale list (e.g. ['hi-IN', 'en-US']).
  const deviceLocales = Localization.getLocales();
  const deviceLang = deviceLocales?.[0]?.languageCode ?? 'en';
  return deviceLang === 'hi' ? 'hi' : 'en';
}

/** Persist the user's language choice so it survives app restarts. */
export async function persistLanguage(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // Best-effort persistence — swallow errors silently.
  }
}

// Initialize i18next synchronously with English as the default.
// The actual detected language is applied as soon as `initI18n()` resolves.
void i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // synchronous default — overridden by detectLanguage()
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

/** Call once on app start (e.g. inside a useEffect) to apply the detected/persisted language. */
export async function initI18n(): Promise<void> {
  const lang = await detectLanguage();
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
}

export default i18n;
