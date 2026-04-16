import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useCartContext } from '@/hooks/use-cart-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, Locale } from '@/types';
import { getLocalizedName, getLocalizedDesc, formatPrice } from '@/lib/product-utils';
import { FadeIn, Stagger, HoverLift } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const { addItem } = useCartContext();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.post('/products/detail', { id: Number(id) });
      return res.data?.data as { product: Product; related: Product[] };
    },
    enabled: !!id,
  });

  const product = data?.product;
  const related = data?.related || [];

  const handleAddCart = () => {
    if (!product) return;
    addItem(product.id, quantity);
    toast.success(t('product_add_cart'));
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="animate-pulse grid md:grid-cols-2" style={{ gap: 'var(--spacing-2xl)' }}>
          <div className="aspect-square bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">{t('common_error')}</p>
        <Link to="/products"><Button variant="outline" className="mt-4 cursor-pointer">{t('cart_continue')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center text-sm text-muted-foreground mb-8" style={{ gap: 'var(--spacing-xs)' }}>
            <Link to="/" className="hover:text-primary no-underline text-muted-foreground cursor-pointer">{t('nav_home')}</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary no-underline text-muted-foreground cursor-pointer">{t('nav_products')}</Link>
            <span>/</span>
            <span className="text-foreground">{getLocalizedName(product, locale as Locale)}</span>
          </nav>
        </FadeIn>

        {/* Product */}
        <div className="grid md:grid-cols-2" style={{ gap: 'var(--spacing-2xl)' }}>
          {/* Image */}
          <FadeIn duration={0.5}>
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={getLocalizedName(product, locale as Locale)}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" fill="%23f5f5f4"><rect width="600" height="600"/><text x="50%" y="50%" font-size="60" text-anchor="middle" fill="%23a8a29e">🐾</text></svg>'; }}
              />
            </div>
          </FadeIn>

          {/* Info */}
          <FadeIn duration={0.5} delay={0.2}>
            <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
              <div>
                {product.isNew && (
                  <span className="inline-block text-xs font-semibold bg-accent text-accent-foreground px-3 py-1 rounded-full mb-3">NEW</span>
                )}
                <h1 className="font-display font-bold mb-2" style={{ fontSize: 'var(--font-size-headline)' }}>
                  {getLocalizedName(product, locale as Locale)}
                </h1>
                <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? 'oklch(0.76 0.15 80)' : 'none'} stroke="oklch(0.76 0.15 80)" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{product.rating}</span>
                  <span className="text-sm text-success">{product.stock > 0 ? t('product_in_stock') : t('product_out_of_stock')}</span>
                </div>
              </div>

              <div className="flex items-baseline" style={{ gap: 'var(--spacing-sm)' }}>
                <span className="font-bold text-accent" style={{ fontSize: 'var(--font-size-headline)' }}>
                  {formatPrice(product.price, locale as Locale)}
                </span>
                {product.originalPrice && (
                  <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice, locale as Locale)}</span>
                )}
                {product.originalPrice && (
                  <span className="text-sm font-medium text-destructive">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">{getLocalizedDesc(product, locale as Locale)}</p>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center" style={{ gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)' }}>
                <span className="text-sm font-medium">{t('product_quantity')}:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-10 w-10 cursor-pointer">−</Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="h-10 w-10 cursor-pointer">+</Button>
                </div>
              </div>

              <Button
                onClick={handleAddCart}
                disabled={product.stock === 0}
                className="w-full font-semibold cursor-pointer"
                style={{ height: 'var(--spacing-2xl)', fontSize: 'var(--font-size-label)' }}
              >
                {t('product_add_cart')}
              </Button>
            </div>
          </FadeIn>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <FadeIn>
              <h2 className="font-display font-bold mb-8" style={{ fontSize: 'var(--font-size-headline)' }}>
                {t('product_related')}
              </h2>
            </FadeIn>
            <Stagger stagger={0.08}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
                {related.map(p => (
                  <HoverLift key={p.id}>
                    <Link to={`/products/${p.id}`} className="group block bg-card border border-border rounded-xl overflow-hidden no-underline text-inherit cursor-pointer card-hover-lift">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img src={p.images[0] || '/placeholder.jpg'} alt={getLocalizedName(p, locale as Locale)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium truncate">{getLocalizedName(p, locale as Locale)}</h3>
                        <p className="font-bold text-accent text-sm mt-1">{formatPrice(p.price, locale as Locale)}</p>
                      </div>
                    </Link>
                  </HoverLift>
                ))}
              </div>
            </Stagger>
          </div>
        )}
      </div>
    </div>
  );
}
