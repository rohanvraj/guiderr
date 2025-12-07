import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import { getCategories } from '../utils/ebooks';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const categories = getCategories();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <nav className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 px-4 sm:px-6 backdrop-saturate-150">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-slate-800" strokeWidth={2.5} />
            <span className="text-xl sm:text-2xl font-bold text-slate-900">Guiderr</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/${category.id}`}
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/30"
              >
                {category.name}
              </Link>
            ))}
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

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in border-t border-white/20 mt-2 pt-4">
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/${category.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left py-2 px-4 text-slate-700 hover:text-slate-900 hover:bg-white/30 rounded-lg font-medium transition-all"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}
