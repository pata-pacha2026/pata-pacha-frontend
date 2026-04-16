import { useState } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CATEGORIES = ['toys', 'beds', 'carriers', 'grooming', 'collars', 'clothing'];
const LANG_FIELDS = ['Zh', 'En', 'Es', 'Fr', 'De'] as const;
const LANG_LABELS: Record<string, string> = { Zh: '中文', En: 'English', Es: 'Espanol', Fr: 'Francais', De: 'Deutsch' };

interface ProductForm {
  nameZh: string; nameEn: string; nameEs: string; nameFr: string; nameDe: string;
  descZh: string; descEn: string; descEs: string; descFr: string; descDe: string;
  price: string; originalPrice: string; images: string; category: string;
  rating: string; stock: string; isHot: boolean; isNew: boolean; isPublished: boolean;
}

const emptyForm: ProductForm = {
  nameZh: '', nameEn: '', nameEs: '', nameFr: '', nameDe: '',
  descZh: '', descEn: '', descEs: '', descFr: '', descDe: '',
  price: '', originalPrice: '', images: '', category: 'toys',
  rating: '4.5', stock: '100', isHot: false, isNew: true, isPublished: true,
};

function productToForm(p: any): ProductForm {
  return {
    nameZh: p.nameZh, nameEn: p.nameEn, nameEs: p.nameEs, nameFr: p.nameFr, nameDe: p.nameDe,
    descZh: p.descZh, descEn: p.descEn, descEs: p.descEs, descFr: p.descFr, descDe: p.descDe,
    price: String(p.price), originalPrice: String(p.originalPrice || ''),
    images: p.images.join(', '), category: p.category,
    rating: String(p.rating), stock: String(p.stock),
    isHot: p.isHot, isNew: p.isNew, isPublished: p.isPublished ?? true,
  };
}

export default function ProductsAdmin() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<'name' | 'desc'>('name');

  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.post('/products/list', { admin: true, pageSize: 100, sort: 'newest' });
      return res.data?.data as { products: any[]; total: number };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      return apiClient.post('/products/create', {
        ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        images: data.images.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(data.rating), stock: Number(data.stock),
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product created'); resetForm(); },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      return apiClient.post('/products/update', {
        id, ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        images: data.images.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(data.rating), stock: Number(data.stock),
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated'); resetForm(); },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.post('/products/delete', { id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      return apiClient.post('/products/update', { id, isPublished });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setActiveTab('name'); };
  const handleEdit = (product: any) => { setEditingId(product.id); setForm(productToForm(product)); setShowForm(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate({ id: editingId, data: form });
    else createMutation.mutate(form);
  };
  const updateField = (field: keyof ProductForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const products = data?.products || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Products</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="cursor-pointer font-semibold">
          {showForm ? 'Cancel' : '+ Add Product'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>

          <div className="mb-4">
            <div className="flex border-b border-border mb-3">
              <button type="button" onClick={() => setActiveTab('name')} className={`px-4 py-2 text-sm cursor-pointer ${activeTab === 'name' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}>Name</button>
              <button type="button" onClick={() => setActiveTab('desc')} className={`px-4 py-2 text-sm cursor-pointer ${activeTab === 'desc' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}>Description</button>
            </div>
            {activeTab === 'name' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {LANG_FIELDS.map(lang => (
                  <div key={`name${lang}`}>
                    <label className="text-sm font-medium mb-1 block">Name ({LANG_LABELS[lang]}) {lang === 'En' && '*'}</label>
                    <Input value={form[`name${lang}`]} onChange={e => updateField(`name${lang}` as keyof ProductForm, e.target.value)} required={lang === 'En'} />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'desc' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {LANG_FIELDS.map(lang => (
                  <div key={`desc${lang}`}>
                    <label className="text-sm font-medium mb-1 block">Description ({LANG_LABELS[lang]})</label>
                    <textarea value={form[`desc${lang}`]} onChange={e => updateField(`desc${lang}` as keyof ProductForm, e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Price (CNY) *</label><Input type="number" step="0.01" value={form.price} onChange={e => updateField('price', e.target.value)} required /></div>
            <div><label className="text-sm font-medium mb-1 block">Original Price</label><Input type="number" step="0.01" value={form.originalPrice} onChange={e => updateField('originalPrice', e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Category</label><select value={form.category} onChange={e => updateField('category', e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1 block">Stock</label><Input type="number" value={form.stock} onChange={e => updateField('stock', e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Rating</label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => updateField('rating', e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Image URLs</label><Input value={form.images} onChange={e => updateField('images', e.target.value)} placeholder="Comma separated" /></div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isHot} onChange={e => updateField('isHot', e.target.checked)} /> Hot</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isNew} onChange={e => updateField('isNew', e.target.checked)} /> New</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isPublished} onChange={e => updateField('isPublished', e.target.checked)} /> Published</label>
          </div>

          <div className="flex gap-3 mt-5">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer font-semibold">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">Cancel</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold uppercase px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold uppercase px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold uppercase px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold uppercase px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <span className="text-sm font-medium truncate max-w-[200px]">{getLocalizedName(product, locale as Locale)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(product.price, locale as Locale)}</td>
                  <td className="px-4 py-3 text-sm">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish.mutate({ id: product.id, isPublished: !product.isPublished })}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                        product.isPublished
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {product.isPublished ? 'On Shelf' : 'Off Shelf'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="cursor-pointer text-xs">Edit</Button>
                      <Button size="sm" variant="outline" className="cursor-pointer text-xs text-destructive hover:bg-destructive/10" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(product.id); }}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No products</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
