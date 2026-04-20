import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartLineUp,
  Moped,
  GlobeHemisphereWest,
  TrendUp,
} from '@phosphor-icons/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function FadeSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: 'both',
      }}
    >
      <div className="animate-fade-in-up">{children}</div>
    </div>
  );
}

// ── Article clusters — static, zero Supabase calls ──────────────────────────
// TRUTH PASS: slugs = full filename (without .md) as returned by getPostBySlug.
// The date prefix (2026-04-XX-) is REQUIRED — blog.ts uses the raw filename as slug.
// Last verified: 14 April 2026 against src/content/blog/*.md
const PATHS = [
  {
    key: 'personal-finance',
    icon: ChartLineUp,
    color: '#0d9488',
    label: 'Personal Finance',
    ghost: 'FINANCE',
    tagline: 'Smarter cards. Better credit. Zero guesswork.',
    articles: [
      { title: 'Why Your Credit Card Was Rejected — And How to Fix It', slug: '2026-04-13-understanding-credit-card-rejections-in-2026-how-to-build-your-cibil-for-sbi-and-hdfc-approval' },
      { title: 'Mastering Credit Cards in 2026 — The Frugal Guide', slug: '2026-04-02-mastering-credit-cards-in-2026-a-frugal-guide-to-rewards-risks-and-financial-freedom' },
      { title: 'The Petrol Hack — Turn Your Commute into Free Travel', slug: '2026-04-10-the-petrol-hack-how-to-turn-your-daily-commute-into-free-travel-in-2026' },
      { title: 'The Frugal Shield — Why an Emergency Fund Is Non-Negotiable', slug: '2026-04-13-the-frugal-shield-why-an-emergency-fund-is-your-most-important-asset-in-2026' },
    ],
    guideLink: '/personal-finance',
  },
  {
    key: 'investing',
    icon: TrendUp,
    color: '#059669',
    label: 'Investing',
    ghost: 'INVESTING',
    tagline: 'Equity research. Intrinsic value. Long-term wealth.',
    articles: [
      { title: 'Investing in 2026: Every Indian Needs a Long-Term Wealth Strategy', slug: '2026-04-05-investing-in-2026-why-every-indian-needs-a-long-term-wealth-strategy' },
      { title: 'ITR 2026: New Tax Rules & the ₹75,000 ELSS Window', slug: '2026-04-13-itr-2026-new-tax-rules-₹75-000-deduction-why-april-is-the-smartest-month-to-invest' },
    ],
    guideLink: '/investing',
  },
  {
    key: 'wheels',
    icon: Moped,
    color: '#475569',
    label: 'Automotive',
    ghost: 'AUTOMOTIVE',
    tagline: 'Ride further. Pack smarter. Know your machine.',
    articles: [
      { title: 'Planning Your Ladakh Motorcycle Trip in 2026', slug: '2026-04-03-the-definitive-guide-planning-your-ladakh-motorcycle-trip-in-2026' },
      { title: 'The Ideal Motorcycle Luggage Setup for 2026', slug: '2026-04-09-the-ideal-load-designing-the-ideal-motorcycle-luggage-setup-for-2026' },
      { title: 'The Great East Expedition — Pune to Sikkim', slug: '2026-04-12-the-great-east-expedition-riding-from-pune-to-sikkim-in-june-2026' },
      { title: 'Hayabusa 2026 — A Modern Masterpiece Review', slug: '2026-04-09-the-2026-review-why-the-metallic-mat-steel-green-suzuki-hayabusa-is-a-modern-masterpiece' },
    ],
    guideLink: '/automotive',
  },
  {
    key: 'life',
    icon: GlobeHemisphereWest,
    color: '#2563eb',
    label: 'Lifestyle',
    ghost: 'LIFESTYLE',
    tagline: 'Travel cheaper. Live smarter. Buy once, buy right.',
    articles: [
      { title: 'Visa-Free Horizons and UPI Abroad — Travel in 2026', slug: '2026-04-04-the-new-era-of-indian-travel-in-2026-visa-free-horizons-and-upi-abroad' },
      { title: 'The Frugal Shield — Why an Emergency Fund Is Non-Negotiable', slug: '2026-04-13-the-frugal-shield-why-an-emergency-fund-is-your-most-important-asset-in-2026' },
      { title: 'The Automated Home — Top Robot Vacuums on Amazon 2026', slug: '2026-04-10-the-automated-home-top-5-robot-vacuum-mop-solutions-on-amazon-2026' },
      { title: 'Smart Queue Management & the Indian Dining Revolution', slug: '2026-04-08-beyond-the-plate-how-smart-queue-management-is-redefining-the-indian-dining-experience-in-2026' },
      { title: 'Best Sunscreens for the Indian Climate in 2026', slug: '2026-04-09-a-guide-to-popular-sunscreens-for-the-indian-climate-in-2026' },
    ],
    guideLink: '/lifestyle',
  },
];

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
    <div className="min-h-screen bg-purple-900">
      <Header />

      <main className="pt-32 sm:pt-36 lg:pt-40">

        {/* ── Hero ── */}
        <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <FadeSection>
              <div className="inline-flex items-center rounded-full border border-purple-700 bg-white/10 px-4 py-2 text-sm font-medium text-purple-50 shadow-sm backdrop-blur-sm">
                Welcome to Guiderr
              </div>
            </FadeSection>

            <FadeSection delay={0.06} className="mt-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98] text-white">
                New to Guiderr?<br className="hidden sm:block" /> Start Reading Here.
              </h1>
            </FadeSection>

            <FadeSection delay={0.12} className="mt-6">
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl leading-10 text-purple-100">
                We publish honest articles and blogs to help India's modern buyer make better decisions in Personal Finance, Automobiles, and Lifestyle.
              </p>
            </FadeSection>
          </div>
        </section>

        {/* ── 3-Path Cards ── */}
        <section aria-labelledby="paths-heading" className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
          <h2 id="paths-heading" className="sr-only">Browse by Topic</h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {PATHS.map(({ key, icon: Icon, color, label, ghost, tagline, articles, guideLink }, index) => (
                <FadeSection key={key} delay={index * 0.06}>
                  <article className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white/80 p-8 shadow-[0_16px_50px_rgba(124,58,237,0.06)] transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(124,58,237,0.12)] sm:p-10">
                    <span className="pointer-events-none absolute -right-1 top-4 select-none text-[3.8rem] font-black uppercase tracking-[-0.1em] text-slate-900/[0.04] transition-transform duration-500 group-hover:translate-x-4 group-hover:text-purple-600/10 sm:text-[4.75rem]">
                      {ghost}
                    </span>

                    {/* Icon + Label */}
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-violet-100 bg-violet-50 shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ color }}
                      >
                        <Icon size={22} weight="duotone" />
                      </span>
                      <span className="font-semibold text-slate-900 text-xl tracking-tight">{label}</span>
                    </div>

                    {/* Tagline */}
                    <p className="relative z-10 text-sm text-slate-500 leading-relaxed mb-6 max-w-[16rem]">{tagline}</p>

                    {/* Article list */}
                    <ul className="relative z-10 flex flex-col gap-3 flex-1">
                      {articles.map((a) => (
                        <li key={a.slug}>
                          <Link
                            to={`/guides/${a.slug}`}
                            className="text-sm text-slate-700 hover:text-slate-900 leading-snug transition-colors flex items-start gap-2 group/link"
                          >
                            <span className="text-slate-300 mt-0.5 flex-shrink-0 group-hover/link:text-slate-500 transition-colors">→</span>
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Browse all guide link */}
                    <Link
                      to={guideLink}
                      className="relative z-10 mt-6 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
                      style={{ color }}
                    >
                      All {label} Guides →
                    </Link>
                  </article>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Philosophy / Stance ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
          <FadeSection>
            <div className="max-w-4xl mx-auto rounded-3xl border border-violet-100 bg-white/80 px-8 py-12 sm:px-12 sm:py-14 shadow-[0_18px_60px_rgba(124,58,237,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">
                Our Stance
              </p>
              <blockquote className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug text-slate-900 mb-6 max-w-2xl">
                "We are reader-supported. We use affiliate links and sell intelligence reports.
                We don't take brand bribes. We don't recommend what we wouldn't buy ourselves."
              </blockquote>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                When you click an affiliate link in our articles, we may earn a small commission from
                the partner — at zero extra cost to you. This is how Guiderr stays free to read.
                Our editorial judgment is never for sale.{' '}
                <Link to="/affiliate-disclosure" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
                  Full disclosure →
                </Link>
              </p>
            </div>
          </FadeSection>
        </section>

        {/* ── Footer CTAs ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-28 sm:pb-36">
          <FadeSection>
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-purple-700 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                About the founder →
              </Link>
              <Link
                to="/guides"
                className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-8 py-4 text-sm font-semibold text-slate-900 transition-all hover:bg-white"
              >
                Browse all guides →
              </Link>
            </div>
          </FadeSection>
        </section>

      </main>

      <Footer />
    </div>
  );
}
