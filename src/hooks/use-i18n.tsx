import { useState, useCallback, useEffect, ReactNode } from 'react';
import { I18nContext, useI18n as _useI18n } from '../i18n';
import { Locale, DEFAULT_LOCALE, LOCALES } from '../i18n/types';
import { getTranslations } from '../i18n';

// Re-export useI18n from i18n module
export const useI18n = _useI18n;

const STORAGE_KEY = 'pata-pacha-locale';

function getSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.includes(saved as Locale)) return saved as Locale;
  } catch {}
  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  if (LOCALES.includes(browserLang as Locale)) return browserLang as Locale;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getSavedLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem(STORAGE_KEY, newLocale); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key: string): string => {
    const translations = getTranslations(locale) as Record<string, string>;
    return translations[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
