import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';
import { useCartContext } from '@/hooks/use-cart-context';
import { LOCALE_LABELS, LOCALES } from '@/i18n/types';
import { FadeIn, HoverLift } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HeaderProps {
  onCartOpen: () => void;
}

export default function Header({ onCartOpen }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const { totalItems } = useCartContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav_home') },
    { path: '/products', label: t('nav_products') },
    { path: '/admin', label: 'Admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <FadeIn duration={0.4}>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b-2 border-primary/10" style={{ boxShadow: '0 2px 20px oklch(0.75 0.18 350 / 0.06)' }}>
        <div className="container flex items-center justify-between" style={{ height: 'var(--spacing-3xl)' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, oklch(0.82 0.18 90 / 0.2), oklch(0.75 0.18 350 / 0.2))' }}>
              <img src="/logo-dog.png" alt="Pata Pacha" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-display font-bold tracking-tight text-primary group-hover:opacity-80 transition-opacity" style={{ fontSize: '1.4rem' }}>
              Pata Pacha
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold no-underline transition-all cursor-pointer rounded-full px-4 py-1.5 ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            {/* Language Switcher */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium cursor-pointer rounded-full hover:bg-primary/10">
                  🌐 {LOCALE_LABELS[locale]}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1 rounded-xl">
                {LOCALES.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer transition-all font-medium ${
                      locale === loc ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                    }`}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Cart */}
            <HoverLift>
              <Button variant="ghost" size="icon" onClick={onCartOpen} className="relative cursor-pointer rounded-full hover:bg-primary/10" style={{ width: '40px', height: '40px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1" style={{ animation: 'cute-bounce 0.4s ease' }}>
                    {totalItems}
                  </span>
                )}
              </Button>
            </HoverLift>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden cursor-pointer rounded-full hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/10 bg-white/95 backdrop-blur-lg">
            <div className="container py-3 flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold no-underline cursor-pointer transition-all ${
                    isActive(link.path) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-primary/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </FadeIn>
  );
}
