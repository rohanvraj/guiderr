import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllPosts } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Guides</h1>
        <p className="text-slate-600 mb-10">Tips, insights, and deep-dives from the Guiderr team.</p>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No guides published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(post.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
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
