import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import fr from './locales/fr';
import en from './locales/en';

const STORAGE_KEY = 'glist_locale';

export const LOCALES = [
  { code: 'fr', labelKey: 'lang.fr', htmlLang: 'fr', manifestLang: 'fr-GN' },
  { code: 'en', labelKey: 'lang.en', htmlLang: 'en', manifestLang: 'en-GN' },
];

const MESSAGES = { fr, en };

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, String(value)),
    str,
  );
}

function readInitialLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'sus') return 'fr';
  if (saved && MESSAGES[saved]) return saved;
  const browser = navigator.language?.slice(0, 2);
  if (browser === 'en') return 'en';
  return 'fr';
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  const setLocale = useCallback((code) => {
    if (!MESSAGES[code]) return;
    setLocaleState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const localeMeta = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    document.documentElement.lang = localeMeta.htmlLang;
  }, [localeMeta.htmlLang]);

  const t = useCallback(
    (key, vars) => {
      const raw = MESSAGES[locale]?.[key] ?? MESSAGES.fr[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, localeMeta }),
    [locale, setLocale, t, localeMeta],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
