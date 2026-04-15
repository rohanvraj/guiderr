import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const phases = [
  {
    ghost: 'HUSTLE',
    tag: 'THE 11-YEAR GRIND',
    headline: 'Beyond the Restaurant Floor.',
    body: [
      `For over a decade, I ran my family restaurant. It taught me everything about the value of a rupee, the exhaustion of the grind, and the reality of Indian business. But after 11 years, I was bored. My calling wasn't in the kitchen - it was in the numbers, the spreadsheets, and the high-speed logic of the markets. I knew if I wanted the life I imagined, I had to pivot.`,
    ],
  },
  {
    ghost: 'FINANCE',
    tag: 'THE ACADEMIC PIVOT',
    headline: 'Mastering the Language of Money.',
    body: [
      `I left the restaurant floor and moved to the UK to complete my Masters in Accounting and Finance at Aston University. It was here that I truly understood that money isn't just currency - it's fuel. Whether you want to invest in a mid-cap gem or ride across a continent, you need a financial system that works while you sleep. I realized most people fail not because they don't work hard, but because they lack a blueprint.`,
    ],
  },
  {
    ghost: 'MOTORCYCLES',
    tag: "THE ADVENTURER'S MATH",
    headline: 'Passion is Expensive.',
    body: [
      <>
        I am obsessed with motorcycles and adventure. I share my journeys on my YouTube channel{' '}
        <a href="https://www.youtube.com/@rrohannr" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          @rrohannr
        </a>
        .
      </>,
      `But the truth is, the things I am passionate about - traveling, riding high-end machines, exploring the Himalayas - require significant capital. I built Guiderr to bridge that gap: using accounting-grade precision to help you save smarter and invest better, so you can spend more time doing what you love.`,
    ],
  },
  {
    ghost: 'GUIDES',
    tag: 'THE CULMINATION',
    headline: 'Articles, Blogs & Blueprints.',
    body: [
      `Guiderr is where my passion for finance meets my love for the open road. I’ve dedicated countless hours to researching investing frameworks and the real-world costs of travel and mobility, distilling it all in one place. My goal is to provide the exact articles and blogs I wish I could have found years ago-honest, practical, and built for modern India.`,
    ],
  },
  {
    ghost: 'MISSION',
    tag: 'THE MISSION',
    headline: 'Independence as a Default.',
    body: [
      `Guiderr exists to help India's modern buyer make one good decision instead of ten mediocre ones. Whether it's choosing the right card to fund your next trip or picking the right machine for your garage, we provide the honest math and practical guides to get you there. My goal is simple: to help you achieve the financial independence required to see the world with your own eyes.`,
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
            Why I Built Guiderr.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            I didn't build Guiderr to run a blog. I built it because I realized that to see the world with your own eyes, you first have to master the math behind it.
          </p>
        </div>

        {/* ── Story Cards (Bento Layout) ── */}
        <div className="space-y-6">
          {phases.map((phase) => (
            <div
              key={phase.tag}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-12"
            >
              {/* Ghost Label — Inside Card */}
              <span
                className="pointer-events-none absolute right-3 bottom-0 select-none text-[4.5rem] font-black uppercase leading-none tracking-[-0.08em] text-slate-900/[0.04] transition-transform duration-500 group-hover:translate-x-4 group-hover:text-purple-600/[0.08] sm:text-[7rem]"
              >
                {phase.ghost}
              </span>

              {/* Content — Positioned Above Ghost Label */}
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
