import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { getAllFeaturedStories } from '../utils/blog';

function getStoryExcerpt(body: string): string {
  const cleaned = body
    .replace(/[#>*_`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 160 ? `${cleaned.slice(0, 160)}...` : cleaned;
}

export default function FeaturedStoriesPage() {
  const stories = getAllFeaturedStories();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* ── Magazine masthead ── */}
        <div className="mb-10 border-b border-slate-200 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-700 mb-2">
            The Spotlight Series
          </p>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-slate-900 leading-none mb-3">
            Featured Stories
          </h1>
          <p className="text-slate-500 text-base max-w-xl">
            Editorial features, partner stories, and brand spotlights published on Guiderr.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-slate-200 bg-white">
            <p className="text-slate-500 text-lg">No featured stories are published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {stories.map((story) => (
              <article
                key={story.slug}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <Link
                  to={`/featured/${story.slug}`}
                  className="flex flex-col sm:flex-row min-h-[260px]"
                >
                  {/* ── Image side (45%) ── */}
                  <div className="sm:w-[45%] flex-shrink-0 bg-slate-100">
                    {story.featuredImage ? (
                      <img
                        src={optimizeCloudinaryUrl(story.featuredImage, { width: 700, quality: 'auto:eco' })}
                        alt={story.title}
                        loading="lazy"
                        className="w-full h-56 sm:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-56 sm:h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                    )}
                  </div>

                  {/* ── Content side (55%) — Champagne tint ── */}
                  <div className="sm:w-[55%] bg-[#FAF9F6] px-6 py-7 sm:px-8 sm:py-8 relative overflow-hidden flex flex-col justify-center">

                    {/* Ghost category typography — moves on card hover */}
                    {story.category && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center font-black uppercase text-slate-900 select-none pointer-events-none leading-none transition-transform duration-500 ease-out group-hover:translate-x-6 will-change-transform"
                        style={{
                          fontSize: 'clamp(3rem, 10vw, 7rem)',
                          letterSpacing: '0.15em',
                          opacity: 0.09,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {story.category}
                      </span>
                    )}

                    {/* SPOTLIGHT badge */}
                    <div className="relative z-10 mb-4">
                      <span className="inline-flex items-center px-3 py-[3px] border text-yellow-500 text-[9px] font-bold uppercase tracking-[0.35em] rounded-full backdrop-blur-md bg-white/10 shadow-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.5)' }}>
                        S P O T L I G H T
                      </span>
                    </div>

                    {/* Category label */}
                    {story.category && (
                      <span className="relative z-10 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        {story.category}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="relative z-10 text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug mb-3">
                      {story.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="relative z-10 text-sm leading-[1.7] text-slate-600 mb-5 line-clamp-3">
                      {getStoryExcerpt(story.body)}
                    </p>

                    {/* Meta + Read arrow */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <time dateTime={story.date}>
                          {story.date
                            ? new Date(story.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Coming soon'}
                        </time>
                        {story.author && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{story.author}</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-yellow-700 group-hover:translate-x-1 transition-transform inline-block">
                        Read →
                      </span>
                    </div>

                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* ── CTA banner ── */}
        <div className="mt-14 sm:mt-16 rounded-[2rem] border border-violet-100 bg-white px-6 py-10 sm:px-10 sm:py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Want your brand here?</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Put your story in front of people already researching what to trust next.
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-slate-600">
            Editorial placement for startups, creators, and niche businesses with a story worth telling.
          </p>
          <Link
            to="/get-featured"
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-purple-900 bg-purple-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-purple-950 hover:border-purple-950"
          >
            See how to get featured →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}