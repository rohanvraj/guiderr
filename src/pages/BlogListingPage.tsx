import { useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllPosts } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

// ── Constants ──────────────────────────────────────────────────────────────
const POSTS_PER_PAGE = 6;

// Maps any ?category= URL param to its clean hub URL (backward compat).
const PARAM_TO_HUB: Record<string, string> = {
  Finance:            '/personal-finance',
  'Personal Finance': '/personal-finance',
  Investing:          '/investing',
  Travel:             '/travel',
  Tech:               '/tech',
  Automotive:         '/automotive',
  Lifestyle:          '/lifestyle',
  Business:           '/business',
  'AI Lab':           '/ai-lab',
};

// Colors kept in sync with CategoryHub.tsx CATEGORY_THEMES.
interface DirectoryCard {
  label: string;
  ghost: string;
  url: string | null; // null = Full Archive (revealed inline)
  bg: string;
  ghostColor: string;
  dark: boolean;
}

const DIRECTORY: DirectoryCard[] = [
  { label: 'Personal Finance', ghost: 'FINANCE',  url: '/personal-finance', bg: '#FFB3B3', ghostColor: '#FF6B6B', dark: false },
  { label: 'Investing',        ghost: 'INVESTING', url: '/investing',        bg: '#0f172a', ghostColor: '#334155', dark: true  },
  { label: 'Automotive',       ghost: 'WHEELS',    url: '/automotive',       bg: '#475569', ghostColor: '#1E293B', dark: true  },
  { label: 'Travel',           ghost: 'TRAVEL',    url: '/travel',           bg: '#BAE6FD', ghostColor: '#0369A1', dark: false },
  { label: 'Tech',             ghost: 'TECH',      url: '/tech',             bg: '#C7D2FE', ghostColor: '#4338CA', dark: false },
  { label: 'Lifestyle',        ghost: 'STYLE',     url: '/lifestyle',        bg: '#BBF7D0', ghostColor: '#15803D', dark: false },
  { label: 'Business',         ghost: 'BUSINESS',       url: '/business',         bg: '#FAF9F6', ghostColor: '#475569', dark: false },
  { label: 'AI Lab',           ghost: 'INTELLIGENCE',   url: '/ai-lab',           bg: '#1E1B4B', ghostColor: '#7C3AED', dark: true  },
  { label: 'Full Archive',     ghost: 'ALL',            url: null,                bg: '#7178AB', ghostColor: '#ffffff', dark: true  },
];

// Frontmatter `category` → display-friendly label.
function displayCategory(cat: string): string {
  if (cat === 'Finance') return 'Personal Finance';
  return cat;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function BlogListingPage() {
  const allPosts = getAllPosts();
  const [searchParams] = useSearchParams();
  const [showArchive, setShowArchive] = useState(true);
  const [page, setPage] = useState(0);

  // Backward-compat redirects — hooks are all called above this early return.
  const rawCategory = searchParams.get('category');
  if (rawCategory && PARAM_TO_HUB[rawCategory]) {
    return <Navigate to={PARAM_TO_HUB[rawCategory]} replace />;
  }

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const pagePosts = allPosts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE);

  function handleArchiveClick() {
    setShowArchive(true);
    setPage(0);
    // Let the DOM update before scrolling
    setTimeout(() => {
      document.getElementById('archive-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  function goToPage(p: number) {
    setPage(p);
    setTimeout(() => {
      document.getElementById('archive-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Guides</h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Deep-dives, reviews, and frameworks from the Guiderr desk.
          </p>
        </div>

        {/* ── Directory section label ── */}
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-4">
          Select a Vertical
        </p>

        {/* ── Directory Grid — 2 cols mobile, 4 cols md+ ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {DIRECTORY.map((card) => {
            const isArchive = card.url === null;
            const textPrimary = card.dark ? 'text-white'      : 'text-slate-900';
            const textSub     = card.dark ? 'text-white/50'   : 'text-slate-500/80';
            const textArrow   = card.dark ? 'text-white/70'   : 'text-slate-600';

            const cardInner = (
              <div
                className="group relative overflow-hidden rounded-2xl h-36 sm:h-44 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
                style={{ backgroundColor: card.bg }}
              >
                {/* Ghost word — drifts on hover, pure CSS, zero JS */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 bottom-0 select-none font-black uppercase leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:translate-x-3"
                  style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                    color: card.ghostColor,
                    opacity: card.dark ? 0.22 : 0.20,
                  }}
                >
                  {card.ghost}
                </span>

                {/* Card text — bottom-left anchored */}
                <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-5">
                  <p className={`text-[9px] font-bold uppercase tracking-[0.24em] mb-1.5 ${textSub}`}>
                    {isArchive ? 'All topics' : 'Hub'}
                  </p>
                  <h3 className={`text-sm sm:text-base font-extrabold leading-tight tracking-tight uppercase ${textPrimary}`}>
                    {card.label}
                  </h3>
                  <span className={`mt-1.5 text-[10px] font-semibold flex items-center gap-1 transition-all duration-300 group-hover:gap-2 ${textArrow}`}>
                    {isArchive ? 'Browse all' : 'Explore'} →
                  </span>
                </div>
              </div>
            );

            // Full Archive card — toggles inline archive
            if (isArchive) {
              return (
                <div key="archive" role="button" tabIndex={0} onClick={handleArchiveClick}
                  onKeyDown={(e) => e.key === 'Enter' && handleArchiveClick()}
                >
                  {cardInner}
                </div>
              );
            }

            return (
              <Link key={card.label} to={card.url!}>
                {cardInner}
              </Link>
            );
          })}
        </div>

       {/* ── Latest Guides ── */}
        {showArchive && (
          <div id="archive-section" className="scroll-mt-28">
            {/* Archive header */}
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-1">
                  Latest Guides
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  All {allPosts.length} Guides
                </h2>
              </div>
              {totalPages > 1 && (
                <p className="text-sm text-slate-400 font-medium tabular-nums">
                  Page {page + 1} / {totalPages}
                </p>
              )}
            </div>

            {/* Article grid */}
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pagePosts.map((post, index) => (
                <Link
                  key={post.slug}
                  to={`/guides/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                >
                  {post.featuredImage && (
                    <img
                      src={optimizeCloudinaryUrl(post.featuredImage, { width: 600, quality: 'auto:eco' })}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-44 object-cover"
                    />
                  )}
                  <div className="p-4 sm:p-5">
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7178AB]">
                        {displayCategory(post.category)}
                      </span>
                    )}
                    <h2 className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-[#7178AB] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                      {post.author && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{post.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {/* Numbered page buttons — only rendered when ≤ 7 pages to avoid clutter */}
                {totalPages <= 7 && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          i === page
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
