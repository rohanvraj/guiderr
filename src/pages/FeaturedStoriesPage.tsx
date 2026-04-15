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

  return cleaned.length > 130 ? `${cleaned.slice(0, 130)}...` : cleaned;
}

export default function FeaturedStoriesPage() {
  const stories = getAllFeaturedStories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Featured Stories</h1>
        <p className="text-slate-600 mb-10">Editorial features, partner stories, and brand spotlights published on Guiderr.</p>

        {stories.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-slate-100 bg-white">
            <p className="text-slate-500 text-lg">No featured stories are published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <article
                key={story.slug}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {story.featuredImage && (
                  <img
                    src={optimizeCloudinaryUrl(story.featuredImage, { width: 600, quality: 'auto:eco' })}
                    alt={story.title}
                    loading="lazy"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  {story.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {story.category}
                    </span>
                  )}
                  <h2 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {story.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{getStoryExcerpt(story.body)}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
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
                </div>
              </article>
            ))}
          </div>
        )}

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