import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FEATURED_MAILTO_URL = 'mailto:rohanrworld@gmail.com?subject=Collaboration%20Request%3A%20%5BYour%20Name%2FBusiness%5D&body=Hi%20Guiderr%2C%0D%0A%0D%0AI%27m%20interested%20in%20getting%20featured%20on%20Guiderr.%20Here%20are%20some%20brief%20details%3A%0D%0A%0D%0A-%20Business%2FTopic%20Name%3A%0D%0A-%20Category%20(Finance%2FAutomotive%2Fetc)%3A%0D%0A-%20Social%2FWebsite%20Link%3A%0D%0A-%20Brief%20description%20of%20the%20story%20or%20expertise%3A%0D%0A%0D%0ALooking%20forward%20to%20hearing%20from%20you!';

const audienceCards = [
  {
    title: 'Innovative Startups',
    description: 'Products and services with a clear point of view, looking to reach high-intent readers in discovery mode.',
  },
  {
    title: 'Independent Creators',
    description: 'Creators building trust through sharp expertise, credible storytelling, and audience-first education.',
  },
  {
    title: 'Hobbyist Experts',
    description: 'Niche specialists with practical experience, useful frameworks, and a story worth publishing well.',
  },
  {
    title: 'Niche Businesses',
    description: 'Focused brands that benefit more from editorial context and trust than from generic paid reach.',
  },
];

const editorialSteps = [
  {
    step: '01',
    title: 'Connect',
    description: 'Start on WhatsApp with your story, your offering, and why it fits Guiderr readers.',
    icon: MessageCircle,
  },
  {
    step: '02',
    title: 'Editorial Review',
    description: 'We review for clarity, fit, quality, and whether the feature adds real decision value.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'Go Live',
    description: 'Approved stories are published in a premium format designed for trust, readability, and intent.',
    icon: CheckCircle2,
  },
];

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
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function GetFeaturedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-fuchsia-50 to-white text-slate-900">
      <Header />

      <main className="pt-32 sm:pt-36 lg:pt-40">
        <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pb-32 lg:pb-40">
          <div className="max-w-5xl mx-auto text-center">
            <FadeSection>
              <div className="inline-flex items-center rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                Premium Editorial Placement
              </div>
            </FadeSection>

            <FadeSection delay={0.06} className="mt-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98] text-slate-900">
                Elevate Your Brand on Guiderr
              </h1>
            </FadeSection>

            <FadeSection delay={0.12} className="mt-6">
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl leading-10 text-slate-600">
                A high-intent platform for creators and businesses to share their story with India's modern decision-makers.
              </p>
            </FadeSection>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 lg:pb-36">
          <div className="max-w-6xl mx-auto">
            <FadeSection className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Who Is This For?</p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-slate-900">
                Designed for brands and voices that deserve a more premium introduction.
              </h2>
            </FadeSection>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              {audienceCards.map((card, index) => (
                <FadeSection key={card.title} delay={index * 0.06}>
                  <article className="rounded-3xl border border-violet-100 bg-white/80 p-8 sm:p-10 min-h-[240px] flex flex-col justify-between shadow-[0_16px_50px_rgba(124,58,237,0.06)]">
                    <div className="w-11 h-11 rounded-2xl border border-violet-100 bg-violet-50 flex items-center justify-center text-sm font-semibold text-slate-900">
                      0{index + 1}
                    </div>
                    <div className="mt-10">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{card.title}</h3>
                      <p className="mt-4 text-base leading-8 text-slate-600">{card.description}</p>
                    </div>
                  </article>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32 lg:pb-40">
          <div className="max-w-5xl mx-auto">
            <FadeSection className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">The Editorial Process</p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-slate-900">
                A simple, selective path from first message to published feature.
              </h2>
            </FadeSection>

            <div className="mt-12 space-y-4">
              {editorialSteps.map((item, index) => {
                const Icon = item.icon;

                return (
                  <FadeSection key={item.title} delay={index * 0.06}>
                    <div className="rounded-3xl border border-violet-100 bg-white/80 px-6 py-7 sm:px-8 sm:py-8 shadow-[0_10px_30px_rgba(124,58,237,0.05)]">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="w-12 h-12 rounded-2xl border border-violet-100 bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-slate-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-500">{item.step}</p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{item.title}</h3>
                          <p className="mt-3 text-base leading-8 text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </FadeSection>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-28 sm:pb-36 lg:pb-44">
          <FadeSection>
            <div className="max-w-4xl mx-auto rounded-[2rem] border border-violet-100 bg-white/85 px-8 py-12 sm:px-12 sm:py-16 text-center shadow-[0_18px_60px_rgba(124,58,237,0.08)]">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-slate-900">
                Put your story in front of people already researching what to trust next.
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
                If your brand, product, or expertise helps modern Indian consumers decide better, start the conversation.
              </p>
              <a
                href={FEATURED_MAILTO_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex items-center justify-center gap-3 rounded-full border border-purple-900 bg-purple-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-purple-950 hover:border-purple-950"
              >
                Connect with us to get featured
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </FadeSection>
        </section>
      </main>

      <Footer />
    </div>
  );
}