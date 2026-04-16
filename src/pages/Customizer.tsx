import { useState, useEffect } from 'react';
import { FadeIn, Stagger } from '@/components/MotionPrimitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CUSTOMIZE_KEY = 'pata-pacha-customize';

interface CustomizeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  displayFont: string;
  borderRadius: string;
  heroHeight: string;
  cardGap: string;
}

const defaultConfig: CustomizeConfig = {
  primaryColor: '#1C1917',
  accentColor: '#CA8A04',
  backgroundColor: '#FAFAF9',
  fontFamily: 'Jost',
  displayFont: 'Bodoni Moda',
  borderRadius: '10px',
  heroHeight: '500px',
  cardGap: '1.5rem',
};

const FONT_OPTIONS = [
  { value: 'Jost', label: 'Jost (Modern)' },
  { value: 'Inter', label: 'Inter (Clean)' },
  { value: 'Nunito', label: 'Nunito (Friendly)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
];

const DISPLAY_FONT_OPTIONS = [
  { value: 'Bodoni Moda', label: 'Bodoni Moda (Luxury)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Cormorant Garamond', label: 'Cormorant (Classic)' },
  { value: 'DM Serif Display', label: 'DM Serif (Bold)' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville (Refined)' },
];

function loadConfig(): CustomizeConfig {
  try {
    const saved = localStorage.getItem(CUSTOMIZE_KEY);
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  } catch { return defaultConfig; }
}

function applyConfig(config: CustomizeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--primary', config.primaryColor);
  root.style.setProperty('--accent', config.accentColor);
  root.style.setProperty('--background', config.backgroundColor);
  root.style.setProperty('--font-family', `"${config.fontFamily}", sans-serif`);
  root.style.setProperty('--font-display', `"${config.displayFont}", serif`);
  root.style.setProperty('--radius', config.borderRadius);
  root.style.setProperty('--hero-height', config.heroHeight);
  root.style.setProperty('--card-gap', config.cardGap);
}

export default function Customizer() {
  const [config, setConfig] = useState<CustomizeConfig>(loadConfig);

  useEffect(() => { applyConfig(config); }, [config]);

  const updateField = (field: keyof CustomizeConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = () => {
    try { localStorage.setItem(CUSTOMIZE_KEY, JSON.stringify(config)); } catch {}
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    applyConfig(defaultConfig);
    try { localStorage.removeItem(CUSTOMIZE_KEY); } catch {}
  };

  const handleSave = () => {
    saveConfig();
  };

  const colorFields: { key: keyof CustomizeConfig; label: string }[] = [
    { key: 'primaryColor', label: 'Primary Color (Text & Navbar)' },
    { key: 'accentColor', label: 'Accent Color (Gold/CTA)' },
    { key: 'backgroundColor', label: 'Background Color' },
  ];

  const spacingFields: { key: keyof CustomizeConfig; label: string; placeholder: string }[] = [
    { key: 'borderRadius', label: 'Border Radius', placeholder: '10px' },
    { key: 'heroHeight', label: 'Hero Banner Height', placeholder: '500px' },
    { key: 'cardGap', label: 'Card Grid Gap', placeholder: '1.5rem' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8 max-w-3xl">
        <FadeIn>
          <h1 className="font-display font-bold mb-2" style={{ fontSize: 'var(--font-size-headline)' }}>
            Site Customizer
          </h1>
          <p className="text-muted-foreground mb-8">
            Customize the appearance of your store. Changes are previewed in real-time.
          </p>
        </FadeIn>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Stagger stagger={0.08}>
            {/* Colors */}
            <FadeIn>
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-title)' }}>Colors</h2>
                <div className="grid sm:grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                  {colorFields.map(field => (
                    <div key={field.key}>
                      <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                        <input
                          type="color"
                          value={config[field.key]}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="w-10 h-10 rounded border border-border cursor-pointer"
                        />
                        <Input
                          value={config[field.key]}
                          onChange={e => updateField(field.key, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Fonts */}
            <FadeIn>
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-title)' }}>Typography</h2>
                <div className="grid sm:grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Display Font (Headings)</label>
                    <select
                      value={config.displayFont}
                      onChange={e => updateField('displayFont', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {DISPLAY_FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <p className="mt-2 font-display text-lg" style={{ fontFamily: `"${config.displayFont}", serif` }}>
                      Preview: Pata Pacha
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Body Font</label>
                    <select
                      value={config.fontFamily}
                      onChange={e => updateField('fontFamily', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <p className="mt-2 text-sm" style={{ fontFamily: `"${config.fontFamily}", sans-serif` }}>
                      Preview: The quick brown fox jumps over the lazy dog.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Spacing & Layout */}
            <FadeIn>
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-title)' }}>Layout & Spacing</h2>
                <div className="grid sm:grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                  {spacingFields.map(field => (
                    <div key={field.key}>
                      <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                      <Input
                        value={config[field.key]}
                        onChange={e => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Favicon Preview */}
            <FadeIn>
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--font-size-title)' }}>Favicon & Branding</h2>
                <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
                    <span className="font-display font-bold text-accent" style={{ fontSize: '2rem' }}>P</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Favicon</p>
                    <p className="text-xs text-muted-foreground">The "P" logo is displayed in the browser tab. To change it, replace the file at <code className="bg-muted px-1 py-0.5 rounded text-xs">/public/favicon.svg</code>.</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Actions */}
            <FadeIn>
              <div className="flex" style={{ gap: 'var(--spacing-md)' }}>
                <Button type="submit" className="cursor-pointer font-semibold">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={resetConfig} className="cursor-pointer">
                  Reset to Default
                </Button>
              </div>
            </FadeIn>
          </Stagger>
        </form>
      </div>
    </div>
  );
}
