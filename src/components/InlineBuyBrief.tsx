import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { getProductById, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import EbookModal from './EbookModal';
import { Ebook } from '../types/ebook';

function toEbook(p: Product): Ebook {
  return {
    id: p.id,
    title: p.name,
    author: p.author || 'Guiderr',
    price: p.price_in_rupees,
    cover: p.cover_image_url || '/covers/placeholder.svg',
    coverImage: p.cover_image_url,
    pdf: '',
    category: p.category || '',
    synopsis: p.description || p.name,
  };
}

interface InlineBuyBriefProps {
  productId: string;
  label?: string;
}

export default function InlineBuyBrief({ productId, label }: InlineBuyBriefProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getProductById(productId)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Loading skeleton
  if (loading) {
    return (
      <span className="not-prose my-8 flex items-center gap-3 rounded-2xl border border-white/20 bg-[#7178AB]/20 backdrop-blur-md px-5 py-4 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#7178AB]" />
        <span className="text-sm font-medium">Loading report…</span>
      </span>
    );
  }

  // Silent fail — don't break article layout
  if (error || !product) {
    return (
      <span className="not-prose my-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">Report unavailable.</span>
      </span>
    );
  }

  const ebook = toEbook(product);

  return (
    <>
      {/* Purchase Card */}
      <span
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
        className="not-prose group my-8 flex items-center gap-4 rounded-2xl border border-white/20 bg-[#7178AB]/15 backdrop-blur-md p-4 cursor-pointer hover:bg-[#7178AB]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg select-none"
        aria-label={`Buy ${product.name}`}
      >
        {/* Cover thumbnail — visible on all screen sizes, forced block */}
        {product.cover_image_url && (
          <img
            src={optimizeCloudinaryUrl(product.cover_image_url, { width: 120 })}
            alt={product.name}
            style={{ display: 'block' }}
            className="w-10 h-14 sm:w-14 sm:h-20 object-cover rounded-lg shadow-md shrink-0 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Text block */}
        <span className="flex-1 min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7178AB] mb-0.5">
            Intelligence Brief
          </span>
          <span className="block text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#7178AB] transition-colors duration-300">
            {label || product.name}
          </span>
          {product.author && (
            <span className="block text-xs text-slate-500 mt-0.5">
              by {product.author}
            </span>
          )}
        </span>

        {/* Price + CTA */}
        <span className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-base font-extrabold text-slate-900">
            ₹{product.price_in_rupees.toLocaleString('en-IN')}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 group-hover:bg-[#7178AB] transition-colors duration-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            Buy Report
          </span>
        </span>
      </span>

      {/* EbookModal — portalled to <body> so it escapes any parent CSS scope */}
      {modalOpen && createPortal(
        <EbookModal
          ebook={ebook}
          onClose={() => setModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
