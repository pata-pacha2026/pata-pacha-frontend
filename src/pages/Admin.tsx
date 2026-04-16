import { useState } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Product, Locale } from '@/types';
import { getLocalizedName, formatPrice } from '@/lib/product-utils';
import { FadeIn } from '@/components/MotionPrimitives';
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
  rating: string; stock: string; isHot: boolean; isNew: boolean;
}

const emptyForm: ProductForm = {
  nameZh: '', nameEn: '', nameEs: '', nameFr: '', nameDe: '',
  descZh: '', descEn: '', descEs: '', descFr: '', descDe: '',
  price: '', originalPrice: '', images: '', category: 'toys',
  rating: '4.5', stock: '100', isHot: false, isNew: true,
};

function productToForm(p: Product): ProductForm {
  return {
    nameZh: p.nameZh, nameEn: p.nameEn, nameEs: p.nameEs, nameFr: p.nameFr, nameDe: p.nameDe,
    descZh: p.descZh, descEn: p.descEn, descEs: p.descEs, descFr: p.descFr, descDe: p.descDe,
    price: String(p.price), originalPrice: String(p.originalPrice || ''),
    images: p.images.join(', '), category: p.category,
    rating: String(p.rating), stock: String(p.stock), isHot: p.isHot, isNew: p.isNew,
  };
}

export default function Admin() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<'name' | 'desc'>('name');

  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.post('/products/list', { pageSize: 100, sort: 'newest' });
      return res.data?.data as { products: Product[]; total: number };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = {
        ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        images: data.images.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(data.rating),
        stock: Number(data.stock),
      };
      return apiClient.post('/products/create', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      resetForm();
    },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      const payload: any = {
        id,
        ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        images: data.images.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(data.rating),
        stock: Number(data.stock),
      };
      return apiClient.post('/products/update', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.post('/products/delete', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab('name');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(productToForm(product));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const updateField = (field: keyof ProductForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const products = data?.products || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display font-bold" style={{ fontSize: 'var(--font-size-headline)' }}>
              Product Management
            </h1>
            <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="cursor-pointer font-semibold">
              {showForm ? 'Cancel' : '+ Add Product'}
            </Button>
          </div>
        </FadeIn>

        {/* Form */}
        {showForm && (
          <FadeIn>
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-8">
              <h2 className="font-semibold mb-6" style={{ fontSize: 'var(--font-size-title)' }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>

              {/* Multilingual Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-border mb-4" style={{ gap: 'var(--spacing-xs)' }}>
                  <button type="button" onClick={() => setActiveTab('name')} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${activeTab === 'name' ? 'border-b-2 border-accent text-accent font-medium' : 'text-muted-foreground'}`}>
                    Product Name
                  </button>
                  <button type="button" onClick={() => setActiveTab('desc')} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${activeTab === 'desc' ? 'border-b-2 border-accent text-accent font-medium' : 'text-muted-foreground'}`}>
                    Description
                  </button>
                </div>

                {activeTab === 'name' && (
                  <div className="grid sm:grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                    {LANG_FIELDS.map(lang => (
                      <div key={`name${lang}`}>
                        <label className="text-sm font-medium mb-1.5 block">
                          Name ({LANG_LABELS[lang]}) {lang === 'En' && <span className="text-destructive">*</span>}
                        </label>
                        <Input
                          value={form[`name${lang}`]}
                          onChange={e => updateField(`name${lang}` as keyof ProductForm, e.target.value)}
                          required={lang === 'En'}
                          placeholder={lang === 'En' ? 'Required' : `Auto-fill from English if empty`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'desc' && (
                  <div className="grid sm:grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                    {LANG_FIELDS.map(lang => (
                      <div key={`desc${lang}`}>
                        <label className="text-sm font-medium mb-1.5 block">Description ({LANG_LABELS[lang]})</label>
                        <textarea
                          value={form[`desc${lang}`]}
                          onChange={e => updateField(`desc${lang}` as keyof ProductForm, e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Fields */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Price * <span className="text-xs text-muted-foreground">(CNY)</span></label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => updateField('price', e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Original Price</label>
                  <Input type="number" step="0.01" value={form.originalPrice} onChange={e => updateField('originalPrice', e.target.value)} placeholder="Leave empty if no discount" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={e => updateField('category', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Stock</label>
                  <Input type="number" value={form.stock} onChange={e => updateField('stock', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Rating</label>
                  <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => updateField('rating', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Image URLs</label>
                  <Input value={form.images} onChange={e => updateField('images', e.target.value)} placeholder="Comma separated URLs" />
                </div>
              </div>

              <div className="flex items-center mt-4" style={{ gap: 'var(--spacing-lg)' }}>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isHot} onChange={e => updateField('isHot', e.target.checked)} className="rounded" />
                  Hot Product
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isNew} onChange={e => updateField('isNew', e.target.checked)} className="rounded" />
                  New Arrival
                </label>
              </div>

              <div className="flex mt-6" style={{ gap: 'var(--spacing-md)' }}>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer font-semibold">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">Cancel</Button>
              </div>
            </form>
          </FadeIn>
        )}

        {/* Product Table */}
        <FadeIn delay={0.1}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3">Product</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3">Price</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3">Stock</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3">Tags</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                            <img
                              src={product.images[0] || ''}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {getLocalizedName(product, locale as Locale)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium">{formatPrice(product.price, locale as Locale)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(product.originalPrice, locale as Locale)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{product.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex" style={{ gap: 'var(--spacing-xs)' }}>
                          {product.isHot && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">HOT</span>}
                          {product.isNew && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">NEW</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end" style={{ gap: 'var(--spacing-xs)' }}>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="cursor-pointer text-xs">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product.id); }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No products yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
