import { BookOpen, Book, Library, GraduationCap, PenTool, Lightbulb } from 'lucide-react';
import {
  Moped, ChartLineUp, GlobeHemisphereWest, PawPrint,
  Sparkle, Palette, Briefcase, Cpu, HouseLine,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { getCategories } from '../utils/ebooks';
import { getAllProducts } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const FEATURED_BUTTON_CLASSES = 'inline-flex items-center justify-center gap-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-sm font-semibold px-5 py-3 transition-colors shadow-sm';
const FEATURED_WHATSAPP_URL = 'https://wa.me/919890505945?text=Hi%20Guiderr,%20I%27m%20interested%20in%20getting%20featured.';

type CategoryConfig = { Icon: any; bg: string; border: string; color: string };

const categoryConfig: Record<string, CategoryConfig> = {
  motorcycles:       { Icon: Moped,               bg: 'bg-slate-50',  border: 'border-slate-200',  color: '#475569' },
  finance:           { Icon: ChartLineUp,         bg: 'bg-teal-50',   border: 'border-teal-200',   color: '#0d9488' },
  travel:            { Icon: GlobeHemisphereWest, bg: 'bg-blue-50',   border: 'border-blue-200',   color: '#2563eb' },
  pets:              { Icon: PawPrint,            bg: 'bg-amber-50',  border: 'border-amber-200',  color: '#d97706' },
  'beauty-wellness': { Icon: Sparkle,            bg: 'bg-rose-50',   border: 'border-rose-200',   color: '#e11d48' },
  art:               { Icon: Palette,            bg: 'bg-violet-50', border: 'border-violet-200', color: '#7c3aed' },
  business:          { Icon: Briefcase,          bg: 'bg-indigo-50', border: 'border-indigo-200', color: '#4f46e5' },
  'gadget-tech':     { Icon: Cpu,               bg: 'bg-sky-50',    border: 'border-sky-200',    color: '#0284c7' },
  'home-living':     { Icon: HouseLine,          bg: 'bg-green-50',  border: 'border-green-200',  color: '#16a34a' },
};
const defaultConfig: CategoryConfig = { Icon: Briefcase, bg: 'bg-gray-50', border: 'border-gray-200', color: '#374151' };

export default function Hero() {
  const categories = getCategories();
  const [carouselReady, setCarouselReady] = useState(false);
  const loadedImagesRef = useRef(new Set<string>());

  // Shares the ['products'] queryKey with Products.tsx — React Query deduplicates
  // the request so this costs 0 extra API calls when both components are on screen.
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });
  const featuredEbooks = allProducts.slice(0, 6);
  
  // Duplicate ebooks for seamless infinite scroll
  const duplicatedEbooks = [...featuredEbooks, ...featuredEbooks];
  
  // Calculate width per item (each item takes equal portion when showing all items)
  const itemWidth = featuredEbooks.length > 0 ? 100 / featuredEbooks.length : 100;
  
  // Track image loading for carousel
  const prefersReducedMotion = useReducedMotion();

  // Stagger variants — slide suppressed when user prefers reduced motion
  const gridContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const gridItem: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
  };

  // Track image loading for carousel
  const handleImageLoad = (ebookId: string) => {
    loadedImagesRef.current.add(ebookId);
    if (loadedImagesRef.current.size >= featuredEbooks.length) {
      setCarouselReady(true);
    }
  };

  return (
    <>
      {/* Hero Section with Split Design */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Gradient Background - Split Design */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500"></div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end min-h-[80vh]">
            {/* Left Side - The Pitch */}
            <motion.div
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 space-y-6 lg:space-y-8"
            >
                <h1 className="space-y-2">
                  <span className="block text-5xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] drop-shadow-lg">
                  Finance, Adventure &amp; Entrepreneurship.
                </span>
              </h1>

                <p className="text-xl font-medium text-white/70">
                  Hi, I'm Rohan.
                </p>

              <motion.p
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl text-white/80 mt-6 leading-relaxed max-w-xl font-light"
              >
                I build systems on <strong className="font-semibold text-white">Guiderr</strong> to help modern Indians move faster, save smarter, and live bigger.
              </motion.p>
            </motion.div>

            {/* Right Side - Knowledge Cloud + Founder Image */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:flex items-end justify-center">
              <div className="relative w-full h-full min-h-screen flex items-end justify-center">
                {/* Layer 1 (z-0): Floating Book/Reading Icons — The Knowledge Cloud */}
                <div className="absolute inset-0 w-full h-full z-0">
                  {/* BookOpen Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.3,
                      y: [0, -20, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-10 left-10"
                  >
                    <BookOpen className="w-16 h-16 text-white/30" />
                  </motion.div>

                  {/* Book Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.25,
                      y: [0, -30, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute top-32 right-20"
                  >
                    <Book className="w-20 h-20 text-white/25" />
                  </motion.div>

                  {/* Library Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.2,
                      y: [0, -25, 0],
                      rotate: [0, 3, 0]
                    }}
                    transition={{ 
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute bottom-32 left-16"
                  >
                    <Library className="w-24 h-24 text-white/20" />
                  </motion.div>

                  {/* GraduationCap Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.3,
                      y: [0, -35, 0],
                      rotate: [0, -4, 0]
                    }}
                    transition={{ 
                      duration: 5.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                    className="absolute top-1/2 right-12"
                  >
                    <GraduationCap className="w-18 h-18 text-white/30" />
                  </motion.div>

                  {/* PenTool Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.25,
                      y: [0, -28, 0],
                      rotate: [0, 6, 0]
                    }}
                    transition={{ 
                      duration: 4.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                    className="absolute bottom-20 right-1/4"
                  >
                    <PenTool className="w-14 h-14 text-white/25" />
                  </motion.div>

                  {/* Lightbulb Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.3,
                      y: [0, -22, 0],
                      rotate: [0, -3, 0]
                    }}
                    transition={{ 
                      duration: 4.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.2
                    }}
                    className="absolute top-1/3 left-1/3"
                  >
                    <Lightbulb className="w-16 h-16 text-white/30" />
                  </motion.div>

                  {/* Additional BookOpen Icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.2,
                      y: [0, -26, 0],
                      rotate: [0, 4, 0]
                    }}
                    transition={{ 
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                    className="absolute bottom-1/4 left-1/2"
                  >
                    <BookOpen className="w-12 h-12 text-white/20" />
                  </motion.div>

                  {/* Book Icon - Small */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 0.25,
                      y: [0, -24, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 4.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                    className="absolute top-1/4 right-1/3"
                  >
                    <Book className="w-10 h-10 text-white/25" />
                  </motion.div>
                </div>

                {/* Layer 2 (z-10): Founder Image — anchored to the bottom of the hero */}
                <img
                  src="/images/founder-image.png"
                  alt="Rohan — Founder of Guiderr"
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="hidden relative z-10 w-auto h-[86vh] xl:h-[92vh] max-w-none object-contain object-bottom drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ebooks Carousel - Below Hero */}
      {/* Temporarily hidden until more products are available */}
      {false && featuredEbooks.length > 0 && (
        <section id="featured" className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 sm:mb-12 text-center">
              Featured Ebooks
            </h2>
            <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl">
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{
                    x: carouselReady && featuredEbooks.length > 0 ? `-${itemWidth * featuredEbooks.length}%` : 0,
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: featuredEbooks.length * 5,
                      ease: 'linear',
                    },
                  }}
                  style={{ width: `${itemWidth * duplicatedEbooks.length}%` }}
                >
                  {duplicatedEbooks.map((ebook, index) => (
                    <div
                      key={`${ebook.id}-${index}`}
                      className="flex-shrink-0 px-3 sm:px-4"
                      style={{ width: `${itemWidth}%` }}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={optimizeCloudinaryUrl(ebook.cover_image_url, { width: 300 }) || '/covers/placeholder.svg'}
                            alt={ebook.name}
                            loading={index < 3 ? 'eager' : 'lazy'}
                            className="w-28 h-40 sm:w-32 sm:h-44 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            style={{ opacity: carouselReady ? 1 : 0 }}
                            onLoad={() => handleImageLoad(ebook.id)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
                              handleImageLoad(ebook.id);
                            }}
                          />
                          <div className="text-center max-w-[200px]">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">{ebook.name}</h3>
                            <p className="text-xs text-slate-600 mb-1">by {ebook.author || 'Guiderr'}</p>
                            <div className="text-lg sm:text-xl font-bold text-slate-900">
                              ₹{ebook.price_in_rupees.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Get Featured Bento Card ── */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative bg-white/40 backdrop-blur-md border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
            {/* Subtle decorative gradient blob */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-transparent blur-2xl"
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Guiderr Logo */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5">
                <img src="/images/guiderr-logo.png" alt="Guiderr" className="w-full h-full object-contain" loading="eager" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 tracking-tight">
                  Share Your Story with Guiderr
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We feature independent businesses, innovative creators, and niche experts.
                </p>
              </div>

              {/* CTA */}
              <Link
                to="/get-featured"
                className={`${FEATURED_BUTTON_CLASSES} flex-shrink-0 whitespace-nowrap min-h-[44px] w-full sm:w-auto`}
              >
                Get Featured
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Tiles Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-16 sm:mb-20"
          >
          {categories.map((category) => {
            const { Icon, bg, border, color } = categoryConfig[category.id] || defaultConfig;
            return (
              <motion.div key={category.id} variants={gridItem}>
                <Link
                  to={`/guides?category=${encodeURIComponent(category.name)}`}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 border shadow-sm group-hover:scale-110 transition-transform duration-200 ${bg} ${border}`}>
                      <Icon weight="duotone" className="w-7 h-7 sm:w-8 sm:h-8" color={color} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                      {category.description}
                    </p>

                    <div className="text-slate-700 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all text-sm">
                      Explore
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </motion.div>

          {/* Stats Section - Temporarily hidden */}
          {false && (
          <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto text-center">
            <div className="animate-fade-in animation-delay-200">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">100+</div>
              <div className="text-sm sm:text-base text-slate-600">Premium Guides</div>
            </div>
            <div className="animate-fade-in animation-delay-400">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">50K+</div>
              <div className="text-sm sm:text-base text-slate-600">Happy Readers</div>
            </div>
            <div className="animate-fade-in animation-delay-600">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">4.9/5</div>
              <div className="text-sm sm:text-base text-slate-600">Avg Rating</div>
            </div>
          </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-4xl mx-auto rounded-[2rem] border border-slate-200 bg-white px-6 py-10 sm:px-10 sm:py-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Ready to spotlight your business?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-slate-600">
            Start with our premium placement page, then connect with us directly when the fit feels right.
          </p>
          <Link
            to="/get-featured"
            className={`${FEATURED_BUTTON_CLASSES} mt-6`}
          >
            Connect with us to get featured
          </Link>
          <div className="mt-4">
            <a
              href={FEATURED_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-900 hover:text-purple-950 transition-colors"
            >
              Prefer WhatsApp? Start a quick conversation
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
