import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCategoryById, getEbooksByCategory } from '../utils/ebooks';
import { Ebook } from '../types/ebook';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EbookModal from '../components/EbookModal';

function EbookCard({ ebook, index }: { ebook: Ebook; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
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
        className={`group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
        style={{ animationDelay: isVisible ? `${index * 50}ms` : '0ms' }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={ebook.cover}
            alt={ebook.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x200?text=Cover';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-2 sm:p-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 line-clamp-2 leading-tight group-hover:text-slate-700 transition-colors">
            {ebook.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-600 mb-1 line-clamp-1">by {ebook.author}</p>
          <div className="text-sm sm:text-base font-bold text-slate-900">
            ₹{ebook.price.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EbookModal ebook={ebook} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [categoryData, setCategoryData] = useState<{ id: string; name: string; description: string } | null>(null);

  useEffect(() => {
    if (category) {
      const cat = getCategoryById(category);
      if (cat) {
        setCategoryData(cat);
        setEbooks(getEbooksByCategory(category));
      }
    }
  }, [category]);

  if (!category || !categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Category Not Found</h1>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="mb-12 sm:mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              {categoryData.name}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
              {categoryData.description}
            </p>
          </div>

          {ebooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No ebooks available in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {ebooks.map((ebook, index) => (
                <EbookCard key={ebook.id} ebook={ebook} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
