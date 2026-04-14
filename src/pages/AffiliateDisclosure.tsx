import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AffiliateDisclosure() {
  // Lightweight meta injection — no library needed
  useEffect(() => {
    const prev = document.title;
    document.title = 'Affiliate Disclosure | Guiderr';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) meta.content = 'Guiderr uses affiliate links from EarnKaro, Amazon, and other partners. Our editorial recommendations are never influenced by commissions. Read our full disclosure here.';
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Header ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 mb-4">
            Transparency
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            Affiliate Disclosure
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Guiderr is reader-supported. Here is exactly how we make money — and how it does and does not affect what we write.
          </p>
        </div>

        {/* ── Content ── */}
        <div className="space-y-10 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">What are affiliate links?</h2>
            <p>
              Some links on Guiderr are affiliate links. If you click one and make a purchase or sign up for a product,
              we may receive a small commission from the partner — at <strong>absolutely no extra cost to you</strong>.
              The price you pay is identical to visiting the partner's website directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Which affiliate programmes do we use?</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>
                <strong>EarnKaro</strong> — for credit cards, loans, insurance, and financial products (HDFC, SBI, Axis, ICICI, and others)
              </li>
              <li>
                <strong>Amazon Associates (India)</strong> — for books, motorcycle gear, home products, and tech accessories
              </li>
              <li>
                <strong>Direct brand partnerships</strong> — occasionally, for products we have personally tested and chosen to feature
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Does this influence our recommendations?</h2>
            <p className="mb-4">
              <strong>No.</strong> Our editorial process is independent. We select products and services based on genuine
              research, personal use, and objective criteria — not on which partner pays the highest commission.
            </p>
            <p>
              In many cases, the product we recommend most strongly has a lower commission than an alternative we
              chose not to recommend. Our first obligation is to the reader, not to the affiliate network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">How do we identify affiliate links?</h2>
            <p>
              Affiliate links within articles are standard hyperlinks pointing to external partner platforms.
              Articles containing affiliate links include a footer note: <em>"As an Amazon Associate, Guiderr earns
              from qualifying purchases at no extra cost to you."</em> For EarnKaro-tracked financial products,
              an <em>"AFFILIATE"</em> disclosure appears at the bottom of each relevant article.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">What about sponsored content?</h2>
            <p>
              Guiderr does not publish paid-for editorial content. We do not accept payment in exchange for
              positive reviews or mentions. Any brand partnership that involves editorial content will be
              clearly labelled as <strong>"Paid Partnership"</strong> or <strong>"Sponsored"</strong> at
              the top of the article. We have not published any sponsored content as of April 2026.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Questions?</h2>
            <p>
              If you have any questions about our affiliate relationships or editorial independence,
              write to us at{' '}
              <a
                href="mailto:rohanrworld@gmail.com"
                className="text-indigo-600 hover:underline underline-offset-2"
              >
                rohanrworld@gmail.com
              </a>
              . We respond to every genuine inquiry.
            </p>
          </section>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            Last updated: April 2026
          </p>
        </div>

        {/* ── Back CTA ── */}
        <div className="pt-14 flex gap-3">
          <Link
            to="/start-here"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Back to Start Here →
          </Link>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-semibold px-8 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
          >
            Browse Guides →
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
