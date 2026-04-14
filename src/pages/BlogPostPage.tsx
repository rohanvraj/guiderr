import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TableOfContents from '../components/TableOfContents';
import { getPostBySlug } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  // ── JSON-LD Article Schema + meta description (Day 4 SEO Hardening) ──────
  // Fires only when a valid post is found. No library needed.
  useEffect(() => {
    if (!post) return;

    // Meta description
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    const descContent = post.body
      .replace(/[#*`[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);
    if (meta) meta.content = descContent;

    // Page title (keyword-first pattern)
    const prevTitle = document.title;
    document.title = `${post.title} | Guiderr`;

    // JSON-LD Article schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-schema';
    const imageUrl = post.featuredImage
      ? optimizeCloudinaryUrl(post.featuredImage, { width: 1200, quality: 'auto:eco' })
      : 'https://guiderr.in/images/guiderr-logo.png';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Person',
        name: post.author || 'Rohan',
        url: 'https://guiderr.in/about',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Guiderr',
        url: 'https://guiderr.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://guiderr.in/images/guiderr-logo.png',
        },
      },
      image: imageUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://guiderr.in/guides/${slug}`,
      },
    });
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      if (meta) meta.content = prevDesc;
      document.getElementById('article-schema')?.remove();
    };
  }, [post, slug]);

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

      {/* ToC: fixed desktop sidebar + mobile floating pill — rendered at page level so position:fixed works correctly */}
      <TableOfContents content={post.body} />

      {/* pb-24 on mobile ensures the last CTA/affiliate link is never hidden behind the fixed ToC pill */}
      <main className="pt-28 sm:pt-32 pb-24 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
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
        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-p:leading-[1.75]">
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
              // ── Tap-target hardening (Day 7) ────────────────────────────────────
              // External text-link CTAs ("👉 Check Price on Amazon" etc.) get
              // py-2 inline-block so the touch target is ≥44px tall on mobile.
              // Image-wrapped affiliate links are already tall enough — skip.
              a: ({ href, children }) => {
                const isExternal = !!href?.startsWith('http') && !href.includes('guiderr.in');
                if (!isExternal) return <a href={href}>{children}</a>;

                // Detect image-only links (e.g. [![alt](src)](href))
                const childArr = React.Children.toArray(children);
                const isSingleImage =
                  childArr.length === 1 &&
                  React.isValidElement(childArr[0]) &&
                  childArr[0].type === 'img';

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={isSingleImage ? undefined : 'py-2 inline-block'}
                  >
                    {children}
                  </a>
                );
              },
              // Inject id attributes on H2/H3 so IntersectionObserver can find them
              h2: ({ children }) => {
                const text = String(children).replace(/[^\w\s-]/g, '').trim();
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const text = String(children).replace(/[^\w\s-]/g, '').trim();
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
                return <h3 id={id}>{children}</h3>;
              },
            }}
          >
            {post.body}
          </ReactMarkdown>
        </article>

        {/* ── Fine Print ── */}
        {(() => {
          const isFinanceOrAuto = ['Finance', 'Automotive'].includes(post.category ?? '');
          return (
            <>
              <hr className="mt-10 border-gray-200" />
              <div className="mt-3 space-y-1 text-[10px] text-gray-400 leading-relaxed">
                {isFinanceOrAuto ? (
                  <>
                    <p>
                      <span className="font-semibold">ADVISORY:</span> Information regarding
                      financial products or vehicles (features, rewards, and pricing) is for
                      informational purposes and is subject to change by the issuing bank or
                      manufacturer without notice. Guiderr does not guarantee the availability of
                      any features mentioned.
                    </p>
                    <p>
                      <span className="font-semibold">VERIFICATION:</span> Users must consult an
                      official bank representative or product expert for any doubts, clarifications,
                      or the latest terms before making an application or purchase.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-semibold">ADVISORY:</span> Guiderr is an educational
                      platform. All content is provided for informational purposes only. Action
                      taken is at your own risk.
                    </p>
                    <p>
                      <span className="font-semibold">VERIFICATION:</span> We recommend consulting
                      a professional in the relevant field for specific advice.
                    </p>
                  </>
                )}
                <p>
                  <span className="font-semibold">LIABILITY:</span> Guiderr and its authors are
                  not liable for any losses, accidents, or damages in connection with the use of
                  our website.
                </p>
                <p>
                  <span className="font-semibold">AFFILIATE:</span> As an Amazon Associate,
                  Guiderr earns from qualifying purchases at no extra cost to you.
                </p>
              </div>
              <p className="mt-2 text-[10px] text-gray-400">
                Have an issue or found an error?{" "}
                <a
                  href="mailto:rohanrworld@gmail.com"
                  className="underline-offset-2 hover:underline"
                >
                  Get in touch with us.
                </a>
              </p>
            </>
          );
        })()}
      </main>

      <Footer />
    </div>
  );
}
