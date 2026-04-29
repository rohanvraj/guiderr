import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPostsByCategory } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

// ── Category Theme Registry ────────────────────────────────────────────────
// This is the single source of truth for every hub's palette and copy.
// To add a new category or change colours: edit ONLY this constant.
interface HubTheme {
  bg: string;               // Page background (hex)
  ghostColor: string;       // Giant drifting ghost word colour (hex)
  ghostLabel: string;       // The ghost word itself (e.g. "FINANCE")
  display: string;          // Human-readable name shown in UI
  filterKey: string;        // Must match `category:` frontmatter in .md files exactly
  dark: boolean;            // true → white text palette; false → dark text palette
  desk: string;             // Small uppercase "desk" label above H1
  headline: [string, string]; // Two-line H1 copy
  tagline: string;          // Subtitle paragraph below H1
  accentColor: string;      // Hex — category badge colour on article cards
  metaTitle: string;
  metaDesc: string;
}

const CATEGORY_THEMES: Record<string, HubTheme> = {
  'personal-finance': {
    bg: '#FFB3B3',
    ghostColor: '#FF6B6B',
    ghostLabel: 'FINANCE',
    display: 'Personal Finance',
    filterKey: 'Finance',
    dark: false,
    desk: 'The Money Desk',
    headline: ['Smart Money Moves.', 'For ₹5 Crore Goals.'],
    tagline: 'Credit cards, investments, and the habits that build generational wealth.',
    accentColor: '#be123c',
    metaTitle: 'Personal Finance Guides | Guiderr',
    metaDesc: 'Personal finance guides for Indians — credit cards, investments, and building wealth from ₹0.',
  },
  automotive: {
    bg: '#475569',
    ghostColor: '#1E293B',
    ghostLabel: 'WHEELS',
    display: 'Automotive',
    filterKey: 'Automotive',
    dark: true,
    desk: 'The Garage',
    headline: ['Two Wheels.', 'Zero Regrets.'],
    tagline: 'Motorcycle reviews, maintenance guides, and buying advice for Indian roads.',
    accentColor: '#94a3b8',
    metaTitle: 'Automotive Guides | Guiderr',
    metaDesc: 'Automotive guides — motorcycle reviews, maintenance tips, and buying advice for Indian roads.',
  },
  travel: {
    bg: '#BAE6FD',
    ghostColor: '#0369A1',
    ghostLabel: 'TRAVEL',
    display: 'Travel',
    filterKey: 'Travel',
    dark: false,
    desk: 'The Expedition Desk',
    headline: ['Go Further.', 'Spend Less.'],
    tagline: 'Itineraries, budget tips, and packing lists for solo and couple travellers.',
    accentColor: '#0369a1',
    metaTitle: 'Travel Guides | Guiderr',
    metaDesc: 'Travel guides — itineraries, budget tips, and packing lists for solo and couple travellers.',
  },
  tech: {
    bg: '#C7D2FE',
    ghostColor: '#4338CA',
    ghostLabel: 'TECH',
    display: 'Tech',
    filterKey: 'Tech',
    dark: false,
    desk: 'The Lab',
    headline: ['Buy Smarter.', 'Live Better.'],
    tagline: 'Smartphone reviews, gadget comparisons, and tech guides for Indian consumers.',
    accentColor: '#4338ca',
    metaTitle: 'Tech Guides | Guiderr',
    metaDesc: 'Tech guides — smartphone reviews, gadget comparisons, and buying advice for Indian consumers.',
  },
  lifestyle: {
    bg: '#BBF7D0',
    ghostColor: '#15803D',
    ghostLabel: 'STYLE',
    display: 'Lifestyle',
    filterKey: 'Lifestyle',
    dark: false,
    desk: 'The Edit',
    headline: ['Modern Habits.', 'Better Days.'],
    tagline: 'Health, routines, fitness, and the art of living well in modern India.',
    accentColor: '#15803d',
    metaTitle: 'Lifestyle Guides | Guiderr',
    metaDesc: 'Lifestyle guides — health, habits, fitness, and the art of living well in modern India.',
  },
  business: {
    bg: '#FAF9F6',
    ghostColor: '#475569',
    ghostLabel: 'BUSINESS',
    display: 'Business',
    filterKey: 'Business',
    dark: false,
    desk: 'The Boardroom',
    headline: ['Build It.', 'Scale It.'],
    tagline: 'Strategy, entrepreneurship, and side hustle ideas for the modern Indian builder.',
    accentColor: '#334155',
    metaTitle: 'Business Guides | Guiderr',
    metaDesc: 'Business guides — strategy, entrepreneurship, freelancing, and side hustle ideas for India.',
  },
};

const POSTS_PER_PAGE = 5;

