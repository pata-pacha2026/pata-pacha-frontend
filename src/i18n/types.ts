export type Locale = 'zh' | 'en' | 'es' | 'fr' | 'de';

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  de: 'Deutsch',
};

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: Locale[] = ['zh', 'en', 'es', 'fr', 'de'];
