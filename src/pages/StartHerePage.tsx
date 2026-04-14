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
      { title: 'Mastering Credit Cards in 2026 — The Frugal Guide', slug: 'mastering-credit-cards-in-2026-a-frugal-guide-to-rewards-risks-and-financial-freedom' },
      { title: 'The Petrol Hack — Turn Your Commute into Free Travel', slug: 'the-petrol-hack-how-to-turn-your-daily-commute-into-free-travel-in-2026' },
      { title: 'Maximizing Rewards — India\'s Top Two Cashback Cards', slug: 'maximizing-rewards-in-2026-the-practical-guide-to-indias-top-two-cashback-cards' },
      { title: 'The Frugal Shield — Why You Need an Emergency Fund', slug: 'the-frugal-shield-why-an-emergency-fund-is-your-most-important-asset-in-2026' },
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
      { title: 'Planning Your Ladakh Motorcycle Trip in 2026', slug: 'the-definitive-guide-planning-your-ladakh-motorcycle-trip-in-2026' },
      { title: 'The Ideal Motorcycle Luggage Setup for 2026', slug: 'the-ideal-load-designing-the-ideal-motorcycle-luggage-setup-for-2026' },
      { title: 'The Great East Expedition — Pune to Sikkim', slug: 'the-great-east-expedition-riding-from-pune-to-sikkim-in-june-2026' },
      { title: 'Hayabusa 2026 — A Modern Masterpiece Review', slug: 'the-2026-review-why-the-metallic-mat-steel-green-suzuki-hayabusa-is-a-modern-masterpiece' },
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
      { title: 'Visa-Free Horizons and UPI Abroad — Travel in 2026', slug: 'the-new-era-of-indian-travel-in-2026-visa-free-horizons-and-upi-abroad' },
      { title: 'Investing in 2026 — Long-Term Wealth for Every Indian', slug: 'investing-in-2026-why-every-indian-needs-a-long-term-wealth-strategy' },
      { title: 'The Asset-Light Revolution — Renting vs Ownership', slug: 'the-asset-light-revolution-why-renting-is-outpacing-ownership-in-2026' },
      { title: 'Small-Space Living — Multifunctional Furniture in 2026', slug: 'small-space-living-how-multifunctional-furniture-is-changing-modern-homes' },
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 mb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
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
