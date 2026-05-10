import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutFlow from './CheckoutFlow';

export default function CartPanel() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, clearCart, notification, clearNotification } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const getTotalPrice = () => {
    // Safety: handle undefined/null prices and empty cart
    return items.reduce((total, item) => {
      const price = item.ebook?.price || 0;
      return total + price;
    }, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckingOut(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckingOut(false);
  };

  const handlePaymentSuccess = () => {
    // Close both checkout modal and cart panel on payment success
    setIsCheckingOut(false);
    setIsCartOpen(false);
  };

  return (
    <>
      {isCheckingOut && items.length > 0 && (
        <CheckoutFlow items={items} onClose={handleCloseCheckout} onPaymentSuccess={handlePaymentSuccess} />
      )}

      <div
        data-noprint
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[60] ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div
        data-noprint
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-[61] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Notification */}
        {notification && (
          <div className="absolute top-20 left-4 right-4 z-10 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-blue-800 font-medium">{notification}</p>
              <button
                onClick={clearNotification}
                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-slate-900" />
            <h2 className="text-2xl font-bold text-slate-900">Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                  <div className="flex gap-4">
                    <img
                      src={item.ebook.coverImage || item.ebook.cover}
                      alt={item.ebook.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
                        {item.ebook.title}
                      </h3>
                      <p className="text-slate-600 text-xs mt-1">by {item.ebook.author}</p>
                      <p className="text-slate-600 text-sm mt-1">
                        ₹{item.ebook.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.ebook.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Subtotal ({items.length} items)</span>
              <span className="text-2xl font-bold text-slate-900">
                ₹{getTotalPrice().toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 active:scale-95 transition-all duration-300"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => clearCart()}
              className="w-full py-3 bg-slate-100 text-slate-900 font-semibold rounded-full hover:bg-slate-200 transition-all duration-300"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
