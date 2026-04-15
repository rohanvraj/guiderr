import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { supabase } from './utils/supabase';
import { CartProvider } from './context/CartContext';
import CartPanel from './components/CartPanel';

// Code-split every page into its own JS chunk.
// The browser only downloads the chunk for the current route.
const HomePage           = lazy(() => import('./pages/HomePage'));
const CategoryPage       = lazy(() => import('./pages/CategoryPage'));
const ThankYouPage       = lazy(() => import('./pages/ThankYouPage'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const SuperadminDashboard = lazy(() => import('./pages/SuperadminDashboard'));
const PartnersManagement = lazy(() => import('./pages/PartnersManagement'));
const CreatorStatsPage   = lazy(() => import('./pages/CreatorStatsPage'));
const ContactUs          = lazy(() => import('./pages/ContactUs'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const ShippingPolicy     = lazy(() => import('./pages/ShippingPolicy'));
const CancellationsRefunds = lazy(() => import('./pages/CancellationsRefunds'));
const PrivacyPolicy      = lazy(() => import('./pages/PrivacyPolicy'));
const BlogListingPage    = lazy(() => import('./pages/BlogListingPage'));
const BlogPostPage       = lazy(() => import('./pages/BlogPostPage'));
const AboutPage          = lazy(() => import('./pages/AboutPage'));
const StartHerePage      = lazy(() => import('./pages/StartHerePage'));
const AffiliateDisclosure = lazy(() => import('./pages/AffiliateDisclosure'));
const GetFeaturedPage    = lazy(() => import('./pages/GetFeaturedPage'));
const FeaturedStoriesPage = lazy(() => import('./pages/FeaturedStoriesPage'));
const InvestingPage      = lazy(() => import('./pages/Investing'));

// Component to handle referral tracking
function ReferralTracker() {
  useEffect(() => {
    if (
      window.location.pathname.startsWith('/featured') ||
      window.location.pathname.startsWith('/get-featured')
    ) {
      return;
    }

    // Check for ?ref=[code] in the URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      // Store in localStorage so the referral is remembered across tabs/sessions
      localStorage.setItem('active_referral', refCode);
      console.log('Referral code captured:', refCode);

      // 24-hour Zero-Waste debounce: one DB write per browser per day per code.
      // Prevents bots and page-refreshes from burning free-tier write quota.
      const throttleKey = `last_click_for_${refCode}`;
      const lastClick = localStorage.getItem(throttleKey);
      const now = Date.now();
      if (!lastClick || now - parseInt(lastClick, 10) > 86_400_000) {
        localStorage.setItem(throttleKey, String(now));
        supabase.rpc('increment_partner_click', { p_code: refCode }).catch((err) => {
          console.warn('[ReferralTracker] Click increment failed (non-critical):', err);
        });
      }
    }
  }, []);

  return null;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ReferralTracker />
        <CartPanel />
        {/* Suspense fallback: instant white screen — no layout shift, no spinner */}
        <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/featured" element={<FeaturedStoriesPage />} />
            <Route path="/get-featured" element={<GetFeaturedPage />} />
            <Route path="/guides" element={<BlogListingPage />} />
            <Route path="/guides/:slug" element={<BlogPostPage />} />
            <Route path="/:category" element={<CategoryPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/stats/:secretKey" element={<CreatorStatsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/partners" element={<PartnersManagement />} />
            <Route path="/superadmin" element={<SuperadminDashboard />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/refunds" element={<CancellationsRefunds />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/start-here" element={<StartHerePage />} />
            <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
            <Route path="/investing" element={<InvestingPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
