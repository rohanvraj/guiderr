import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllPosts } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const CATEGORIES = ['All', 'Motorcycles', 'Finance', 'Travel', 'Children', 'Parenting', 'Art'] as const;
type Category = typeof CATEGORIES[number];

export default function BlogListingPage() {
  const posts = getAllPosts();
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  // Pure client-side filter — zero API calls, uses statically bundled post data.
  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Guides</h1>
        <p className="text-slate-600 mb-7">Tips, insights, and deep-dives from the Guiderr team.</p>

        {/* Category filter bar — no router interaction, no ?ref= side-effects */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">
              {activeCategory === 'All'
                ? 'No guides published yet. Check back soon!'
                : `No ${activeCategory} guides yet. More coming soon!`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                to={`/guides/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.featuredImage && (
                  <img
                    src={optimizeCloudinaryUrl(post.featuredImage, { width: 600, quality: 'auto:eco' })}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {post.category}
                    </span>
                  )}
                  <h2 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {post.author && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
