import Header from '../components/Header';
import Footer from '../components/Footer';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

const FEATURED_MAILTO_URL = 'mailto:rohanrworld@gmail.com?subject=Collaboration%20Request%3A%20%5BYour%20Name%2FBusiness%5D&body=Hi%20Guiderr%2C%0D%0A%0D%0AI%27m%20interested%20in%20getting%20featured%20on%20Guiderr.%20Here%20are%20some%20brief%20details%3A%0D%0A%0D%0A-%20Business%2FTopic%20Name%3A%0D%0A-%20Category%20(Finance%2FAutomotive%2Fetc)%3A%0D%0A-%20Social%2FWebsite%20Link%3A%0D%0A-%20Brief%20description%20of%20the%20story%20or%20expertise%3A%0D%0A%0D%0ALooking%20forward%20to%20hearing%20from%20you!';

interface FeaturedStory {
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
  featuredImage: string;
  body: string;
}

function parseFrontmatter(raw: string): { metadata: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: raw };

  const metadata: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) metadata[key] = value;
  }

  return { metadata, body: match[2] };
}

const featuredModules = import.meta.glob('/src/content/featured/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getAllFeaturedStories(): FeaturedStory[] {
  return Object.entries(featuredModules)
    .map(([filepath, raw]) => {
      const { metadata, body } = parseFrontmatter(raw);
      const slug = filepath.split('/').pop()?.replace('.md', '') ?? '';

      return {
        slug,
        title: metadata.title || 'Untitled',
        date: metadata.date || '',
        category: metadata.category || 'Featured Story',
        author: metadata.author || '',
        featuredImage: metadata.featured_image || '',
        body,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

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

        <div className="mt-14 sm:mt-16 rounded-[2rem] border border-slate-200 bg-white px-6 py-10 sm:px-10 sm:py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Want your business to appear here?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-slate-600">
            If these stories reflect the kind of visibility you want, send us your context and we will review the fit.
          </p>
          <a
            href={FEATURED_MAILTO_URL}
            className="mt-6 inline-flex items-center justify-center gap-3 rounded-full border border-purple-900 bg-purple-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-purple-950 hover:border-purple-950"
          >
            Connect with us to get featured
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}