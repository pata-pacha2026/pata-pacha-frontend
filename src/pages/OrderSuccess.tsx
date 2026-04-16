import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { FadeIn } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <FadeIn duration={0.6}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="oklch(0.596 0.145 163.225)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: 'var(--font-size-headline)' }}>
            {t('order_success_title')}
          </h1>
          <p className="text-muted-foreground mb-6">{t('order_success_message')}</p>
          {orderId && (
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">{t('order_success_number')}</p>
              <p className="font-bold text-accent" style={{ fontSize: 'var(--font-size-title)' }}>#{orderId}</p>
            </div>
          )}
          <Link to="/">
            <Button className="font-semibold cursor-pointer" style={{ height: 'var(--spacing-2xl)', paddingInline: 'var(--spacing-2xl)' }}>
              {t('order_success_continue')}
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
