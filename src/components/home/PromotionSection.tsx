import { useI18n } from '@/hooks/use-i18n';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Promotion, Locale } from '@/types';
import { getPromoTitle, getPromoSubtitle } from '@/lib/product-utils';
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives';
import { Link } from 'react-router-dom';

const PROMO_STYLES: Record<string, { emoji: string; gradient: string; accentBg: string }> = {
  flash: {
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, oklch(0.82 0.18 90), oklch(0.78 0.20 60))',
    accentBg: 'oklch(0.65 0.24 350)',
  },
  bundle: {
    emoji: '🎁',
    gradient: 'linear-gradient(135deg, oklch(0.75 0.18 350), oklch(0.62 0.22 300))',
    accentBg: 'oklch(0.82 0.18 90)',
  },
  seasonal: {
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, oklch(0.68 0.16 155), oklch(0.65 0.18 240))',
    accentBg: 'oklch(0.82 0.18 90)',
  },
};

export default function PromotionSection() {
  const { t, locale } = useI18n();

  const { data: promotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const res = await apiClient.post('/promotions/list');
      return res.data?.data as Promotion[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-16">
      <div className="container">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="cute-tag bg-accent/15 text-accent-foreground mb-3 inline-block">🏷️ {t('promo_title')}</span>
            <h2 className="font-display font-bold" style={{ fontSize: 'var(--font-size-headline)' }}>
              {t('promo_title')}
            </h2>
            <p className="text-muted-foreground mt-1">{t('promo_subtitle')}</p>
          </div>
        </FadeIn>

        <Stagger stagger={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
            {(promotions || []).map((promo) => {
              const style = PROMO_STYLES[promo.type] || PROMO_STYLES.flash;
              return (
                <HoverLift key={promo.id}>
                  <div
                    className="relative overflow-hidden rounded-2xl p-8 text-white cursor-pointer card-hover-lift"
                    style={{ background: style.gradient, minHeight: '240px' }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <span className="cute-tag bg-white/25 text-white backdrop-blur-sm mb-4 inline-block">
                          {style.emoji} {t(`promo_${promo.type}`)}
                        </span>
                        <h3 className="font-display font-bold mb-2" style={{ fontSize: 'var(--font-size-title)' }}>
                          {getPromoTitle(promo, locale as Locale)}
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          {getPromoSubtitle(promo, locale as Locale)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold" style={{ textShadow: '0 2px 8px oklch(0 0 0 / 0.15)' }}>
                          -{Math.round(promo.discount)}%
                        </span>
                        <Link
                          to="/products"
                          className="inline-flex items-center text-sm font-bold no-underline text-white hover:opacity-80 transition-opacity cursor-pointer rounded-full bg-white/25 backdrop-blur-sm px-4 py-2"
                        >
                          {t('promo_shop_now')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </HoverLift>
              );
            })}
          </div>
        </Stagger>
      </div>
    </section>
  );
}
