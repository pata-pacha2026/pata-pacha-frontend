import { createContext, useContext, ReactNode } from 'react';
import { useCart } from './use-cart';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  products: Record<number, Product>;
  loading: boolean;
  totalItems: number;
  totalAmount: number;
  addItem: (productId: number, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}

// Re-export useCart for convenience
export { useCart };
