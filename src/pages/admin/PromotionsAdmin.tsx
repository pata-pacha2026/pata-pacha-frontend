import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LANG_FIELDS = ['Zh', 'En', 'Es', 'Fr', 'De'] as const;
const LANG_LABELS: Record<string, string> = { Zh: '中文', En: 'English', Es: 'Espanol', Fr: 'Francais', De: 'Deutsch' };

interface PromoForm {
  titleZh: string; titleEn: string; titleEs: string; titleFr: string; titleDe: string;
  subtitleZh: string; subtitleEn: string; subtitleEs: string; subtitleFr: string; subtitleDe: string;
  type: string; discount: string; image: string; bgColor: string; isActive: boolean;
  startDate: string; endDate: string;
}

const emptyForm: PromoForm = {
  titleZh: '', titleEn: '', titleEs: '', titleFr: '', titleDe: '',
  subtitleZh: '', subtitleEn: '', subtitleEs: '', subtitleFr: '', subtitleDe: '',
  type: 'flash', discount: '0', image: '', bgColor: '#1C1917', isActive: true, startDate: '', endDate: '',
};

export default function PromotionsAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm);

  const { data } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => apiClient.post('/promotions/list', { admin: true }).then(r => r.data?.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: PromoForm) => apiClient.post('/promotions/create', { ...data, discount: Number(data.discount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promotions'] }); toast.success('Promotion created'); resetForm(); },
    onError: () => toast.error('Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PromoForm }) => apiClient.post('/promotions/update', { id, ...data, discount: Number(data.discount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promotions'] }); toast.success('Promotion updated'); resetForm(); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.post('/promotions/delete', { id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promotions'] }); toast.success('Deleted'); },
    onError: () => toast.error('Failed'),
  });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };
  const promotions = data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Promotions</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="cursor-pointer font-semibold">{showForm ? 'Cancel' : '+ Add Promotion'}</Button>
      </div>

      {showForm && (
        <form onSubmit={e => { e.preventDefault(); editingId ? updateMutation.mutate({ id: editingId, data: form }) : createMutation.mutate(form); }} className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">{editingId ? 'Edit' : 'New'} Promotion</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {LANG_FIELDS.map(lang => (
              <div key={`title${lang}`}>
                <label className="text-sm font-medium mb-1 block">Title ({LANG_LABELS[lang]}) {lang === 'En' && '*'}</label>
                <Input value={form[`title${lang}`]} onChange={e => setForm(p => ({ ...p, [`title${lang}`]: e.target.value }))} required={lang === 'En'} />
              </div>
            ))}
            {LANG_FIELDS.map(lang => (
              <div key={`subtitle${lang}`}>
                <label className="text-sm font-medium mb-1 block">Subtitle ({LANG_LABELS[lang]})</label>
                <Input value={form[`subtitle${lang}`]} onChange={e => setForm(p => ({ ...p, [`subtitle${lang}`]: e.target.value }))} />
              </div>
            ))}
            <div><label className="text-sm font-medium mb-1 block">Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="flash">Flash Sale</option><option value="bundle">Bundle</option><option value="seasonal">Seasonal</option></select></div>
            <div><label className="text-sm font-medium mb-1 block">Discount %</label><Input type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Start Date</label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">End Date</label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Image URL</label><Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Background Color</label><Input value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm mt-3"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} /> Active</label>
          <div className="flex gap-3 mt-4">
            <Button type="submit" className="cursor-pointer font-semibold">{editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">Cancel</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Title</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Type</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Discount</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Status</th>
            <th className="text-right text-xs font-semibold uppercase px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {promotions.map((promo: any) => (
              <tr key={promo.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium">{promo.titleEn}</td>
                <td className="px-4 py-3 text-sm">{promo.type}</td>
                <td className="px-4 py-3 text-sm">{promo.discount}%</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{promo.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(promo.id); setForm({ titleZh: promo.titleZh, titleEn: promo.titleEn, titleEs: promo.titleEs, titleFr: promo.titleFr, titleDe: promo.titleDe, subtitleZh: promo.subtitleZh, subtitleEn: promo.subtitleEn, subtitleEs: promo.subtitleEs, subtitleFr: promo.subtitleFr, subtitleDe: promo.subtitleDe, type: promo.type, discount: String(promo.discount), image: promo.image, bgColor: promo.bgColor, isActive: promo.isActive, startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '', endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '' }); setShowForm(true); }} className="cursor-pointer text-xs">Edit</Button>
                    <Button size="sm" variant="outline" className="cursor-pointer text-xs text-destructive" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(promo.id); }}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
