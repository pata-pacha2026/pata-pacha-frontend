import { createContext, useContext } from 'react';
import { Locale, DEFAULT_LOCALE } from './types';
import zh from './zh';
import en from './en';
import es from './es';
import fr from './fr';
import de from './de';

type TranslationKeys = keyof typeof en;
type Translations = Record<TranslationKeys, string>;

const translations: Record<Locale, Translations> = { zh, en, es, fr, de } as Record<Locale, Translations>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

export const getTranslations = (locale: Locale): Translations => translations[locale] || translations[DEFAULT_LOCALE];

export { translations };
export type { TranslationKeys, Translations };
