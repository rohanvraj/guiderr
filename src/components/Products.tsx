import { ShoppingCart, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { getCategories } from '../utils/ebooks';
import { Ebook } from '../types/ebook';
import EbookModal from './EbookModal';

interface DisplayProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  // Keep the original Product so we can build an Ebook object for the modal/cart
  _source: Product;
}

/** Convert a Supabase Product into the Ebook shape the cart & modal expect */
function toEbook(p: Product): Ebook {
  return {
    id: p.id,
    title: p.name,
    author: p.author || 'Guiderr',
    price: p.price_in_rupees,
    cover: p.cover_image_url || '/covers/placeholder.svg',
    coverImage: p.cover_image_url,
    pdf: p.delivery_link,
    category: p.category || '',
    synopsis: p.name,
    downloadLink: p.delivery_link,
  };
}

function ProductCard({ product, index }: { product: DisplayProduct; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className={`group cursor-pointer bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
          isVisible && imageLoaded ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: isVisible && imageLoaded ? `${index * 100}ms` : '0ms' }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-56 sm:h-64 overflow-hidden">
          <img
            src={optimizeCloudinaryUrl(product.image, { width: 400 })}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
              setImageLoaded(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
            {product.title}
          </h3>

          <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <span className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Buy Now</span>
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EbookModal ebook={toEbook(product._source)} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

function ProductSection({
  id,
  title,
  products,
}: {
  id: string;
  title: string;
  products: DisplayProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section id={id} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 sm:mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Products() {
  const categories = getCategories();

  // Same queryKey as Hero.tsx — React Query deduplicates: homepage makes 1 API call, not 2.
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  const productsByCategory: Record<string, DisplayProduct[]> = {};
  for (const p of allProducts) {
    const catKey = (p.category || 'other').toLowerCase();
    if (!productsByCategory[catKey]) productsByCategory[catKey] = [];
    productsByCategory[catKey].push({
      id: p.id,
      title: p.name,
      description: p.name,
      price: p.price_in_rupees,
      image: p.cover_image_url || '/covers/placeholder.svg',
      _source: p,
    });
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-white to-slate-50 py-20 text-center">
        <div className="animate-pulse text-slate-400 text-lg">Loading products...</div>
      </div>
    );
  }

  const hasProducts = Object.values(productsByCategory).some((arr) => arr.length > 0);

  if (!hasProducts) {
    return (
      <div className="bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Coming Soon</h2>
          <p className="text-lg text-slate-600">
            We're preparing an amazing collection of digital guides. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50">
      {categories.map((cat) => {
        const catProducts = productsByCategory[cat.id] || [];
        return (
          <ProductSection
            key={cat.id}
            id={cat.id}
            title={cat.name}
            products={catProducts}
          />
        );
      })}
    </div>
  );
}
