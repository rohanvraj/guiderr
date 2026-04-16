import { BookOpen, Book, Library, GraduationCap, PenTool, Lightbulb, Plane, Compass, Bike } from 'lucide-react';
import {
  Moped, ChartLineUp, GlobeHemisphereWest,
  Sparkle, Briefcase, Cpu, CarSimple, SunHorizon, TrendUp,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const FEATURED_BUTTON_CLASSES = 'inline-flex items-center justify-center gap-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-sm font-semibold px-5 py-3 transition-colors shadow-sm';
const FEATURED_WHATSAPP_URL = 'https://wa.me/919890505945?text=Hi%20Guiderr,%20I%27m%20interested%20in%20getting%20featured.';

const HERO_TILES = [
  {
    id: 'personal-finance',
    label: 'Personal Finance',
    description: 'Build wealth, optimise credit, and achieve financial freedom',
    ghost: 'FINANCE',
    link: '/guides?category=Finance',
    Icon: ChartLineUp, bg: 'bg-teal-50', border: 'border-teal-200', color: '#0d9488',
  },
  {
    id: 'investing',
    label: 'Investing',
    description: 'Equity research, intrinsic value, and long-term wealth strategy',
    ghost: 'INVESTING',
    link: '/investing',
    Icon: TrendUp, bg: 'bg-emerald-50', border: 'border-emerald-200', color: '#059669',
  },
  {
    id: 'travel',
    label: 'Travel',
    description: 'Explore the world with confidence and insider knowledge',
    ghost: 'TRAVEL',
    link: '/guides?category=Travel',
    Icon: GlobeHemisphereWest, bg: 'bg-blue-50', border: 'border-blue-200', color: '#2563eb',
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Reviews and guides on the latest gadgets and technology',
    ghost: 'TECH',
    link: '/guides?category=Tech',
    Icon: Cpu, bg: 'bg-sky-50', border: 'border-sky-200', color: '#0284c7',
  },
  {
    id: 'automotive',
    label: 'Automotive',
    description: 'Motorcycles, cars, and everything that moves — buying and riding guides',
    ghost: 'WHEELS',
    link: '/guides?category=Automotive',
    Icon: CarSimple, bg: 'bg-slate-50', border: 'border-slate-200', color: '#475569',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Smarter choices for how you live, eat, dress, and spend your time',
    ghost: 'LIFESTYLE',
    link: '/guides?category=Lifestyle',
    Icon: SunHorizon, bg: 'bg-amber-50', border: 'border-amber-200', color: '#d97706',
  },
  {
    id: 'business',
    label: 'Business',
    description: "Entrepreneur's playbook for building and growing your business",
    ghost: 'BUSINESS',
    link: '/guides?category=Business',
    Icon: Briefcase, bg: 'bg-indigo-50', border: 'border-indigo-200', color: '#4f46e5',
  },
];

export default function Hero() {

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
            <div className="relative z-10 space-y-6 lg:space-y-8 animate-fade-in-up">
                <h1 className="space-y-2">
                  <span className="block text-5xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] drop-shadow-lg">
                  Personal Finance, Adventure &amp; Entrepreneurship.
                </span>
              </h1>

                <p className="text-xl font-medium text-white/70">
                  Hi, I'm Rohan.
                </p>

              <p className="text-lg sm:text-xl text-white/80 mt-6 leading-relaxed max-w-xl font-light animate-fade-in" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
                I build systems on <strong className="font-semibold text-white">Guiderr</strong> to help modern Indians move faster, save smarter, and live bigger.
              </p>
            </div>

            {/* Right Side - Knowledge Cloud + Founder Image */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:flex items-end justify-center">
              <div className="relative w-full h-full min-h-screen flex items-end justify-center">
                {/* Layer 1 (z-0): Floating Book/Reading Icons — The Knowledge Cloud */}
                <div className="absolute inset-0 w-full h-full z-0">
                  {/* BookOpen Icon */}
                  <div className="absolute top-10 left-10 animate-float-soft transform-gpu" style={{ animationDuration: '4s' }}>
                    <BookOpen className="w-16 h-16 text-white/30" />
                  </div>

                  {/* Book Icon */}
                  <div className="absolute top-32 right-20 animate-float-soft transform-gpu" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
                    <Book className="w-20 h-20 text-white/25" />
                  </div>

                  {/* Library Icon */}
                  <div className="absolute bottom-32 left-16 animate-float-soft transform-gpu" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
                    <Library className="w-24 h-24 text-white/20" />
                  </div>

                  {/* GraduationCap Icon */}
                  <div className="absolute top-1/2 right-12 animate-float-soft transform-gpu" style={{ animationDuration: '5.5s', animationDelay: '0.3s' }}>
                    <GraduationCap className="w-18 h-18 text-white/30" />
                  </div>

                  {/* PenTool Icon */}
                  <div className="absolute bottom-20 right-1/4 animate-float-soft transform-gpu" style={{ animationDuration: '4.8s', animationDelay: '0.8s' }}>
                    <PenTool className="w-14 h-14 text-white/25" />
                  </div>

                  {/* Lightbulb Icon */}
                  <div className="absolute top-1/3 left-1/3 animate-float-soft transform-gpu" style={{ animationDuration: '4.2s', animationDelay: '1.2s' }}>
                    <Lightbulb className="w-16 h-16 text-white/30" />
                  </div>

                  {/* Additional BookOpen Icon */}
                  <div className="absolute bottom-1/4 left-1/2 animate-float-soft transform-gpu" style={{ animationDuration: '5.2s', animationDelay: '1.5s' }}>
                    <BookOpen className="w-12 h-12 text-white/20" />
                  </div>

                  {/* Book Icon - Small */}
                  <div className="absolute top-1/4 right-1/3 animate-float-soft transform-gpu" style={{ animationDuration: '4.6s', animationDelay: '0.6s' }}>
                    <Book className="w-10 h-10 text-white/25" />
                  </div>

                  {/* Plane Icon - Travel */}
                  <div className="absolute top-20 right-1/4 animate-float-soft transform-gpu" style={{ animationDuration: '5.3s', animationDelay: '1.1s' }}>
                    <Plane className="w-16 h-16 text-white/28" />
                  </div>

                  {/* Compass Icon - Travel */}
                  <div className="absolute bottom-40 right-12 animate-float-soft transform-gpu" style={{ animationDuration: '4.9s', animationDelay: '0.4s' }}>
                    <Compass className="w-14 h-14 text-white/26" />
                  </div>

                  {/* Bike Icon - Motorcycle */}
                  <div className="absolute top-2/3 left-20 animate-float-soft transform-gpu" style={{ animationDuration: '5.1s', animationDelay: '1.3s' }}>
                    <Bike className="w-18 h-18 text-white/27" />
                  </div>
                </div>

                {/* Layer 2 (z-10): Founder Image — anchored to the bottom of the hero */}
                {/* DISABLED — uncomment to re-enable founder image */}
                {/* <img
                  src="/images/founder-image.webp"
                  alt="Rohan — Founder of Guiderr"
                  loading="eager"
                  decoding="async"
                  className="relative z-10 w-auto h-[86vh] xl:h-[92vh] max-w-none object-contain object-bottom drop-shadow-2xl"
                /> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get Featured Bento Card ── */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <div className="max-w-2xl mx-auto">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white/55 p-6 shadow-sm backdrop-blur-md transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-8">
            {/* Subtle decorative gradient blob */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-pink-200/40 via-purple-200/30 to-transparent blur-2xl"
            />
            <span className="pointer-events-none absolute -right-2 bottom-2 select-none text-[3.4rem] font-black uppercase tracking-[-0.08em] text-slate-900/5 transition-transform duration-500 group-hover:translate-x-4 sm:text-[4.7rem]">
              FEATURED
            </span>

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Guiderr Logo */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5">
                <img src="/images/guiderr-logo.webp" alt="Guiderr" className="w-full h-full object-contain" loading="eager" />
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
        </div>
      </section>

      {/* Category Tiles Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Explore by Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {HERO_TILES.map(({ id, label, description, ghost, link, Icon, bg, border, color }) => (
            <div key={id} className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
              <Link
                to={link}
                className="group block h-full"
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-3xl sm:p-8">
                  <span className="pointer-events-none absolute -right-2 top-3 select-none text-[3.6rem] font-black uppercase tracking-[-0.1em] text-slate-900/5 transition-transform duration-500 group-hover:translate-x-4 sm:text-[4.6rem] lg:text-[4rem] xl:text-[4.5rem]">
                    {ghost}
                  </span>
                  <div className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 border shadow-sm group-hover:scale-105 transition-transform duration-300 ${bg} ${border}`}>
                    <Icon weight="duotone" className="w-7 h-7 sm:w-8 sm:h-8" color={color} />
                  </div>

                  <h3 className="relative z-10 text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                    {label}
                  </h3>

                  <p className="relative z-10 text-sm sm:text-base text-slate-600 leading-relaxed mb-4 max-w-[18rem]">
                    {description}
                  </p>

                  <div className="relative z-10 text-slate-700 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all text-sm">
                    Explore
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
          </div>

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
        <div className="group relative max-w-4xl mx-auto overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 text-center transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
          <span className="pointer-events-none absolute bottom-0 right-3 select-none text-[4.4rem] font-black uppercase tracking-[-0.08em] text-slate-900/5 transition-transform duration-500 group-hover:translate-x-4 sm:text-[6rem]">
            SPOTLIGHT
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Ready to spotlight your business?
          </h2>
          <p className="relative z-10 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-slate-600">
            Start with our premium placement page, then connect with us directly when the fit feels right.
          </p>
          <Link
            to="/get-featured"
            className={`${FEATURED_BUTTON_CLASSES} relative z-10 mt-6`}
          >
            Connect with us to get featured
          </Link>
          <div className="relative z-10 mt-4">
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
        </div>
      </section>
    </>
  );
}
