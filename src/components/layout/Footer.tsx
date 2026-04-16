import { useI18n } from '@/hooks/use-i18n';
import { FadeIn, Stagger } from '@/components/MotionPrimitives';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-auto overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.65 0.20 330), oklch(0.55 0.22 300), oklch(0.50 0.18 240))' }}>
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-4" style={{ background: 'linear-gradient(90deg, oklch(0.75 0.18 350), oklch(0.82 0.18 90), oklch(0.68 0.16 155), oklch(0.65 0.18 240))' }} />

      <div className="container py-16 text-white">
        <Stagger stagger={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--spacing-2xl)' }}>
            {/* Brand */}
            <FadeIn>
              <div>
                <div className="flex items-center mb-4" style={{ gap: 'var(--spacing-sm)' }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                    <img src="/logo-dog.png" alt="Pata Pacha" className="w-full h-full object-contain p-0.5" />
                  </div>
                  <span className="font-display font-bold" style={{ fontSize: 'var(--font-size-title)' }}>Pata Pacha</span>
                </div>
                <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                  {t('footer_about_text')}
                </p>
              </div>
            </FadeIn>

            {/* Quick Links */}
            <FadeIn>
              <div>
                <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider opacity-70">{t('footer_help')}</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity no-underline text-inherit cursor-pointer">{t('footer_shipping_policy')}</a></li>
                  <li><a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity no-underline text-inherit cursor-pointer">{t('footer_return_policy')}</a></li>
                  <li><a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity no-underline text-inherit cursor-pointer">{t('footer_contact')}</a></li>
                </ul>
              </div>
            </FadeIn>

            {/* Contact */}
            <FadeIn>
              <div>
                <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider opacity-70">{t('footer_contact')}</h4>
                <ul className="space-y-3 text-sm opacity-80">
                  <li>🐾 hello@patapacha.com</li>
                  <li>📱 +86 400-888-8888</li>
                  <li>📍 Shanghai, China</li>
                </ul>
              </div>
            </FadeIn>

            {/* Social */}
            <FadeIn>
              <div>
                <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider opacity-70">{t('footer_follow')}</h4>
                <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
                  {[
                    { name: 'IG', color: 'oklch(0.75 0.18 350)' },
                    { name: 'WX', color: 'oklch(0.68 0.16 155)' },
                    { name: 'TT', color: 'oklch(0.65 0.18 240)' },
                  ].map(social => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform no-underline text-white cursor-pointer"
                      style={{ background: 'oklch(1 0 0 / 0.2)', backdropFilter: 'blur(4px)' }}
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid oklch(1 0 0 / 0.15)' }}>
            <p className="text-sm opacity-50">
              © 2024 Pata Pacha. {t('footer_rights')}. Made with 🐾 & 💛
            </p>
          </div>
        </Stagger>
      </div>
    </footer>
  );
}
