import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, Bike, Plane, Heart, Palette } from 'lucide-react';

const pillars = [
  {
    icon: TrendingUp,
    label: 'Finance',
    description:
      `From decoding India's 2026 tax slabs to building an emergency fund on a ₹30k salary—our finance guides make money simple.`,
  },
  {
    icon: Bike,
    label: 'Motorcycles',
    description:
      'Service intervals, highway packing lists, Himalayan route maps—everything a modern rider needs, written by riders.',
  },
  {
    icon: Plane,
    label: 'Travel',
    description:
      'Budget itineraries, visa-on-arrival tips, and hidden gems across India and beyond. Explore more, spend less.',
  },
  {
    icon: Heart,
    label: 'Parenting',
    description:
      `Evidence-based, judgment-free guides for India's new-age parents—from screen time to school readiness.`,
  },
  {
    icon: Palette,
    label: 'Art & Creativity',
    description:
      'Practical guides for hobbyists and freelancers—sketch, design, and build a creative career on your own terms.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* ── Hero ── */}
        <section className="mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            Guiderr: Empowering India's Modern Explorers
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            We simplify the complex—from navigating 2026 finance rules to planning life-changing
            Himalayan rides. Our mission is to provide{' '}
            <strong className="text-gray-800">frugal, expert-led, and actionable guides</strong>{' '}
            for a smarter lifestyle.
          </p>
        </section>

        {/* ── Divider ── */}
        <hr className="border-gray-100 mb-14" />

        {/* ── Pillars ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What We Cover</h2>
          <ul className="space-y-8">
            {pillars.map(({ icon: Icon, label, description }) => (
              <li key={label} className="flex items-start gap-5">
                <span className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Divider ── */}
        <hr className="border-gray-100 mb-14" />

        {/* ── E-E-A-T Trust Block ── */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Editorial Standard</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            Every guide on Guiderr is researched with primary sources—RBI circulars, government
            notifications, on-ground riding reports, and peer-reviewed parenting literature. We do
            not publish sponsored opinion. If we recommend a product, it is because we use or have
            rigorously evaluated it.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Guiderr is a bootstrapped, independent platform. No VC pressure. No engagement-bait.
            Just clean, useful information for people who value their time.
          </p>
        </section>

        {/* ── CTA ── */}
        <div>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Visit our Guides →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
