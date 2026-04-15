import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartLineUp,
  Moped,
  GlobeHemisphereWest,
} from '@phosphor-icons/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ── Article clusters — static, zero Supabase calls ──────────────────────────
// TRUTH PASS: slugs = full filename (without .md) as returned by getPostBySlug.
// The date prefix (2026-04-XX-) is REQUIRED — blog.ts uses the raw filename as slug.
// Last verified: 14 April 2026 against src/content/blog/*.md
const PATHS = [
  {
    key: 'money',
    icon: ChartLineUp,
    color: '#0d9488',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    label: 'Money',
    tagline: 'Smarter cards. Bigger returns. Zero guesswork.',
    articles: [
      { title: 'ITR 2026: New Tax Rules & the ₹75,000 Deduction', slug: '2026-04-13-itr-2026-new-tax-rules-₹75-000-deduction-why-april-is-the-smartest-month-to-invest' },
      { title: 'Why Your Credit Card Was Rejected — And How to Fix It', slug: '2026-04-13-understanding-credit-card-rejections-in-2026-how-to-build-your-cibil-for-sbi-and-hdfc-approval' },
      { title: 'Mastering Credit Cards in 2026 — The Frugal Guide', slug: '2026-04-02-mastering-credit-cards-in-2026-a-frugal-guide-to-rewards-risks-and-financial-freedom' },
      { title: 'The Petrol Hack — Turn Your Commute into Free Travel', slug: '2026-04-10-the-petrol-hack-how-to-turn-your-daily-commute-into-free-travel-in-2026' },
    ],
    ebookLabel: 'The Credit Card Playbook →',
    ebookHref: '/#featured',
  },
  {
    key: 'wheels',
    icon: Moped,
    color: '#475569',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: 'Wheels',
    tagline: 'Ride further. Pack smarter. Know your machine.',
    articles: [
      { title: 'Planning Your Ladakh Motorcycle Trip in 2026', slug: '2026-04-03-the-definitive-guide-planning-your-ladakh-motorcycle-trip-in-2026' },
      { title: 'The Ideal Motorcycle Luggage Setup for 2026', slug: '2026-04-09-the-ideal-load-designing-the-ideal-motorcycle-luggage-setup-for-2026' },
      { title: 'The Great East Expedition — Pune to Sikkim', slug: '2026-04-12-the-great-east-expedition-riding-from-pune-to-sikkim-in-june-2026' },
      { title: 'Hayabusa 2026 — A Modern Masterpiece Review', slug: '2026-04-09-the-2026-review-why-the-metallic-mat-steel-green-suzuki-hayabusa-is-a-modern-masterpiece' },
    ],
    ebookLabel: 'The Himalayan Blueprint →',
    ebookHref: '/#featured',
  },
  {
    key: 'life',
    icon: GlobeHemisphereWest,
    color: '#2563eb',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Life',
    tagline: 'Travel cheaper. Live smarter. Buy once, buy right.',
    articles: [
      // Travel
      { title: 'Visa-Free Horizons and UPI Abroad — Travel in 2026', slug: '2026-04-04-the-new-era-of-indian-travel-in-2026-visa-free-horizons-and-upi-abroad' },
      // Finance / life planning
      { title: 'The Frugal Shield — Why an Emergency Fund Is Non-Negotiable', slug: '2026-04-13-the-frugal-shield-why-an-emergency-fund-is-your-most-important-asset-in-2026' },
      // Tech
      { title: 'The Automated Home — Top Robot Vacuums on Amazon 2026', slug: '2026-04-10-the-automated-home-top-5-robot-vacuum-mop-solutions-on-amazon-2026' },
      // Business
      { title: 'Smart Queue Management & the Indian Dining Revolution', slug: '2026-04-08-beyond-the-plate-how-smart-queue-management-is-redefining-the-indian-dining-experience-in-2026' },
      // Lifestyle
      { title: 'Best Sunscreens for the Indian Climate in 2026', slug: '2026-04-09-a-guide-to-popular-sunscreens-for-the-indian-climate-in-2026' },
    ],
    ebookLabel: 'Browse All Guides →',
    ebookHref: '/guides',
  },
] as const;

export default function StartHerePage() {
  // Lightweight meta injection — no library needed
  useEffect(() => {
    const prev = document.title;
    document.title = 'Start Here | Guiderr — Smarter Decisions for India\'s Modern Buyer';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) meta.content = 'New to Guiderr? This page routes you to the best articles, guides, and intelligence reports across Money, Wheels, and Life. Start your smarter-buyer journey here.';
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Hero Block ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-4">
            Welcome
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            New to Guiderr?<br className="hidden sm:block" /> Start Here.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            We help India's modern buyer make better decisions in Money, Wheels, and Life —
            with honest guides, real math, and zero brand bribes.
          </p>
        </div>

        {/* ── 3-Path Decision Map ── */}
        <section aria-labelledby="paths-heading" className="mb-20">
        <h2 id="paths-heading" className="sr-only">Browse by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PATHS.map(({ key, icon: Icon, color, bg, border, label, tagline, articles, ebookLabel, ebookHref }) => (
            <div
              key={key}
              className={`relative rounded-[2rem] border ${border} ${bg} p-7 flex flex-col gap-5 overflow-hidden`}
            >
              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm"
                  style={{ color }}
                >
                  <Icon size={22} weight="duotone" />
                </span>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">{label}</span>
              </div>

              {/* Tagline */}
              <p className="text-sm text-slate-500 leading-snug -mt-2">{tagline}</p>

              {/* Article list */}
              <ul className="flex flex-col gap-2">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/guides/${a.slug}`}
                      className="text-sm text-slate-700 hover:text-slate-900 hover:underline underline-offset-2 leading-snug transition-colors"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Ebook CTA */}
              <Link
                to={ebookHref}
                className="mt-auto inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color }}
              >
                {ebookLabel}
              </Link>
            </div>
          ))}
        </div>
        </section>

        {/* ── Philosophy ── */}
        <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 text-white mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 mb-4">
            Our stance
          </p>
          <blockquote className="text-xl sm:text-2xl font-bold leading-snug mb-6 max-w-2xl">
            "We are reader-supported. We use affiliate links and sell intelligence reports.
            We don't take brand bribes. We don't recommend what we wouldn't buy ourselves."
          </blockquote>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            When you click an affiliate link in our articles, we may earn a small commission from
            the partner — at zero extra cost to you. This is how Guiderr stays free to read.
            Our editorial judgment is never for sale.{' '}
            <Link to="/affiliate-disclosure" className="text-slate-300 hover:text-white underline underline-offset-2 transition-colors">
              Full disclosure →
            </Link>
          </p>
        </div>

        {/* ── About + Nav CTA ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            About the founder →
          </Link>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-semibold px-8 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
          >
            Browse all guides →
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
