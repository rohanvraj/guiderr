import { Link } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FOUNDER_PORTRAIT_SRC = optimizeCloudinaryUrl('ziphly-guiderr-rentfar-queueslip-founder-rohan-raj_mb9yiw_1_lfjpjm', {
  width: 288,
  height: 288,
  crop: 'fill',
  gravity: 'face',
  quality: 'auto:eco',
});

const phases = [
  {
    ghost: 'DESTINY',
    tag: 'THE ACADEMIC SACRIFICE',
    headline: 'Duty Over Ambition.',
    body: [
      `After completing my Masters in Accounting and Finance at Aston University, UK, I was prepared for a high-flying career in finance. I had the degree, the drive, and the numbers.`,
      `But destiny intervened. My father fell ill, and the family business needed me. I set aside my personal ambitions in finance to take over our family restaurant. It wasn't the path I planned, but it was the duty I chose to honor.`,
    ],
  },
  {
    ghost: 'HUSTLE',
    tag: 'THE 12-YEAR GRIND',
    headline: 'The Real-World MBA.',
    body: [
       `I ran that restaurant for 12 years. Living the daily hustle of the Indian hospitality industry taught me more about the value of a rupee, cash flow management, and the grit required to sustain a business than any classroom could.`,
      `However, after a decade on the floor, my true calling never left me. I had a burning desire to see the world with my own eyes and travel to the places I’d only dreamed of. I realized that my only true gateway to that freedom was investing in the stock market. By leveraging my technical learning skills and a burning drive to master new ideas, I began to unlock new possibilities. I knew that to live the life I imagined, I had to pivot back to my roots.`,
    ],
  },
  {
    ghost: 'WHEELS',
    tag: "THE ADVENTURER'S MATH",
    headline: 'Passion is Expensive.',
    body: [
      <>
        I am obsessed with motorcycles and adventure. I share my journeys on my YouTube channel{' '}
        <a href="https://www.youtube.com/@rrohannr" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#2187FF]">
          @rrohannr
        </a>
        .
      </>,
      `But the truth is, the things I love—traveling, riding high-end machines, exploring the Himalayas—require significant capital. I realized that to fund a life of adventure, you first have to master the math of financial independence.`,
    ],
  },
  {
    ghost: 'GUIDES',
    tag: 'THE CULMINATION',
    headline: 'Articles, Blogs & Blueprints.',
    body: [
      `Guiderr is where my Finance background finally meets my 12 years of business experience and my riding spirit. I spend the hours researching investment strategies, travel costs, and motorcycle ownership so you don’t have to.`,
      `I brought it all together under one roof to publish quality articles and blogs I wish I had found when I was first trying to find my way back to financial freedom.`,
    ],
  },
  {
    ghost: 'MISSION',
    tag: 'THE MISSION',
    headline: 'Independence as a Default.',
    body: [
      `Guiderr exists to help India's modern buyer make one good decision instead of ten mediocre ones. Whether it's choosing the right card to fund your next trip or picking the right machine for your garage, we provide the honest math to get you there.`,
      `My goal is simple: to help you achieve the financial independence required to see the world with your own eyes.`,
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(191,219,255,0.45),rgba(255,255,255,1))] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

       {/* --- BACK TO HOME NAVIGATION --- */}
<div className="mb-10">
  <Link to="/" className="group inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors">
    <div className="w-9 h-9 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-white transition-all border border-blue-200/50 shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Back to Home</span>
  </Link>
</div>

        {/* ── Page Header ── */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            {/* Left: Copy */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2187FF] mb-4">
                The Story
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
                Why I Built Guiderr.
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                I didn't build Guiderr to run a blog. I built it because I realized that to see the world with your own eyes, you first have to master the math behind it.
              </p>
            </div>

            {/* Right: Founder Portrait */}
            <div className="flex justify-center lg:justify-end flex-shrink-0">
              <img
                src={FOUNDER_PORTRAIT_SRC}
                alt="Rohan Raj, founder of Guiderr"
                width={288}
                height={288}
                loading="eager"
                decoding="async"
                className="w-52 h-52 rounded-full border border-slate-100 shadow-sm object-cover"
              />
            </div>

          </div>
        </div>

        {/* ── Story Cards (Bento Layout) ── */}
        <div className="space-y-6">
          {phases.map((phase) => (
            <div
              key={phase.tag}
              className="group relative overflow-hidden rounded-[2rem] border border-[#BFDBFF] bg-white/90 p-8 shadow-sm transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(33,135,255,0.12)] sm:p-12"
            >
              {/* Ghost Label — Inside Card */}
              <span
                className="pointer-events-none absolute right-3 bottom-0 select-none text-[4.5rem] font-black uppercase leading-none tracking-[-0.08em] text-[rgba(33,135,255,0.09)] transition-transform duration-500 group-hover:translate-x-4 group-hover:text-[rgba(33,135,255,0.1)] sm:text-[7rem]"
              >
                {phase.ghost}
              </span>

              {/* Content — Positioned Above Ghost Label */}
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2187FF] mb-3">
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2187FF]">
            Where to go next
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/start-here"
              className="inline-flex items-center gap-2 bg-[#2187FF] hover:bg-[#116fdd] text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              New here? Start Here →
            </Link>
            <Link
              to="/#featured"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold px-8 py-3 rounded-full border border-[#BFDBFF] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
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
