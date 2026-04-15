import { useEffect, useRef, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content: string; // raw markdown string from post.body
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip markdown emphasis and link syntax so ToC labels are clean plain text.
 * Handles: **bold**, *italic*, `code`, [text](url), emoji sequences.
 */
function stripMarkdown(raw: string): string {
  return raw
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')   // bold / italic
    .replace(/`([^`]+)`/g, '$1')                 // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     // [text](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')       // images
    .trim();
}

/**
 * Convert a heading text into a slug that matches the IDs ReactMarkdown generates.
 * ReactMarkdown uses github-slugger behaviour: lowercase, spaces → hyphens, strip specials.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // strip non-word chars
    .replace(/\s+/g, '-')      // spaces → hyphens
    .replace(/-+/g, '-')       // collapse repeated hyphens
    .replace(/^-|-$/g, '');    // trim leading/trailing hyphens
}

/**
 * Parse H2 and H3 lines from a markdown string.
 * Returns an array of { id, text, level } objects.
 */
function parseHeadings(markdown: string): Heading[] {
  const lines = markdown.split('\n');
  const headings: Heading[] = [];

  for (const line of lines) {
    // Match H2 (## ...) and H3 (### ...) — not H4+
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h2) {
      const text = stripMarkdown(h2[1]);
      if (text) headings.push({ id: slugify(text), text, level: 2 });
    } else if (h3) {
      const text = stripMarkdown(h3[1]);
      if (text) headings.push({ id: slugify(text), text, level: 3 });
    }
  }

  return headings;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Scroll-spy via IntersectionObserver ──────────────────────────────────
  useEffect(() => {
    if (headings.length === 0) return;

    // Give ReactMarkdown time to render heading elements before observing
    const timer = setTimeout(() => {
      const elements: Element[] = [];

      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) elements.push(el);
      });

      if (elements.length === 0) return;

      // Track which headings are visible; pick the topmost one
      const visibleSet = new Set<string>();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('id') ?? '';
            if (entry.isIntersecting) {
              visibleSet.add(id);
            } else {
              visibleSet.delete(id);
            }
          });

          // Use the first visible heading (topmost in document order)
          for (const h of headings) {
            if (visibleSet.has(h.id)) {
              setActiveId(h.id);
              return;
            }
          }
        },
        {
          rootMargin: '-80px 0px -60% 0px', // offset for sticky header
          threshold: 0,
        }
      );

      elements.forEach((el) => observerRef.current!.observe(el));
    }, 200);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Nothing to render if the article has no H2/H3 headings
  if (headings.length === 0) return null;

  // ── Click handler ─────────────────────────────────────────────────────────
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      // Offset scroll by 100px to clear the sticky header (h-20 = 80px + top-4 = 16px + buffer).
      // scrollIntoView doesn't support per-element offset, so we use manual scroll.
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  // ── Link list (shared between desktop sidebar and mobile drawer) ──────────
  const LinkList = () => (
    <ul className="space-y-0.5">
      {headings.map((h) => (
        <li key={h.id}>
          <button
            onClick={() => scrollTo(h.id)}
            className={[
              'w-full text-left text-sm leading-snug px-2 py-1.5 rounded transition-colors duration-150',
              h.level === 3 ? 'pl-5' : '',
              activeId === h.id
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
            ].join(' ')}
          >
            {h.text}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── sticky inside the BlogPostPage flex layout ──── */}
      {/* position:sticky (not fixed) so it sits naturally in the two-column   */}
      {/* flex grid and never overlaps article text at any screen width.        */}
      <aside
        aria-label="Table of contents"
        className="hidden lg:block sticky top-32 self-start shrink-0 w-52 max-h-[calc(100vh-10rem)] overflow-y-auto"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">
          On this page
        </p>
        <LinkList />
      </aside>

      {/* ── MOBILE FLOATING PILL ── fixed bottom-right, toggles drawer ──────── */}
      <div className="lg:hidden fixed bottom-6 right-4 z-40">
        {/* Collapse drawer above the pill */}
        {mobileOpen && (
          <div className="absolute bottom-12 right-0 w-72 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-4 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              On this page
            </p>
            <LinkList />
          </div>
        )}

        {/* The pill button */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle table of contents"
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all duration-150"
        >
          {/* Simple list icon — no icon library, just 3 SVG lines */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="1" y1="3" x2="13" y2="3" />
            <line x1="1" y1="7" x2="13" y2="7" />
            <line x1="1" y1="11" x2="13" y2="11" />
          </svg>
          {mobileOpen ? 'Close' : 'Quick Nav'}
        </button>
      </div>
    </>
  );
}
