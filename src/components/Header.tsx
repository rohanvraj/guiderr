import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import { getCategories } from '../utils/ebooks';

const NAV_CATEGORY_LINKS = [
  { label: 'Motorcycles', to: '/motorcycles' },
  { label: 'Finance', to: '/finance' },
  { label: 'Travel', to: '/travel' },
  { label: 'Tech', to: '/gadget-tech' },
  { label: 'Automotive', to: '/guides?category=Automotive' },
  { label: 'Lifestyle', to: '/guides?category=Lifestyle' },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ebooksOpen, setEbooksOpen] = useState(false);
  const [mobileEbooksOpen, setMobileEbooksOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();
  const categories = getCategories();
  const visibleCategories = NAV_CATEGORY_LINKS.filter((link) => {
    if (link.label === 'Automotive' || link.label === 'Lifestyle') {
      return true;
    }

    return categories.some((category) => category.name === link.label || (link.label === 'Tech' && category.id === 'gadget-tech'));
  });

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEbooksOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setEbooksOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => setEbooksOpen(false), 150);
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <nav className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 px-4 sm:px-6 backdrop-saturate-150">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="/images/guiderr-logo.png"
              alt="Guiderr Logo"
              width="120"
              height="40"
              className="h-8 sm:h-9 w-auto"
            />
            <span className="font-bold text-xl tracking-tight text-gray-900">Guiderr</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-6">
            {/* Ebooks Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setEbooksOpen(!ebooksOpen)}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/30"
              >
                Ebooks
                <ChevronDown className={`w-4 h-4 transition-transform ${ebooksOpen ? 'rotate-180' : ''}`} />
              </button>
              {ebooksOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 py-2 animate-fade-in">
                  {visibleCategories.map((category) => (
                    <Link
                      key={category.label}
                      to={category.to}
                      onClick={() => setEbooksOpen(false)}
                      className="block px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-white/50 transition-colors font-medium"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Guides (Blog) Link */}
            <Link
              to="/guides"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/30"
            >
              Guides
            </Link>

            <Link
              to="/featured"
              className="text-slate-900 font-semibold transition-colors px-4 py-2 rounded-full border border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300"
            >
              Featured
            </Link>

            {/* About Link */}
            <Link
              to="/about"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/30"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CartIcon />
            <button
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in border-t border-white/20 mt-2 pt-4">
            <nav className="flex flex-col gap-2">
              {/* Ebooks Accordion */}
              <button
                onClick={() => setMobileEbooksOpen(!mobileEbooksOpen)}
                className="flex items-center justify-between py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Ebooks
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileEbooksOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileEbooksOpen && (
                <div className="ml-4 flex flex-col gap-1">
                  {visibleCategories.map((category) => (
                    <Link
                      key={category.label}
                      to={category.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-4 text-slate-600 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              )}

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
                className="py-2 px-4 text-slate-900 hover:text-slate-900 hover:bg-white/40 rounded-xl font-semibold transition-all border border-slate-200 bg-white/60"
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
