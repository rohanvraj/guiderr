import { BookOpen, Mail, Twitter, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" strokeWidth={2.5} />
              <span className="text-2xl font-bold">Guiderr</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Premium digital guides and ebooks to help you learn, explore, and achieve your goals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contactus" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-slate-400 hover:text-white transition-colors">
                  Cancellations & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('motorcycles')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Motorcycles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Finance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('travel')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Travel
                </button>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
            </div>

            <a 
              href="mailto:rohanrworld@gmail.com" 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5" />
              rohanrworld@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center sm:text-left">
              © 2025 Guiderr. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm">
              <Link to="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-4 text-center sm:text-left">
            Disclaimer: Digital products are for educational purposes. Results may vary based on individual effort and circumstances.
          </p>
        </div>
      </div>
    </footer>
  );
}
