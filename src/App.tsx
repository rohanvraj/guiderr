import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, Suspense } from 'react';

// Redirect /rohan-selection/:category → /top-picks/:category
function LegacyCategoryRedirect() {
  const { category } = useParams<{ category: string }>();
  return <Navigate to={`/top-picks/${category}`} replace />;
}
import { supabase } from './utils/supabase';
import { CartProvider } from './context/CartContext';
import CartPanel from './components/CartPanel';
import ScrollToTop from './components/ScrollToTop';
import { lazyRetry } from './utils/lazyRetry';

// Code-split every page into its own JS chunk.
// lazyRetry wraps each import: if a chunk is missing after a deploy it auto-
// reloads once so users never see a blank page due to stale chunk names.
const HomePage           = lazyRetry(() => import('./pages/HomePage'));
const CategoryPage       = lazyRetry(() => import('./pages/CategoryPage'));
const ThankYouPage       = lazyRetry(() => import('./pages/ThankYouPage'));
const AdminDashboard     = lazyRetry(() => import('./pages/AdminDashboard'));
const SuperadminDashboard = lazyRetry(() => import('./pages/SuperadminDashboard'));
const PartnersManagement = lazyRetry(() => import('./pages/PartnersManagement'));
const CreatorStatsPage   = lazyRetry(() => import('./pages/CreatorStatsPage'));
const ContactUs          = lazyRetry(() => import('./pages/ContactUs'));
const TermsAndConditions = lazyRetry(() => import('./pages/TermsAndConditions'));
const ShippingPolicy     = lazyRetry(() => import('./pages/ShippingPolicy'));
const CancellationsRefunds = lazyRetry(() => import('./pages/CancellationsRefunds'));
const PrivacyPolicy      = lazyRetry(() => import('./pages/PrivacyPolicy'));
const BlogListingPage    = lazyRetry(() => import('./pages/BlogListingPage'));
const BlogPostPage       = lazyRetry(() => import('./pages/BlogPostPage'));
const AboutPage          = lazyRetry(() => import('./pages/AboutPage'));
const StartHerePage      = lazyRetry(() => import('./pages/StartHerePage'));
const AffiliateDisclosure = lazyRetry(() => import('./pages/AffiliateDisclosure'));
const GetFeaturedPage    = lazyRetry(() => import('./pages/GetFeaturedPage'));
const FeaturedStoriesPage = lazyRetry(() => import('./pages/FeaturedStoriesPage'));
const InvestingPage      = lazyRetry(() => import('./pages/Investing'));
const LibraryPage        = lazyRetry(() => import('./pages/Library'));
const LibraryProductPage = lazyRetry(() => import('./pages/LibraryProductPage'));
const RohanSelectionPage = lazyRetry(() => import('./pages/RohanSelection'));

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
        <ScrollToTop />
        <ReferralTracker />
        <CartPanel />
        {/* Suspense fallback: instant white screen — no layout shift, no spinner */}
        <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/featured" element={<FeaturedStoriesPage />} />
            <Route path="/featured/:slug" element={<BlogPostPage />} />
            <Route path="/get-featured" element={<GetFeaturedPage />} />
            <Route path="/guides" element={<BlogListingPage />} />
            <Route path="/guides/:slug" element={<BlogPostPage />} />
            <Route path="/library/:category?" element={<LibraryPage />} />
            <Route path="/library/product/:id" element={<LibraryProductPage />} />
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
            <Route path="/rohan-selection" element={<Navigate to="/top-picks" replace />} />
            <Route path="/rohan-selection/:category" element={<LegacyCategoryRedirect />} />
            <Route path="/top-picks" element={<RohanSelectionPage />} />
            <Route path="/top-picks/:category" element={<RohanSelectionPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
