import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const phases = [
  {
    numeral: '01',
    tag: 'THE STRUGGLE',
    headline: 'Information Chaos.',
    body: [
      `I used to spend hours — sometimes days — trying to find honest, clear answers to simple questions. Which credit card actually gives you real value on fuel? Which forex card won't quietly drain your savings in Frankfurt? Which motorcycle insurance isn't a trap? Which Himalayan route doesn't destroy your bike in the first 40km?`,
      `The internet had answers, but they were buried under affiliate-spam listicles, outdated forum posts, and "sponsored" comparisons that had clearly never been tested. Every piece of advice came with a conflict of interest attached.`,
      `I got tired of the noise. So I started building my own systems.`,
    ],
  },
  {
    numeral: '02',
    tag: 'THE LEAP',
    headline: 'Frugality as a Superpower.',
    body: [
      `I didn't quit my job. I didn't have a windfall. I made a decision: every rupee I spend should work harder than the last one.`,
      `I started treating frugality not as deprivation — but as a design principle. The goal was never "spend less." The goal was "get more out of everything." A zero-fee forex card isn't a compromise. It's the smarter move. A credit card with 5% fuel cashback isn't a gimmick. Over a year, it's ₹15,000 back in your pocket.`,
      `When you start thinking in systems, small decisions compound. That's where the power is.`,
    ],
  },
  {
    numeral: '03',
    tag: 'THE DISCOVERY',
    headline: 'Systems > Luck.',
    body: [
      `The people I admired — the ones who road-tripped through Ladakh on a budget, who traveled to Southeast Asia for less than their monthly grocery bill, who actually understood what was happening in their own credit card statements — weren't luckier than everyone else.`,
      `They had frameworks. Repeatable, teachable systems that removed guesswork from big decisions. The right card for the right spend category. The right insurance before the right trip. The right guide before the right purchase.`,
      `That realization changed how I approached everything. Lifestyle freedom isn't a stroke of luck. It's an output of good information, applied consistently.`,
    ],
  },
  {
    numeral: '04',
    tag: 'THE PURPOSE',
    headline: 'Building Guiderr.',
    body: [
      `Guiderr exists because I couldn't find the resource I needed — so I decided to build it.`,
      `Not a blog. Not a content farm. A library of blueprints for the modern Indian decision-maker: the urban professional who wants their money to work smarter, the traveller who wants to move more for less, the rider who wants their machine to last, the buyer who wants to make one good decision instead of ten mediocre ones.`,
      `Every guide in our Library is written to answer the question I personally had — and couldn't find a clean answer to. That's the filter. That's the editorial standard.`,
    ],
  },
  {
    numeral: '05',
    tag: 'THE PROMISE',
    headline: 'Lived Expertise.',
    body: [
      `If it's in our Library, it's because I've tested it, I've lived it, or I'd buy it myself with my own money.`,
      `We don't publish because a brand paid us. We don't recommend because it converts. We publish because the information is genuinely useful for someone who is trying to make a real decision, right now, without a financial advisor or an experienced friend on speed-dial.`,
      `Guiderr is that friend. Independent, honest, and obsessed with getting it right.`,
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Page Header ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-4">
            The Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            Why Guiderr Exists.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            Five phases. One mission. A blueprint library built out of personal frustration with everything that wasn't good enough.
          </p>
        </div>

        {/* ── Story Cards (Bento Layout) ── */}
        <div className="space-y-6">
          {phases.map((phase) => (
            <div
              key={phase.numeral}
              className="relative bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-12 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300"
            >
              {/* Ghost Numeral — Inside Card, Bottom Right */}
              <span
                className="absolute bottom-0 right-4 font-black text-[12rem] leading-none text-slate-900/[0.03] select-none pointer-events-none transition-all duration-700 ease-out group-hover:-translate-y-4 group-hover:text-purple-600/[0.08]"
              >
                {phase.numeral}
              </span>

              {/* Content — Positioned Above Ghost Numeral */}
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-3">
                  {phase.tag}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
                  {phase.headline}
                </h2>
                <div className="space-y-4">
                  {phase.body.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-slate-600">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Next Steps CTA ── */}
        <div className="pt-12 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Where to go next
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/start-here"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              New here? Start Here →
            </Link>
            <Link
              to="/#featured"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold px-8 py-3 rounded-full border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              Explore the Store →
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
