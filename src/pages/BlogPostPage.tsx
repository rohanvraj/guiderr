import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPostBySlug } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />
        <main className="pt-28 sm:pt-32 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h1>
          <Link to="/guides" className="text-indigo-600 hover:underline">
            &larr; Back to Guides
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="pt-28 sm:pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <Link to="/guides" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Back to Guides
        </Link>

        {post.category && (
          <span className="block text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-3">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Magazine-style meta line: date • author */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
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
              <span>By {post.author}</span>
            </>
          )}
        </div>

        {post.featuredImage && (
          <img
            src={optimizeCloudinaryUrl(post.featuredImage, { width: 1200, quality: 'auto:eco' })}
            alt={post.title}
            className="w-full rounded-2xl mb-6"
          />
        )}

        {/* ── Markdown Body ── */}
        {/* Feather-Weight: every inline img is a bare Cloudinary Public ID.
            optimizeCloudinaryUrl builds the full CDN URL with f_auto,q_auto:eco,w_800
            so browsers get WebP/AVIF automatically. loading=lazy protects bandwidth. */}
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl">
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => (
                <img
                  src={optimizeCloudinaryUrl(src, { width: 800, quality: 'auto:eco' })}
                  alt={alt || ''}
                  loading="lazy"
                  className="rounded-xl shadow-md my-8 mx-auto block max-w-full h-auto"
                />
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