export default function CategoryHub() {
  const { category } = useParams<{ category: string }>();
  const theme = category ? CATEGORY_THEMES[category] : undefined;

  // getPostsByCategory is synchronous (statically bundled markdown) — safe to
  // call unconditionally before the early return so no hook ordering is violated.
  const posts = theme ? getPostsByCategory(theme.filterKey) : [];

  const [currentPage, setCurrentPage] = useState(0);

  // Reset to page 1 whenever the category slug changes.
  useEffect(() => {
    setCurrentPage(0);
  }, [category]);

  useEffect(() => {
    if (!theme) return;
    const prev = document.title;
    document.title = theme.metaTitle;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) meta.content = theme.metaDesc;
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, [theme]);

  // Unknown slug (e.g. /contactus, /about caught before this in App.tsx) →
  // graceful fallback so nothing ever 404s.
  if (!theme) return <Navigate to="/library" replace />;

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts  = posts.slice(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE);

  function goToPage(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Derived palette — all driven by theme.dark ─────────────────────────
  const textPrimary   = theme.dark ? 'text-white'    : 'text-slate-900';
  const textSecondary = theme.dark ? 'text-slate-300' : 'text-slate-600';
  const textMuted     = theme.dark ? 'text-slate-400' : 'text-slate-500';
  const cardBase      = theme.dark
    ? 'border-white/10 bg-white/[0.06]'
    : 'border-black/10 bg-white/60';
  const cardHover     = theme.dark
    ? 'hover:border-white/20 hover:bg-white/[0.10]'
    : 'hover:border-black/20 hover:bg-white/80';
  const emptyCard     = theme.dark
    ? 'border-white/10 bg-white/[0.04]'
    : 'border-black/10 bg-white/50';
  const backLink      = theme.dark
    ? 'text-slate-400 hover:text-white'
    : 'text-slate-500 hover:text-slate-900';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg }}>
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Masthead ── */}
        <div className="group relative mb-20">

          {/* Ghost word — drifts on cursor-enter via pure CSS, zero JS */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-0 select-none font-black uppercase leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:translate-x-8"
            style={{
              fontSize: 'clamp(4rem, 12vw, 8rem)',
              color: theme.ghostColor,
              opacity: theme.dark ? 0.20 : 0.18,
            }}
          >
            {theme.ghostLabel}
          </span>

          <div className="relative z-10 pt-4">
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${textMuted} mb-5`}>
              {theme.desk}
            </p>
            <h1
              className={`text-4xl sm:text-6xl font-extrabold tracking-tight ${textPrimary} leading-[1.06] mb-4`}
            >
              {theme.headline[0]}
              <br className="hidden sm:block" />
              {theme.headline[1]}
            </h1>
            <p className={`${textSecondary} text-base sm:text-lg max-w-xl leading-relaxed`}>
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* ── Article list ── */}
        {posts.length === 0 ? (
          <div
            className={`rounded-[2rem] border ${emptyCard} backdrop-blur-sm p-14 text-center`}
          >
            <p className={`${textSecondary} text-lg leading-relaxed font-medium`}>
              {theme.display} guides launching soon. Check back this week.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagePosts.map((post, index) => (
              <Link
                key={post.slug}
                to={`/guides/${post.slug}`}
                className={`group flex flex-col sm:flex-row gap-5 rounded-2xl border ${cardBase} backdrop-blur-sm p-6 transition-all duration-300 ${cardHover} hover:-translate-y-0.5 animate-fade-in-up`}
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
              >
                {post.featuredImage && (
                  <img
                    src={optimizeCloudinaryUrl(post.featuredImage, { width: 400, quality: 'auto:eco' })}
                    alt={post.title}
                    loading="lazy"
                    className="w-full sm:w-36 h-28 sm:h-24 object-cover rounded-xl flex-shrink-0"
                  />
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
                    style={{ color: theme.accentColor }}
                  >
                    {theme.display}
                  </p>
                  <h2
                    className={`text-base sm:text-lg font-bold ${textPrimary} leading-snug mb-2`}
                  >
                    {post.title}
                  </h2>
                  <time className={`text-xs ${textMuted}`} dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-10 pt-8 border-t" style={{ borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)' }}>

            {/* Back to Latest / Previous */}
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: theme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                color: theme.dark ? '#fff' : '#1e293b',
              }}
            >
              ↩ Back to Latest
            </button>

            {/* Numbered page buttons */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: i === currentPage ? '#7178AB' : theme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                    color: i === currentPage ? '#fff' : theme.dark ? '#cbd5e1' : '#475569',
                    boxShadow: i === currentPage ? '0 2px 8px rgba(113,120,171,0.35)' : 'none',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: '#7178AB',
                color: '#fff',
              }}
            >
              Next →
            </button>
          </div>
        )}

        <div className="pt-14 text-center">
          <Link
            to="/guides"
            className={`inline-flex items-center gap-2 text-sm font-semibold ${backLink} transition-colors`}
          >
            ← All Guides
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
