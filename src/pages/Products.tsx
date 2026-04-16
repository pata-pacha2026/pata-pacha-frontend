import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useCartContext } from '@/hooks/use-cart-context';
import { Product, Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ProductsPage() {
  const { t, locale } = useI18n();
  const { addItem } = useCartContext();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', categoryFilter, sort, page],
    queryFn: async () => {
      const res = await apiClient.post('/products/list', {
        category: categoryFilter || undefined,
        sort,
        page,
        pageSize: 12,
      });
      return res.data?.data as { products: Product[]; total: number };
    },
  });

  const handleAddCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId);
    toast.success(t('product_add_cart'));
  };

  const sorts = [
    { value: 'popular', label: t('common_sort_popular') },
    { value: 'newest', label: t('common_sort_newest') },
    { value: 'price_low', label: t('common_sort_price_low') },
    { value: 'price_high', label: t('common_sort_price_high') },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8" style={{ gap: 'var(--spacing-md)' }}>
            <div>
              <h1 className="font-display font-bold" style={{ fontSize: 'var(--font-size-headline)' }}>
                {t('nav_products')}
              </h1>
              {categoryFilter && (
                <p className="text-muted-foreground text-sm mt-1">
                  {data?.total || 0} {t('cart_items')}
                </p>
              )}
            </div>
            <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
              <span className="text-sm text-muted-foreground">{t('common_sort')}:</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {sorts.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setSort(s.value); setPage(1); }}
                    className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                      sort === s.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Stagger stagger={0.06}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
              {(data?.products || []).map((product) => (
                <HoverLift key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    className="group block bg-card border border-border rounded-xl overflow-hidden no-underline text-inherit cursor-pointer card-hover-lift"
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={getLocalizedName(product, locale as Locale)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f5f5f4"><rect width="400" height="400"/><text x="50%" y="50%" font-size="40" text-anchor="middle" fill="%23a8a29e">🐾</text></svg>'; }}
                      />
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded">NEW</span>
                      )}
                      {product.originalPrice && (
                        <span className="absolute top-3 right-3 bg-destructive text-white text-xs font-semibold px-2 py-1 rounded">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2">
                        {getLocalizedName(product, locale as Locale)}
                      </h3>
                      <div className="flex items-center mb-3" style={{ gap: 'var(--spacing-xs)' }}>
                        <div className="flex items-center">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? 'oklch(0.76 0.15 80)' : 'none'} stroke="oklch(0.76 0.15 80)" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline" style={{ gap: 'var(--spacing-xs)' }}>
                          <span className="font-bold text-accent text-sm">{formatPrice(product.price, locale as Locale)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice, locale as Locale)}</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" onClick={(e) => handleAddCart(e, product.id)} className="h-8 w-8 p-0 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </HoverLift>
              ))}
            </div>
          </Stagger>
        )}

        {/* Pagination */}
        {data && data.total > 12 && (
          <div className="flex justify-center mt-8" style={{ gap: 'var(--spacing-sm)' }}>
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer">
              ←
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              {page} / {Math.ceil(data.total / 12)}
            </span>
            <Button variant="outline" disabled={page >= Math.ceil(data.total / 12)} onClick={() => setPage(p => p + 1)} className="cursor-pointer">
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
