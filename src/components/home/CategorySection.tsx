import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Category, Locale } from '@/types';
import { getCategoryName } from '@/lib/product-utils';
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives';

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  toys: { emoji: '🧸', gradient: 'cat-gradient-toys' },
  beds: { emoji: '🛏️', gradient: 'cat-gradient-beds' },
  carriers: { emoji: '👜', gradient: 'cat-gradient-carriers' },
  grooming: { emoji: '✂️', gradient: 'cat-gradient-grooming' },
  collars: { emoji: '🎀', gradient: 'cat-gradient-collars' },
  clothing: { emoji: '👔', gradient: 'cat-gradient-clothing' },
};

export default function CategorySection() {
  const { t, locale } = useI18n();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.post('/categories/list');
      return res.data?.data as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-16">
      <div className="container">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="cute-tag bg-primary/10 text-primary mb-3 inline-block">🐾 {t('cat_title')}</span>
            <h2 className="font-display font-bold" style={{ fontSize: 'var(--font-size-headline)' }}>
              {t('cat_title')}
            </h2>
            <div className="rainbow-underline w-20 mx-auto mt-3" />
          </div>
        </FadeIn>

        <Stagger stagger={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6" style={{ gap: 'var(--spacing-md)' }}>
            {(categories || []).map((cat) => {
              const config = CATEGORY_CONFIG[cat.slug] || { emoji: '🐾', gradient: '' };
              return (
                <HoverLift key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className={`flex flex-col items-center p-6 rounded-2xl border-2 border-transparent no-underline text-inherit cursor-pointer card-hover-lift ${config.gradient}`}
                    style={{ gap: 'var(--spacing-sm)' }}
                  >
                    <span className="text-4xl mb-1" style={{ animation: 'cute-bounce 2s ease infinite', animationDelay: `${cat.sortOrder * 0.2}s` }}>
                      {config.emoji}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {getCategoryName(cat, locale as Locale)}
                    </span>
                  </Link>
                </HoverLift>
              );
            })}
          </div>
        </Stagger>
      </div>
    </section>
  );
}
