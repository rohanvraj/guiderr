import { Bike, TrendingUp, Plane, Baby, Heart, ArrowRight, BookOpen, Book, Library, GraduationCap, PenTool, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategories, getFeaturedEbooks } from '../utils/ebooks';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const iconMap: Record<string, any> = {
  motorcycles: Bike,
  finance: TrendingUp,
  travel: Plane,
  children: Baby,
  parenting: Heart,
};

const gradientMap: Record<string, string> = {
  motorcycles: 'from-slate-600 to-slate-800',
  finance: 'from-blue-600 to-blue-800',
  travel: 'from-emerald-600 to-emerald-800',
  children: 'from-pink-600 to-pink-800',
  parenting: 'from-purple-600 to-purple-800',
};

export default function Hero() {
  const categories = getCategories();
  const featuredEbooks = getFeaturedEbooks().slice(0, 6);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Sticky animation for hero image
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Duplicate ebooks for seamless infinite scroll
  const duplicatedEbooks = [...featuredEbooks, ...featuredEbooks];
  
  // Calculate width per item (each item takes equal portion when showing all items)
  const itemWidth = 100 / featuredEbooks.length;

  return (
    <>
      {/* Hero Section with Split Design */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Gradient Background - Split Design */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500"></div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
            {/* Left Side - Text Content */}
            <div className="relative z-10 space-y-6 lg:space-y-8">
              {/* Large Text - Learn. Explore. Achieve. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-2 sm:space-y-4"
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.1] drop-shadow-lg">
                  Learn.
                </h1>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.1] drop-shadow-lg">
                  Explore.
                </h1>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.1] drop-shadow-lg">
                  Achieve.
                </h1>
              </motion.div>

              {/* Body Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-xl leading-relaxed"
              >
                Transform your knowledge and skills with expert digital guides. Personalized learning, real results, and full support — wherever you are.
              </motion.p>
            </div>

            {/* Right Side - Floating Icons */}
            <motion.div
              style={{ y, opacity }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px] lg:h-[700px] flex items-center justify-center">
                {/* Floating Book/Reading Icons */}
                <div className="relative w-full h-full">
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Ebooks Carousel - Below Hero */}
      {featuredEbooks.length > 0 && (
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
                    x: featuredEbooks.length > 0 ? `-${itemWidth * featuredEbooks.length}%` : 0,
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
                            src={ebook.cover}
                            alt={ebook.title}
                            className="w-28 h-40 sm:w-32 sm:h-44 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Cover';
                            }}
                          />
                          <div className="text-center max-w-[200px]">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-2 leading-tight">{ebook.title}</h3>
                            <p className="text-xs text-slate-600 mb-1">by {ebook.author}</p>
                            <p className="text-xs text-slate-700 mb-2 line-clamp-2 leading-snug">{ebook.synopsis}</p>
                            <div className="text-lg sm:text-xl font-bold text-slate-900">
                              ₹{ebook.price.toLocaleString('en-IN')}
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

      {/* Category Tiles Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {categories.map((category, index) => {
            const Icon = iconMap[category.id] || Bike;
            const gradient = gradientMap[category.id] || 'from-slate-600 to-slate-800';
            return (
              <Link
                key={category.id}
                to={`/${category.id}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
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
            );
          })}
          </div>

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
        </div>
      </section>
    </>
  );
}
