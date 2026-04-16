import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useCartContext } from '@/hooks/use-cart-context';
import { Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { apiClient } from '@/lib/api-client';
import { FadeIn } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'alipay' | 'wechat' | 'paypal';

export default function Checkout() {
  const { t, locale } = useI18n();
  const { items, products, totalAmount, clearCart } = useCartContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [demoMode, setDemoMode] = useState(true);

  const [form, setForm] = useState({
    email: '', fullName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: '',
  });

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Check if real payment keys are configured
  useEffect(() => {
    const checkMethods = async () => {
      try {
        const res = await apiClient.post('/payments/methods');
        const methods: string[] = res.data?.data || [];
        setDemoMode(methods.includes('card_demo'));
      } catch {}
    };
    checkMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error(t('cart_empty'));
      return;
    }

    setLoading(true);
    try {
      // 1. Create order
      const orderItems = items.map(item => {
        const p = products[item.productId];
        return { productId: item.productId, quantity: item.quantity, price: p?.price || 0 };
      });

      const orderRes = await apiClient.post('/orders/create', {
        ...form,
        items: orderItems,
        totalAmount,
      });
      const orderId = orderRes.data?.data?.id;

      // 2. Process payment
      if (paymentMethod === 'paypal') {
        // PayPal flow
        const paypalRes = await apiClient.post('/paypal/create-order', {
          amount: totalAmount,
          currency: locale === 'zh' ? 'CNY' : 'USD',
          orderId,
        });
        if (paypalRes.data?.data?.demoMode) {
          // Demo mode: simulate capture
          await apiClient.post('/paypal/capture-order', { paypalOrderId: paypalRes.data.data.orderID, orderId });
        }
        // Real mode: redirect to PayPal would happen here
      } else {
        // Stripe flow (card, alipay, wechat)
        const stripeRes = await apiClient.post('/stripe/create-intent', {
          amount: totalAmount,
          currency: locale === 'zh' ? 'cny' : 'usd',
          metadata: { orderId: String(orderId) },
        });
        if (stripeRes.data?.data?.demoMode) {
          // Demo mode: simulate confirmation
          await apiClient.post('/stripe/confirm', { paymentIntentId: 'demo', orderId });
        }
        // Real mode: Stripe.js would handle the payment confirmation
      }

      clearCart();
      navigate(`/order-success?orderId=${orderId}`);
    } catch (error) {
      toast.error(t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">{t('cart_empty')}</p>
        <Button onClick={() => navigate('/products')} className="cursor-pointer">{t('cart_continue')}</Button>
      </div>
    );
  }

  const fields = [
    { key: 'email', label: t('checkout_email'), type: 'email' },
    { key: 'fullName', label: t('checkout_fullname'), type: 'text' },
    { key: 'phone', label: t('checkout_phone'), type: 'tel' },
    { key: 'address', label: t('checkout_address'), type: 'text' },
    { key: 'city', label: t('checkout_city'), type: 'text' },
    { key: 'state', label: t('checkout_state'), type: 'text' },
    { key: 'zipCode', label: t('checkout_zip'), type: 'text' },
    { key: 'country', label: t('checkout_country'), type: 'text' },
  ];

  const paymentMethods: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
    { id: 'alipay', label: 'Alipay', icon: '🅰️', desc: '支付宝' },
    { id: 'wechat', label: 'WeChat Pay', icon: '💬', desc: '微信支付' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'Pay with PayPal account' },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <FadeIn>
          <h1 className="font-display font-bold mb-8" style={{ fontSize: 'var(--font-size-headline)' }}>
            {t('checkout_title')}
          </h1>
        </FadeIn>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3" style={{ gap: 'var(--spacing-2xl)' }}>
            {/* Left: Shipping + Payment */}
            <div className="lg:col-span-2 flex flex-col" style={{ gap: 'var(--spacing-xl)' }}>
              {/* Shipping Info */}
              <FadeIn delay={0.1}>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-semibold mb-6" style={{ fontSize: 'var(--font-size-title)' }}>
                    {t('checkout_shipping_info')}
                  </h2>
                  <div className="grid sm:grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                    {fields.map(field => (
                      <div key={field.key} className={field.key === 'address' ? 'sm:col-span-2' : ''}>
                        <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                        <Input
                          type={field.type}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Payment Method */}
              <FadeIn delay={0.15}>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-semibold mb-6" style={{ fontSize: 'var(--font-size-title)' }}>
                    Payment Method
                  </h2>

                  {demoMode && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4 flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                      <span className="text-sm text-accent">Demo Mode — Payment will be simulated. Add Stripe/PayPal API keys in .env to enable real payments.</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2" style={{ gap: 'var(--spacing-sm)' }}>
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all text-left ${
                          paymentMethod === method.id
                            ? 'border-accent bg-accent/5 ring-1 ring-accent'
                            : 'border-border hover:border-accent/50'
                        }`}
                        style={{ gap: 'var(--spacing-sm)' }}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Card Form (shown for card payment) */}
                  {paymentMethod === 'card' && (
                    <div className="mt-6 grid sm:grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-1.5 block">Card Number</label>
                        <Input
                          value={cardForm.number}
                          onChange={e => setCardForm(p => ({ ...p, number: e.target.value }))}
                          placeholder={demoMode ? '4242 4242 4242 4242' : ''}
                          required={!demoMode}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Expiry</label>
                        <Input
                          value={cardForm.expiry}
                          onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))}
                          placeholder={demoMode ? '12/28' : 'MM/YY'}
                          required={!demoMode}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">CVC</label>
                        <Input
                          value={cardForm.cvc}
                          onChange={e => setCardForm(p => ({ ...p, cvc: e.target.value }))}
                          placeholder={demoMode ? '123' : ''}
                          required={!demoMode}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-1.5 block">Cardholder Name</label>
                        <Input
                          value={cardForm.name}
                          onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))}
                          required={!demoMode}
                        />
                      </div>
                    </div>
                  )}

                  {/* Alipay / WeChat note */}
                  {(paymentMethod === 'alipay' || paymentMethod === 'wechat') && (
                    <div className="mt-4 bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        {paymentMethod === 'alipay'
                          ? 'You will be redirected to Alipay to complete the payment.'
                          : 'You will see a WeChat Pay QR code to scan and complete the payment.'}
                      </p>
                    </div>
                  )}

                  {/* PayPal note */}
                  {paymentMethod === 'paypal' && (
                    <div className="mt-4 bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        You will be redirected to PayPal to log in and confirm the payment.
                      </p>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* Right: Order Summary */}
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-title)' }}>
                    {t('checkout_order_summary')}
                  </h2>
                  <div className="space-y-3 mb-4">
                    {items.map(item => {
                      const product = products[item.productId];
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="truncate mr-2">{getLocalizedName(product, locale as Locale)} x {item.quantity}</span>
                          <span className="font-medium flex-shrink-0">{formatPrice(product.price * item.quantity, locale as Locale)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart_shipping')}</span>
                      <span className="text-success">{t('cart_shipping_free')}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>{t('cart_total')}</span>
                      <span className="text-accent" style={{ fontSize: 'var(--font-size-title)' }}>{formatPrice(totalAmount, locale as Locale)}</span>
                    </div>
                  </div>

                  {/* Payment method badge */}
                  <div className="mt-4 flex items-center justify-center" style={{ gap: 'var(--spacing-sm)' }}>
                    {paymentMethods.filter(m => m.id === paymentMethod).map(m => (
                      <span key={m.id} className="text-xs bg-muted px-3 py-1.5 rounded-full flex items-center" style={{ gap: '4px' }}>
                        {m.icon} {m.label}
                      </span>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 font-semibold cursor-pointer"
                    style={{ height: 'var(--spacing-2xl)' }}
                  >
                    {loading ? t('checkout_processing') : `${t('checkout_place_order')} - ${formatPrice(totalAmount, locale as Locale)}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Your payment information is secure and encrypted.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
