import {
  Moped, ChartLineUp, GlobeHemisphereWest,
  Sparkle, Briefcase, Cpu, CarSimple, SunHorizon, TrendUp,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const FOUNDER_PORTRAIT_SRC = optimizeCloudinaryUrl('ziphly-guiderr-rentfar-queueslip-founder-rohan-raj_mb9yiw_1_lfjpjm', {
  width: 288,
  height: 288,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto:eco',
});

const FEATURED_BUTTON_CLASSES = 'inline-flex items-center justify-center gap-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-sm font-semibold px-5 py-3 transition-colors shadow-sm';
const FEATURED_WHATSAPP_URL = 'https://wa.me/919890505945?text=Hi%20Guiderr,%20I%27m%20interested%20in%20getting%20featured.';

const HERO_TILES = [
  {
    id: 'personal-finance',
    label: 'Personal Finance',
    description: 'Build wealth, optimise credit, and achieve financial freedom',
    ghost: 'FINANCE',
    link: '/personal-finance',
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
    link: '/travel',
    Icon: GlobeHemisphereWest, bg: 'bg-blue-50', border: 'border-blue-200', color: '#2563eb',
  },
  {
    id: 'tech',
    label: 'Tech',
    description: 'Reviews and guides on the latest gadgets and technology',
    ghost: 'TECH',
    link: '/tech',
    Icon: Cpu, bg: 'bg-sky-50', border: 'border-sky-200', color: '#0284c7',
  },
  {
    id: 'automotive',
    label: 'Automotive',
    description: 'Motorcycles, cars, and everything that moves — buying and riding guides',
    ghost: 'WHEELS',
    link: '/automotive',
    Icon: CarSimple, bg: 'bg-slate-50', border: 'border-slate-200', color: '#475569',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Smarter choices for how you live, eat, dress, and spend your time',
    ghost: 'LIFESTYLE',
    link: '/lifestyle',
    Icon: SunHorizon, bg: 'bg-amber-50', border: 'border-amber-200', color: '#d97706',
  },
  {
    id: 'business',
    label: 'Business',
    description: "Entrepreneur's playbook for building and growing your business",
    ghost: 'BUSINESS',
    link: '/business',
    Icon: Briefcase, bg: 'bg-indigo-50', border: 'border-indigo-200', color: '#4f46e5',
  },
  {
    id: 'ai-lab',
    label: 'AI Lab',
    description: 'Mastering prompts, cinematic realism, and AI character continuity.',
    ghost: 'AI',
    link: '/ai-lab',
    Icon: Sparkle, bg: 'bg-violet-50', border: 'border-violet-200', color: '#7c3aed',
  },
  {
  id: 'art',
  label: 'Art',
  description: 'AI art, digital creativity, and visual storytelling for modern creators.',
  ghost: 'ART',
  link: '/art',
  Icon: Sparkle, bg: 'bg-pink-50', border: 'border-pink-200', color: '#db2777',
},
];

export default function Hero() {

  return (
    <>
      {/* ── Hero — Traffic Controller ── */}
      <section className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8">
        <div className="max-w-7xl mx-auto w-full">

          {/* Copy block */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">

              {/* Left: headline + subtext */}
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-5">
                  Smarter Decisions on Money, Gear, Travel and Tech.
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                 One person. Lots of research. Written simply.
                </p>
              </div>

              {/* Founder portrait + greeting */}
              <div className="mt-5 lg:mt-0 lg:flex-shrink-0">
                <div className="flex items-center justify-start gap-3 sm:gap-4 lg:gap-6">

                  <Link to="/about" className="flex-shrink-0">
                    <img
                      src={FOUNDER_PORTRAIT_SRC}
                      alt="Rohan Raj, founder of Guiderr"
                      width={240}
                      height={240}
                      loading="eager"
                      decoding="async"
                      className="w-28 h-28 sm:w-32 sm:h-32 lg:w-52 lg:h-52 rounded-full border border-slate-100 shadow-sm object-cover cursor-pointer hover:shadow-md transition-shadow"
                    />
                  </Link>

                  <div className="max-w-[180px] sm:max-w-[220px]">
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                      Hi! I'm Rohan. I built Guiderr to help Indians make better decisions with their money and time. That's the aim.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/*
            Desktop asymmetric grid — 4 cols × 2 rows
              Learn           → col-span-2 row-span-2  (large left dominant)
              Intelligent Briefs → col-span-2 row-span-1  (top right, wide)
              The Selection   → col-span-1 row-span-1  (bottom right, left half)
              Featured Stories → col-span-1 row-span-1  (bottom right, right half)

            Mobile — single-column stack in order:
              Learn → Briefs → Selection → Stories
          */}
          <div className="grid grid-cols-1 sm:grid-cols-4 sm:grid-rows-2 gap-4 sm:gap-6">

            {/* 1. Learn — large left card */}
            <Link
              to="/guides"
              className="group sm:col-span-2 sm:row-span-2 relative overflow-hidden flex flex-col justify-between rounded-2xl bg-red-500 hover:bg-red-400 p-8 min-h-[260px] sm:min-h-[440px] transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-4 -right-3 text-[7rem] sm:text-[10rem] font-black uppercase tracking-[-0.05em] text-black/10 transition-transform duration-200 group-hover:-translate-y-1">READ</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-950/50 mb-4 font-medium">01</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 leading-tight">Learn for free.</h2>
                <p className="mt-3 text-[15px] sm:text-base font-medium text-slate-950/70 max-w-xs">
                  Honest guides on money, gear, travel, and tech. 
The research is the work.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm mt-8">
                <span>Browse guides</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

            {/* 2. Intelligent Briefs — top right, spans full right half */}
            <Link
              to="/library"
              className="group sm:col-span-2 sm:row-span-1 relative overflow-hidden flex flex-col justify-between rounded-2xl bg-amber-500 hover:bg-amber-400 p-6 min-h-[160px] sm:min-h-0 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98]"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-4 -right-3 text-[5rem] sm:text-[7rem] font-black uppercase tracking-[-0.05em] text-black/10 transition-transform duration-200 group-hover:-translate-y-1">LIBRARY</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-950/50 mb-3 font-medium">02</p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">Intelligent Briefs: Our Premium Modules.</h2>
                <p className="mt-2 text-[15px] sm:text-base text-slate-950/70 font-medium">
                 Deep-dive PDF modules on investing, AI, riding, and more. One time Purchase starting ₹100.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm mt-4">
                <span>Go to library</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

            {/* 3. Top Picks — bottom right, left cell */}
            <Link
              to="/top-picks"
              className="group sm:col-span-1 sm:row-span-1 relative overflow-hidden flex flex-col justify-between rounded-2xl bg-sky-300 hover:bg-sky-200 p-6 min-h-[160px] sm:min-h-0 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-sky-500/30 active:scale-[0.98]"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-4 -right-3 text-[5rem] sm:text-[7rem] font-black uppercase tracking-[-0.05em] text-black/10 transition-transform duration-200 group-hover:-translate-y-1">PICKS</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-950/50 mb-3 font-medium">03</p>
                <h2 className="text-xl font-bold text-slate-950">Top Picks.</h2>
                <p className="mt-2 text-[15px] sm:text-base font-medium text-slate-950/70">
                  Rohan's personal picks across every category.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm mt-4">
                <span>View picks</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

            {/* 4. Featured Stories — bottom right, right cell */}
            <Link
              to="/featured"
              className="group sm:col-span-1 sm:row-span-1 relative overflow-hidden flex flex-col justify-between rounded-2xl bg-emerald-500 hover:bg-emerald-400 p-6 min-h-[160px] sm:min-h-0 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-4 -right-3 text-[5rem] sm:text-[7rem] font-black uppercase tracking-[-0.05em] text-black/10 transition-transform duration-200 group-hover:-translate-y-1">STORIES</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-950/50 mb-3 font-medium">04</p>
                <h2 className="text-xl font-bold text-slate-950">Featured Stories.</h2>
                <p className="mt-2 text-[15px] sm:text-base font-medium text-slate-950/70">
                  Real people, real outcomes - spotlighted on Guiderr.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm mt-4">
                <span>Read stories</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

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
                  Want to Share Your Story on Guiderr?
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
