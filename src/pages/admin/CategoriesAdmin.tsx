import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LANG_FIELDS = ['Zh', 'En', 'Es', 'Fr', 'De'] as const;
const LANG_LABELS: Record<string, string> = { Zh: '中文', En: 'English', Es: 'Espanol', Fr: 'Francais', De: 'Deutsch' };

interface CatForm {
  slug: string; nameZh: string; nameEn: string; nameEs: string; nameFr: string; nameDe: string;
  icon: string; image: string; sortOrder: string;
}

const emptyForm: CatForm = { slug: '', nameZh: '', nameEn: '', nameEs: '', nameFr: '', nameDe: '', icon: 'Tag', image: '', sortOrder: '0' };

export default function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm);

  const { data } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiClient.post('/categories/list', {}).then(r => r.data?.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CatForm) => apiClient.post('/categories/create', { ...data, sortOrder: Number(data.sortOrder) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category created'); resetForm(); },
    onError: () => toast.error('Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatForm }) => apiClient.post('/categories/update', { id, ...data, sortOrder: Number(data.sortOrder) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category updated'); resetForm(); },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.post('/categories/delete', { id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted'); },
    onError: () => toast.error('Failed'),
  });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };
  const categories = data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Categories</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="cursor-pointer font-semibold">{showForm ? 'Cancel' : '+ Add Category'}</Button>
      </div>

      {showForm && (
        <form onSubmit={e => { e.preventDefault(); editingId ? updateMutation.mutate({ id: editingId, data: form }) : createMutation.mutate(form); }} className="bg-white border border-border rounded-xl p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Slug *</label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required /></div>
            <div><label className="text-sm font-medium mb-1 block">Sort Order</label><Input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} /></div>
            {LANG_FIELDS.map(lang => (
              <div key={lang}><label className="text-sm font-medium mb-1 block">Name ({LANG_LABELS[lang]}) {lang === 'En' && '*'}</label><Input value={form[`name${lang}`]} onChange={e => setForm(p => ({ ...p, [`name${lang}`]: e.target.value }))} required={lang === 'En'} /></div>
            ))}
            <div><label className="text-sm font-medium mb-1 block">Icon</label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Image URL</label><Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" className="cursor-pointer font-semibold">{editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">Cancel</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Slug</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Name</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Icon</th>
            <th className="text-left text-xs font-semibold uppercase px-4 py-3">Order</th>
            <th className="text-right text-xs font-semibold uppercase px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>
            {categories.map((cat: any) => (
              <tr key={cat.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-sm font-medium">{cat.nameEn}</td>
                <td className="px-4 py-3 text-sm">{cat.icon}</td>
                <td className="px-4 py-3 text-sm">{cat.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(cat.id); setForm({ slug: cat.slug, nameZh: cat.nameZh, nameEn: cat.nameEn, nameEs: cat.nameEs, nameFr: cat.nameFr, nameDe: cat.nameDe, icon: cat.icon, image: cat.image, sortOrder: String(cat.sortOrder) }); setShowForm(true); }} className="cursor-pointer text-xs">Edit</Button>
                    <Button size="sm" variant="outline" className="cursor-pointer text-xs text-destructive" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(cat.id); }}>Delete</Button>
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
