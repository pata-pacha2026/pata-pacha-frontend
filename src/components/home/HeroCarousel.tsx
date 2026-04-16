import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { FadeIn } from '@/components/MotionPrimitives';

const HERO_SLIDES = [
  {
    gradient: 'from-pink-400 via-orange-300 to-yellow-300',
    image: '/hero-fiesta.jpg',
    titleKey: 'hero_title_1',
    subtitleKey: 'hero_subtitle_1',
    ctaKey: 'hero_cta_1',
    emoji: '🎉',
    bgPattern: 'radial-gradient(circle at 20% 80%, oklch(0.82 0.18 90 / 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.65 0.18 240 / 0.15) 0%, transparent 50%)',
    imageOpacity: 0.45,
    overlayIntensity: 'light',
  },
  {
    gradient: 'from-yellow-300 via-pink-400 to-purple-400',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop',
    titleKey: 'hero_title_2',
    subtitleKey: 'hero_subtitle_2',
    ctaKey: 'hero_cta_2',
    emoji: '✨',
    bgPattern: 'radial-gradient(circle at 70% 70%, oklch(0.75 0.18 350 / 0.15) 0%, transparent 50%), radial-gradient(circle at 30% 30%, oklch(0.82 0.18 90 / 0.15) 0%, transparent 50%)',
  },
  {
    gradient: 'from-sky-400 via-purple-400 to-pink-400',
    image: 'https://images.unsplash.com/photo-1450778869180-e12d8520f945?w=1200&h=600&fit=crop',
    titleKey: 'hero_title_3',
    subtitleKey: 'hero_subtitle_3',
    ctaKey: 'hero_cta_3',
    emoji: '🎉',
    bgPattern: 'radial-gradient(circle at 50% 50%, oklch(0.68 0.16 155 / 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 10%, oklch(0.62 0.22 300 / 0.15) 0%, transparent 50%)',
  },
];

export default function HeroCarousel() {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: slide.imageOpacity || 0.25 }}
        />
        {slide.overlayIntensity === 'light' ? (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, oklch(0.95 0.05 350 / 0.5) 0%, oklch(0.93 0.06 80 / 0.4) 50%, oklch(0.94 0.05 240 / 0.5) 100%)',
          }} />
        ) : (
          <div className="hero-overlay absolute inset-0" />
        )}
        <div className="absolute inset-0" style={{ background: slide.bgPattern }} />
      </div>

      {/* Floating decorative blobs */}
      <div className="absolute top-10 right-10 w-32 h-32 blob-decoration opacity-20" style={{ background: 'oklch(0.82 0.18 90 / 0.3)' }} />
      <div className="absolute bottom-20 left-10 w-24 h-24 blob-decoration opacity-20" style={{ background: 'oklch(0.65 0.18 240 / 0.3)', animationDelay: '-3s' }} />

      {/* Content */}
      <div className="relative container flex items-center" style={{ minHeight: '520px', paddingBlock: 'var(--spacing-3xl)' }}>
        <FadeIn key={current} duration={0.6}>
          <div className="max-w-2xl text-hero-foreground">
            <span className="inline-block text-5xl mb-3" style={{ animation: 'cute-bounce 2s ease infinite' }}>
              {slide.emoji}
            </span>
            <h1 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: 'var(--font-size-display)' }}>
              {t(slide.titleKey)}
            </h1>
            <p className="text-lg opacity-90 mb-8 leading-relaxed max-w-lg" style={{ fontSize: 'var(--font-size-body)' }}>
              {t(slide.subtitleKey)}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full font-bold no-underline cursor-pointer transition-all hover:scale-105"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-xl)',
                fontSize: 'var(--font-size-body)',
                background: 'oklch(0.82 0.18 90)',
                color: 'oklch(0.25 0.08 80)',
                boxShadow: '0 4px 20px oklch(0.82 0.18 90 / 0.4)',
              }}
            >
              {t(slide.ctaKey)}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white cursor-pointer transition-all"
        aria-label="Previous"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center text-white cursor-pointer transition-all"
        aria-label="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`carousel-dot cursor-pointer ${i === current ? 'active' : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
