import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartIcon() {
  const { items, setIsCartOpen } = useCart();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      title="Open Cart"
    >
      <ShoppingCart className="w-6 h-6 text-slate-700 hover:text-slate-900 transition-colors" />
      {items.length > 0 && (
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {items.length}
        </span>
      )}
    </button>
  );
}
