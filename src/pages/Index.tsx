import HeroCarousel from '@/components/home/HeroCarousel';
import CategorySection from '@/components/home/CategorySection';
import HotProducts from '@/components/home/HotProducts';
import PromotionSection from '@/components/home/PromotionSection';
import { FadeIn } from '@/components/MotionPrimitives';

export default function Index() {
  return (
    <div>
      <HeroCarousel />
      <CategorySection />
      <HotProducts />
      <PromotionSection />

      {/* Brand Story Banner — Cute Dopamine */}
      <FadeIn>
        <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.95 0.06 350 / 0.3), oklch(0.95 0.06 300 / 0.2), oklch(0.95 0.06 240 / 0.2))' }}>
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-[10%] w-16 h-16 rounded-full opacity-20" style={{ background: 'oklch(0.75 0.18 350)', animation: 'cute-bounce 3s ease infinite' }} />
          <div className="absolute bottom-10 right-[15%] w-20 h-20 rounded-full opacity-15" style={{ background: 'oklch(0.82 0.18 90)', animation: 'cute-bounce 4s ease infinite', animationDelay: '-1s' }} />
          <div className="absolute top-1/2 left-[60%] w-12 h-12 rounded-full opacity-15" style={{ background: 'oklch(0.68 0.16 155)', animation: 'cute-bounce 3.5s ease infinite', animationDelay: '-2s' }} />

          <div className="container text-center relative z-10">
            <span className="text-5xl mb-6 inline-block" style={{ animation: 'cute-bounce 2s ease infinite' }}>🐾</span>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'var(--font-size-headline)' }}>
              Pata Pacha
            </h2>
            <div className="rainbow-underline w-16 mx-auto mb-6" />
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed" style={{ fontSize: 'var(--font-size-body)' }}>
              We believe every pet deserves the finest. Our curators travel the globe to handpick premium accessories
              that blend style, comfort, and quality — because your furry companion is family. 🐶🐱💛
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
