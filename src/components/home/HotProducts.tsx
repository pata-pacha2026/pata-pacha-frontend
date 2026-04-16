import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery } from '@tanstack/react-query';
import { useCartContext } from '@/hooks/use-cart-context';
import { apiClient } from '@/lib/api-client';
import { Product, Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function HotProducts() {
  const { t, locale } = useI18n();
  const { addItem } = useCartContext();

  const { data: products } = useQuery({
    queryKey: ['hot-products'],
    queryFn: async () => {
      const res = await apiClient.post('/products/list', { isHot: true, pageSize: 8 });
      return res.data?.data?.products as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleAddCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId);
    toast.success(t('product_add_cart'));
  };

  return (
    <section className="py-16" style={{ background: 'linear-gradient(180deg, oklch(0.95 0.03 350 / 0.3) 0%, oklch(0.95 0.03 300 / 0.15) 50%, transparent 100%)' }}>
      <div className="container">
        <FadeIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="cute-tag bg-accent/15 text-accent-foreground mb-3 inline-block">🔥 {t('hot_title')}</span>
              <h2 className="font-display font-bold" style={{ fontSize: 'var(--font-size-headline)' }}>
                {t('hot_title')}
              </h2>
              <p className="text-muted-foreground mt-1">{t('hot_subtitle')}</p>
            </div>
            <Link
              to="/products"
              className="text-sm font-bold text-primary hover:opacity-80 transition-opacity no-underline cursor-pointer hidden sm:flex items-center rounded-full bg-primary/10 px-4 py-2"
            >
              {t('hot_view_all')} →
            </Link>
          </div>
        </FadeIn>

        <Stagger stagger={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
            {(products || []).map((product) => (
              <HoverLift key={product.id}>
                <Link
                  to={`/products/${product.id}`}
                  className="group block bg-card border-2 border-transparent rounded-2xl overflow-hidden no-underline text-inherit cursor-pointer card-hover-lift hover:border-primary/20"
                  style={{ boxShadow: '0 4px 20px oklch(0.7 0.15 330 / 0.08)' }}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <img
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={getLocalizedName(product, locale as Locale)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23fce7f3"><rect width="400" height="400"/><text x="50%" y="50%" font-size="40" text-anchor="middle" fill="%23ec4899">🐾</text></svg>'; }}
                    />
                    {product.isNew && (
                      <span className="absolute top-3 left-3 cute-tag bg-primary text-primary-foreground shadow-md">
                        ✨ NEW
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="absolute top-3 right-3 cute-tag bg-destructive text-white shadow-md">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4" style={{ gap: 'var(--spacing-xs)' }}>
                    <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2" style={{ minHeight: '2.5em' }}>
                      {getLocalizedName(product, locale as Locale)}
                    </h3>
                    <div className="flex items-center mb-3" style={{ gap: 'var(--spacing-xs)' }}>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="text-xs" style={{ color: star <= Math.round(product.rating) ? 'oklch(0.82 0.18 90)' : 'oklch(0.9 0.02 90)' }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{product.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline" style={{ gap: 'var(--spacing-xs)' }}>
                        <span className="font-bold text-primary" style={{ fontSize: 'var(--font-size-label)' }}>
                          {formatPrice(product.price, locale as Locale)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice, locale as Locale)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                        onClick={(e) => handleAddCart(e, product.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      </Button>
                    </div>
                  </div>
                </Link>
              </HoverLift>
            ))}
          </div>
        </Stagger>

        <div className="text-center mt-8 sm:hidden">
          <Link to="/products" className="text-sm font-bold text-primary no-underline cursor-pointer inline-flex items-center rounded-full bg-primary/10 px-4 py-2">
            {t('hot_view_all')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
