import React, { createContext, useContext, useEffect, useState } from 'react';
import { Ebook } from '../types/ebook';

export interface CartItem {
  ebook: Ebook;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (ebook: Ebook) => boolean; // returns true if added, false if limit reached
  removeFromCart: (ebookId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartFull: boolean;
  notification: string;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const MAX_ITEMS_PER_ORDER = 1; // Business rule: 1 item per checkout for instant processing

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (ebook: Ebook): boolean => {
    // Business rule: Only 1 item per checkout
    // Auto-clear existing items when adding a new one
    if (items.length > 0) {
      setItems([{ ebook }]);
      setNotification('Cart updated! We currently support one item per checkout for instant processing.');
      setTimeout(() => setNotification(''), 4000);
      return true;
    }
    
    setItems([{ ebook }]);
    return true;
  };

  const removeFromCart = (ebookId: string) => {
    setItems(items.filter(item => item.ebook.id !== ebookId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearNotification = () => {
    setNotification('');
  };

  const cartFull = items.length >= MAX_ITEMS_PER_ORDER;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, cartFull, notification, clearNotification }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
