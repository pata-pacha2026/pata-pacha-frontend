import { useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { apiClient } from '@/lib/api-client';

const CART_KEY = 'pata-pacha-cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { saveCart(items); }, [items]);

  // Fetch product details for cart items
  useEffect(() => {
    if (items.length === 0) { setProducts({}); return; }
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ids = items.map(i => i.productId);
        const res = await apiClient.post('/products/list', { pageSize: 100 });
        const allProducts: Product[] = res.data?.data?.products || [];
        const map: Record<number, Product> = {};
        allProducts.forEach((p: Product) => { if (ids.includes(p.id)) map[p.id] = p; });
        setProducts(map);
      } catch {} finally { setLoading(false); }
    };
    fetchProducts();
  }, [items]);

  const addItem = useCallback((productId: number, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => { setItems([]); }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => {
    const p = products[i.productId];
    return sum + (p ? p.price * i.quantity : 0);
  }, 0);

  return { items, products, loading, totalItems, totalAmount, addItem, removeItem, updateQuantity, clearCart };
}
