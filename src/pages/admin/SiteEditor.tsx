import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SiteEditor() {
  const queryClient = useQueryClient();

  const { data: siteConfig } = useQuery({
    queryKey: ['site-config'],
    queryFn: () => apiClient.post('/site-config/get', {}).then(r => r.data?.data),
  });

  const upsertMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => apiClient.post('/site-config/upsert', { key, value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-config'] }); toast.success('Site config updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const heroSlides: any[] = siteConfig?.hero_slides || [];
  const homepageSections: any[] = siteConfig?.homepage_sections || [];

  const updateHeroSlide = (index: number, field: string, value: string) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    upsertMutation.mutate({ key: 'hero_slides', value: updated });
  };

  const addHeroSlide = () => {
    const updated = [...heroSlides, { image: '', titleKey: `hero_title_${heroSlides.length + 1}`, subtitleKey: `hero_subtitle_${heroSlides.length + 1}`, ctaKey: `hero_cta_${heroSlides.length + 1}` }];
    upsertMutation.mutate({ key: 'hero_slides', value: updated });
  };

  const removeHeroSlide = (index: number) => {
    const updated = heroSlides.filter((_: any, i: number) => i !== index);
    upsertMutation.mutate({ key: 'hero_slides', value: updated });
  };

  const toggleSection = (index: number) => {
    const updated = [...homepageSections];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    upsertMutation.mutate({ key: 'homepage_sections', value: updated });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= homepageSections.length) return;
    const updated = [...homepageSections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((s: any, i: number) => s.order = i + 1);
    upsertMutation.mutate({ key: 'homepage_sections', value: updated });
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Site Editor</h1>

      {/* Hero Slides */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Hero Carousel</h2>
          <Button onClick={addHeroSlide} size="sm" className="cursor-pointer">+ Add Slide</Button>
        </div>
        <div className="space-y-4">
          {heroSlides.map((slide: any, i: number) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Slide {i + 1}</span>
                {heroSlides.length > 1 && (
                  <Button size="sm" variant="outline" onClick={() => removeHeroSlide(i)} className="cursor-pointer text-destructive text-xs">Remove</Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium mb-1 block">Image URL</label><Input value={slide.image || ''} onChange={e => updateHeroSlide(i, 'image', e.target.value)} placeholder="/hero-fiesta.jpg or full URL" /></div>
                <div><label className="text-xs font-medium mb-1 block">Title Key</label><Input value={slide.titleKey || ''} onChange={e => updateHeroSlide(i, 'titleKey', e.target.value)} /></div>
                <div><label className="text-xs font-medium mb-1 block">Subtitle Key</label><Input value={slide.subtitleKey || ''} onChange={e => updateHeroSlide(i, 'subtitleKey', e.target.value)} /></div>
                <div><label className="text-xs font-medium mb-1 block">CTA Key</label><Input value={slide.ctaKey || ''} onChange={e => updateHeroSlide(i, 'ctaKey', e.target.value)} /></div>
              </div>
              {slide.image && (
                <div className="mt-2 w-full h-24 rounded-lg overflow-hidden bg-muted">
                  <img src={slide.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Homepage Sections */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Homepage Sections</h2>
        <div className="space-y-2">
          {homepageSections.map((section: any, i: number) => (
            <div key={section.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSection(i)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${section.visible ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${section.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-medium capitalize">{section.id.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={i === 0} onClick={() => moveSection(i, 'up')} className="cursor-pointer text-xs">Up</Button>
                <Button size="sm" variant="outline" disabled={i === homepageSections.length - 1} onClick={() => moveSection(i, 'down')} className="cursor-pointer text-xs">Down</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
