import { ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const products = {
  motorcycles: [
    {
      id: 1,
      title: 'Complete Beginner\'s Guide to Motorcycling',
      description: 'Everything you need to know to start your riding journey safely and confidently',
      price: 1999,
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 2,
      title: 'Advanced Riding Techniques',
      description: 'Master cornering, braking, and control for experienced riders',
      price: 2499,
      image: 'https://images.pexels.com/photos/3612932/pexels-photo-3612932.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 3,
      title: 'Motorcycle Maintenance Mastery',
      description: 'Keep your bike running smoothly with DIY maintenance and repair',
      price: 2199,
      image: 'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ],
  finance: [
    {
      id: 4,
      title: 'Investing for Beginners',
      description: 'Build a solid foundation in stocks, bonds, and portfolio management',
      price: 2999,
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 5,
      title: 'Financial Freedom Blueprint',
      description: 'Create multiple income streams and achieve early retirement',
      price: 3299,
      image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 6,
      title: 'Crypto & Digital Assets Guide',
      description: 'Navigate the world of cryptocurrency and blockchain technology',
      price: 2699,
      image: 'https://images.pexels.com/photos/8369770/pexels-photo-8369770.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ],
  travel: [
    {
      id: 7,
      title: 'Solo Travel Essentials',
      description: 'Travel the world alone with confidence, safety, and insider tips',
      price: 1899,
      image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 8,
      title: 'Budget Travel Hacks',
      description: 'See the world without breaking the bank with proven strategies',
      price: 1699,
      image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 9,
      title: 'Digital Nomad Handbook',
      description: 'Work remotely while traveling the globe - complete lifestyle guide',
      price: 3599,
      image: 'https://images.pexels.com/photos/7241426/pexels-photo-7241426.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ],
};

function ProductCard({ product, index }: { product: typeof products.motorcycles[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
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
    <div
      ref={cardRef}
      className={`group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: isVisible ? `${index * 100}ms` : '0ms' }}
    >
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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

          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSection({
  id,
  title,
  products
}: {
  id: string;
  title: string;
  products: typeof products.motorcycles
}) {
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
  return (
    <div className="bg-gradient-to-b from-white to-slate-50">
      <ProductSection id="motorcycles" title="Motorcycles" products={products.motorcycles} />
      <ProductSection id="finance" title="Finance" products={products.finance} />
      <ProductSection id="travel" title="Travel" products={products.travel} />
    </div>
  );
}
