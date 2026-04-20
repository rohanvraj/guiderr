import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// Maps frontmatter category → the dedicated Hub URL (clean, SEO-friendly).
const CATEGORY_BLOG_URL: Record<string, string> = {
  Finance:     '/personal-finance',
  Investing:   '/investing',
  Automotive:  '/automotive',
  Motorcycles: '/automotive',
  Travel:      '/travel',
  Tech:        '/tech',
  Lifestyle:   '/lifestyle',
  Business:    '/business',
};

// Human-readable label overrides (blog display + CTA copy).
const CATEGORY_DISPLAY: Record<string, string> = {
  Finance:     'Personal Finance',
  Motorcycles: 'Automotive',
};

// Maps frontmatter category → the Library category pill query param.
// This is the value that /library?category=X expects to filter products.
const CATEGORY_LIBRARY_PARAM: Record<string, string> = {
  Finance:     'Finance',
  Investing:   'Finance',
  Automotive:  'Motorcycles',
  Motorcycles: 'Motorcycles',
  Travel:      'Travel',
  Tech:        'Gadget & Tech',
  Lifestyle:   'Lifestyle',
  Business:    'Business',
};

interface ArticleFooterProps {
  category?: string;
}

export default function ArticleFooter({ category }: ArticleFooterProps) {
  const blogUrl = category ? (CATEGORY_BLOG_URL[category] ?? '/guides') : '/guides';
  const displayLabel = category ? (CATEGORY_DISPLAY[category] ?? category) : 'All Topics';

  // Library link: /library?category=Motorcycles (etc.) or /library for unknown categories
  const libraryParam = category ? (CATEGORY_LIBRARY_PARAM[category] ?? '') : '';
  const libraryUrl = libraryParam ? `/library?category=${encodeURIComponent(libraryParam)}` : '/library';
  const libraryLabel = (CATEGORY_DISPLAY[libraryParam] ?? libraryParam) || 'All';

  return (
    <section aria-label="Article next steps" className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-6">
        Where to go next
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        {/* Window 1 — Topical Retention (already working) */}
        <Link
          to={blogUrl}
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
            Continue reading
          </span>
          <span className="text-base font-bold text-slate-900">{displayLabel} Articles →</span>
          <span className="text-sm text-slate-500 leading-snug">
            More guides from the {displayLabel} desk.
          </span>
        </Link>

        {/* Window 2 — Revenue: Category Hub Link (zero DB hits) */}
        <Link
          to={libraryUrl}
          className="group flex flex-col gap-2 rounded-2xl border border-white/20 bg-[#7178AB] p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 no-underline overflow-hidden relative"
        >
          {/* Ghost icon drift — pure CSS, no Framer Motion */}
          <span
            aria-hidden
            className="absolute -right-2 -bottom-2 pointer-events-none select-none transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
          >
            <BookOpen className="w-16 h-16 text-white/10" strokeWidth={1.5} />
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60 group-hover:text-white/80 transition-colors">
            The Intelligence Vault
          </span>

          <span className="text-base font-bold text-white leading-snug">
            Browse {libraryLabel} Briefs →
          </span>

          <span className="text-sm text-white/70 leading-snug">
            Access all premium frameworks and checklists for {libraryLabel}.
          </span>
        </Link>

        {/* Window 3 — Authority: Featured Stories (already working) */}
        <Link
          to="/featured"
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
            Featured Stories
          </span>
          <span className="text-base font-bold text-slate-900">Creator Spotlights →</span>
          <span className="text-sm text-slate-500 leading-snug">
            Insights from the startups and creators moving India forward.
          </span>
        </Link>
      </div>
    </section>
  );
}
