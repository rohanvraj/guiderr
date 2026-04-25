import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CartIcon from './CartIcon';


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <nav className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 px-4 sm:px-6 backdrop-saturate-150">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="/images/guiderr-logo.webp"
              alt="Guiderr Logo"
              width="120"
              height="40"
              loading="eager"
              fetchPriority="high"
              className="h-8 sm:h-9 w-auto"
            />
            <span className="font-bold text-xl tracking-tight text-gray-900">Guiderr</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {/* Library Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('library')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'library' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/library"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                Library
              </Link>
            </div>

            {/* Selection Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('selection')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'selection' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/rohan-selection"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                Selection
              </Link>
            </div>

            {/* Start Here Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('start-here')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'start-here' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/start-here"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                Start Here
              </Link>
            </div>

            {/* Guides (Blog) Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('guides')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'guides' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/guides"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                Guides
              </Link>
            </div>

            {/* Featured */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('featured')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'featured' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/featured"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                Featured
              </Link>
            </div>

            {/* About Link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredNav('about')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <AnimatePresence>
                {hoveredNav === 'about' && (
                  <motion.div
                    layoutId="nav-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-slate-700/10 border border-slate-500/50"
                    transition={{ type: 'spring', stiffness: 350, damping: 45 }}
                  />
                )}
              </AnimatePresence>
              <Link
                to="/about"
                className="relative z-10 block text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2"
              >
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CartIcon />
            <button
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden pb-4 animate-fade-in border-t border-white/20 mt-2 pt-4">
            <nav className="flex flex-col gap-2">
              {/* Library Link */}
              <Link
                to="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Library
              </Link>

              {/* Selection Link */}
              <Link
                to="/rohan-selection"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Selection
              </Link>

              {/* Start Here Link */}
              <Link
                to="/start-here"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Start Here
              </Link>

              {/* Guides (Blog) Link */}
              <Link
                to="/guides"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Guides
              </Link>

              <Link
                to="/featured"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Featured
              </Link>

              {/* About Link */}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}
