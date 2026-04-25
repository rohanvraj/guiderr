import { useEffect, Children, isValidElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TableOfContents from '../components/TableOfContents';
import ArticleFooter from '../components/ArticleFooter';
import InlineBuyBrief from '../components/InlineBuyBrief';
import { getPostBySlug, getFeaturedStoryBySlug } from '../utils/blog';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

// ── Heading ID helpers ────────────────────────────────────────────────────────
// String(children) fails for complex heading nodes (bold, emoji, etc.) — it
// returns "[object Object]". This recursive extractor walks the React tree and
// produces the same plain-text output that TableOfContents.slugify() expects.
function extractHeadingText(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractHeadingText).join('');
  if (isValidElement(node as object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return extractHeadingText((node as any).props?.children ?? '');
  }
  return '';
}

function makeHeadingId(children: unknown): string {
  return extractHeadingText(children)
    .replace(/[^\w\s-]/g, '') // strip emoji and special chars (matches TableOfContents slugify)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const blogPost = slug ? getPostBySlug(slug) : undefined;
  const featuredStory = slug ? getFeaturedStoryBySlug(slug) : undefined;
  const post = blogPost ?? featuredStory;
  const isFeatured = !!featuredStory && !blogPost;

  // Draft gate: only allow draft posts when running on localhost.
  const isDraft = blogPost?.status === 'draft';
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const blockedDraft = isDraft && !isLocalhost;

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
      : 'https://guiderr.in/images/guiderr-logo.webp';
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
          url: 'https://guiderr.in/images/guiderr-logo.webp',
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

  if (!post || blockedDraft) {
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
    <div className={`min-h-screen ${isFeatured ? 'bg-[#FAF9F7]' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
      <Header />

      {/*
        Two-column layout: [ToC sticky sidebar | Article] on desktop.
        - max-w-5xl wrapper = 1024px. ToC = w-52 (208px) + gap-12 (48px) = 256px.
        - Article gets the remaining 768px = max-w-3xl. No overlap at any lg+ screen.
        - On mobile: ToC renders its fixed "Quick Nav" pill only; article takes full width.
      */}
      <div data-article-body className="pt-28 sm:pt-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:max-w-5xl lg:flex lg:gap-12 items-start">

          {/* TableOfContents: desktop = sticky sidebar (inside flex); mobile = fixed pill */}
          <TableOfContents content={post.body} />

          {/* pb-24 on mobile ensures last CTA clears the fixed Quick Nav pill */}
          <main className="min-w-0 flex-1 max-w-3xl pb-24 sm:pb-10">
            <Link to={isFeatured ? '/featured' : '/guides'} className="no-print text-sm text-indigo-600 hover:underline mb-6 inline-block">
              &larr; Back to {isFeatured ? 'Featured Stories' : 'Guides'}
            </Link>

            {/* Gold Spotlight badge for featured articles */}
            {isFeatured && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-[3px] border text-yellow-500 text-[9px] font-bold uppercase tracking-[0.35em] rounded-full backdrop-blur-md bg-white/10 shadow-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.5)' }}>
                  S P O T L I G H T
                </span>
              </div>
            )}

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
        <article className={`prose prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-p:leading-[1.75]${isFeatured ? ' featured-lead' : ''}`}>
          <ReactMarkdown
            urlTransform={(url) => url}
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
              // Text-link affiliate CTAs ("👉 Check Price on Amazon" etc.) get
              // py-2 inline-block so touch targets are ≥44px on mobile.
              // Image-wrapped links are already large enough — skip the padding.
              a: ({ href, children }) => {
                // ── Intelligence Brief shortcode ─────────────────────────────
                // Usage in Decap CMS: [Buy the Full Report →](buy:UUID-HERE)
                // Optional custom label from link text; UUID is immutable.
                if (href?.startsWith('buy:')) {
                  const productId = href.slice(4).trim();
                  const label = typeof children === 'string' ? children : undefined;
                  return <InlineBuyBrief productId={productId} label={label} />;
                }

                const isExternal = !!href?.startsWith('http') && !href.includes('guiderr.in');
                if (!isExternal) return <a href={href}>{children}</a>;

                const childArr = Children.toArray(children);
                const isSingleImage =
                  childArr.length === 1 &&
                  isValidElement(childArr[0]) &&
                  (childArr[0] as React.ReactElement).type === 'img';

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
              // Inject id attributes on H2/H3 so IntersectionObserver can find them.
              // makeHeadingId() uses extractHeadingText() to handle bold/emoji nodes
              // where String(children) would return "[object Object]".
              h2: ({ children }) => {
                const id = makeHeadingId(children);
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const id = makeHeadingId(children);
                return <h3 id={id}>{children}</h3>;
              },
              // ── Premium Design Modules ────────────────────────────────────────
              // Transforms blockquotes (>) into styled callout boxes based on
              // their opening keyword:  INSIGHT: / THE BOTTOM LINE: / REALITY CHECK:
              // The trigger keyword is automatically rendered in bold.
              blockquote: ({ children }) => {
                const text = extractHeadingText(children).trim();

                // Renders the trigger keyword as a small all-caps label pill
                // above the body text, giving a magazine-sidebar aesthetic.
                function withLabeledKeyword(keyword: string, labelColor: string): React.ReactNode {
                  // Strip trailing colon from the displayed label
                  const label = keyword.replace(/:$/, '');
                  let firstDone = false;
                  return Children.map(children, (child) => {
                    // Drop ALL bare string nodes at the blockquote level.
                    // ReactMarkdown wraps real content in <p>/<li>/etc. so
                    // raw strings here are only whitespace or the keyword
                    // fragment itself — either way they must not render.
                    if (typeof child === 'string') return null;
                    if (!firstDone && isValidElement(child) && (child as React.ReactElement).type === 'p') {
                      firstDone = true;
                      const raw = extractHeadingText((child as React.ReactElement<{ children: unknown }>).props.children);
                      const after = raw.startsWith(keyword) ? raw.slice(keyword.length).trimStart() : raw;
                      return (
                          <p className="mb-1">
                            <span className="block text-[10px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: labelColor }}>
                              {label}
                            </span>
                            <span className="block mb-3" style={{ width: '20px', height: '2px', backgroundColor: labelColor }} />
                            {after}
                          </p>
                      );
                    }
                    return child;
                  });
                }

                if (text.startsWith('INSIGHT:')) {
                  return (
                    <div className="dm-pro-tip">
                      {withLabeledKeyword('INSIGHT:', 'var(--dm-accent-pro)')}
                    </div>
                  );
                }
                if (text.startsWith('THE BOTTOM LINE:')) {
                  return (
                    <div className="dm-math">
                      {withLabeledKeyword('THE BOTTOM LINE:', 'var(--dm-accent-math)')}
                    </div>
                  );
                }
                if (text.startsWith('REALITY CHECK:')) {
                  return (
                    <div className="dm-risk-audit">
                      {withLabeledKeyword('REALITY CHECK:', 'var(--dm-accent-risk)')}
                    </div>
                  );
                }
                if (text.startsWith('AI COMPANION:')) {
                  return (
                    <div className="dm-ai-companion">
                      {withLabeledKeyword('AI COMPANION:', 'var(--dm-accent-ai)')}
                    </div>
                  );
                }
                if (text.startsWith('BLUEPRINT:')) {
                  return (
                    <div className="dm-blueprint">
                      {withLabeledKeyword('BLUEPRINT:', 'var(--dm-accent-blueprint)')}
                    </div>
                  );
                }
                return (
                  <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {post.body}
          </ReactMarkdown>
        </article>

        {/* ── Fine Print ── */}
        {(() => {
          return (
            <>
              <hr className="mt-10 border-gray-200" />
              <div className="mt-3 space-y-1 text-[10px] text-gray-400 leading-relaxed">
                <p>
                  <span className="font-semibold">ADVISORY:</span> Guiderr is an educational and
                  informational platform only. We are NOT SEBI-registered advisors; content
                  regarding financial products, investments, or technology is for informational
                  purposes and does not constitute professional advice. Features, rewards, pricing,
                  and technical specifications are accurate to the best of our knowledge at
                  publication but are subject to change by the issuing bank or manufacturer without
                  notice. Guiderr does not guarantee the availability of any features mentioned.
                </p>
                <p>
                  <span className="font-semibold">VERIFICATION:</span> We strongly recommend users
                  independently consult an official bank representative, product expert, or
                  qualified professional to verify the latest terms, full specification sheets, and
                  warranty details before making an application or purchase.
                </p>
                <p>
                  <span className="font-semibold">LIABILITY:</span> Guiderr and its authors are
                  not liable for any financial losses, hardware failures, software limitations,
                  accidents, or damages in connection with the use of our website or inaccuracies
                  in third-party data.
                </p>
                <p>
                  <span className="font-semibold">AFFILIATE:</span> As an Affiliate Partner,
                  Guiderr earns a commission from successful applications or qualifying purchases
                  at no extra cost to you.
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

            {/* ── "Next Steps" Footer ── */}
            <ArticleFooter category={post.category} />
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
