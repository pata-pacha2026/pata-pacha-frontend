import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useCartContext } from '@/hooks/use-cart-context';
import { Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { t, locale } = useI18n();
  const { items, products, totalAmount, updateQuantity, removeItem } = useCartContext();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-semibold" style={{ fontSize: 'var(--font-size-title)' }}>
            {t('cart_title')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ gap: 'var(--spacing-md)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-40">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p>{t('cart_empty')}</p>
              <Button variant="outline" onClick={onClose} className="mt-4 cursor-pointer">
                {t('cart_continue')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
              {items.map(item => {
                const product = products[item.productId];
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                      <img
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={getLocalizedName(product, locale as Locale)}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23f5f5f4"><rect width="80" height="80"/></svg>'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{getLocalizedName(product, locale as Locale)}</h4>
                      <p className="text-sm font-bold text-accent mt-1">{formatPrice(product.price, locale as Locale)}</p>
                      <div className="flex items-center mt-2" style={{ gap: 'var(--spacing-xs)' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 cursor-pointer"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >−</Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 cursor-pointer"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >+</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 ml-auto text-destructive cursor-pointer"
                          onClick={() => removeItem(item.productId)}
                        >{t('cart_remove')}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">{t('cart_subtotal')}</span>
              <span className="font-semibold">{formatPrice(totalAmount, locale as Locale)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">{t('cart_shipping')}</span>
              <span className="text-sm text-success">{t('cart_shipping_free')}</span>
            </div>
            <div className="flex justify-between mb-4 pt-2 border-t border-border">
              <span className="font-semibold">{t('cart_total')}</span>
              <span className="font-bold text-accent" style={{ fontSize: 'var(--font-size-title)' }}>{formatPrice(totalAmount, locale as Locale)}</span>
            </div>
            <Link to="/checkout" onClick={onClose}>
              <Button className="w-full cursor-pointer font-semibold" style={{ height: 'var(--spacing-2xl)' }}>
                {t('cart_checkout')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
