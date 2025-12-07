import { X } from 'lucide-react';
import { Ebook } from '../types/ebook';
import { useCart } from '../context/CartContext';

interface EbookModalProps {
  ebook: Ebook;
  onClose: () => void;
}

export default function EbookModal({ ebook, onClose }: EbookModalProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(ebook);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold text-slate-900">Ebook Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <img
                src={ebook.cover}
                alt={ebook.title}
                className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Cover';
                }}
              />
            </div>

            <div className="flex-1">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{ebook.title}</h3>
              <p className="text-lg text-slate-600 mb-4">by {ebook.author}</p>
              <div className="text-4xl font-bold text-slate-900 mb-6">
                ₹{ebook.price.toLocaleString('en-IN')}
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Synopsis</h4>
                <p className="text-slate-700 leading-relaxed">{ebook.synopsis}</p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 active:scale-95 transition-all duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


