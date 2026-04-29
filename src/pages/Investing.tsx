import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPostsByCategory } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

export default function InvestingPage() {
  const posts = getPostsByCategory('Investing');
  const POSTS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts  = posts.slice(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE);

  function goToPage(p: number) {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    const prev = document.title;
    document.title = 'Investing | Guiderr — Equity Research & Intrinsic Value';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) {
      meta.content =
        "Deep-dive equity research, intrinsic value analysis, and long-term wealth strategy guides for India's modern investor.";
    }
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">
        <div className="group relative mb-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-0 select-none text-[5rem] sm:text-[8rem] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.04] transition-transform duration-700 group-hover:translate-x-8 group-hover:text-white/[0.07]"
          >
            INVESTING
          </span>

          <div className="relative z-10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-5">
              The Research Desk
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.06] mb-6">
              Equity Research &amp;<br className="hidden sm:block" /> Intrinsic Value.
            </h1>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-800 bg-white/[0.04] backdrop-blur-sm p-14 text-center">
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              Deep-dive equity research and intrinsic value guides launching this week.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagePosts.map((post, index) => (
              <Link
                key={post.slug}
                to={`/guides/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-800 bg-white/[0.04] backdrop-blur-sm p-6 transition-all duration-300 hover:border-slate-700 hover:bg-white/[0.07] hover:-translate-y-0.5 animate-fade-in-up"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400 mb-2">
                    Investing
                  </p>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-teal-300 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <time className="text-xs text-slate-500" dateTime={post.date}>
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
          <div className="flex flex-wrap items-center justify-between gap-3 mt-10 pt-8 border-t border-slate-800">

            {/* Back to Latest */}
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/[0.08] text-slate-300 hover:bg-white/[0.14] hover:text-white"
            >
              Back to Latest
            </button>

            {/* Numbered page buttons */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: i === currentPage ? '#7178AB' : 'rgba(255,255,255,0.08)',
                    color: i === currentPage ? '#fff' : '#94a3b8',
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
              style={{ background: '#7178AB', color: '#fff' }}
            >
              Next
            </button>
          </div>
        )}

        <div className="pt-14 text-center">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← All Guides
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}