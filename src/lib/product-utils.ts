import { Product, Category, Promotion, Locale } from '@/types';

function getLocalizedName(product: Product, locale: Locale): string {
  const map: Record<Locale, string> = {
    zh: product.nameZh, en: product.nameEn, es: product.nameEs, fr: product.nameFr, de: product.nameDe,
  };
  return map[locale] || product.nameEn;
}

function getLocalizedDesc(product: Product, locale: Locale): string {
  const map: Record<Locale, string> = {
    zh: product.descZh, en: product.descEn, es: product.descEs, fr: product.descFr, de: product.descDe,
  };
  return map[locale] || product.descEn;
}

function getCategoryName(cat: Category, locale: Locale): string {
  const map: Record<Locale, string> = {
    zh: cat.nameZh, en: cat.nameEn, es: cat.nameEs, fr: cat.nameFr, de: cat.nameDe,
  };
  return map[locale] || cat.nameEn;
}

function getPromoTitle(promo: Promotion, locale: Locale): string {
  const map: Record<Locale, string> = {
    zh: promo.titleZh, en: promo.titleEn, es: promo.titleEs, fr: promo.titleFr, de: promo.titleDe,
  };
  return map[locale] || promo.titleEn;
}

function getPromoSubtitle(promo: Promotion, locale: Locale): string {
  const map: Record<Locale, string> = {
    zh: promo.subtitleZh, en: promo.subtitleEn, es: promo.subtitleEs, fr: promo.subtitleFr, de: promo.subtitleDe,
  };
  return map[locale] || promo.subtitleEn;
}

function formatPrice(price: number, locale: Locale): string {
  const currency = locale === 'zh' ? '¥' : locale === 'en' ? '$' : '€';
  return `${currency}${price}`;
}

export {
  getLocalizedName,
  getLocalizedDesc,
  getCategoryName,
  getPromoTitle,
  getPromoSubtitle,
  formatPrice,
};
