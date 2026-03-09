import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import CartPanel from './components/CartPanel';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import PartnersManagement from './pages/PartnersManagement';
import CreatorStatsPage from './pages/CreatorStatsPage';
import ContactUs from './pages/ContactUs';
import TermsAndConditions from './pages/TermsAndConditions';
import ShippingPolicy from './pages/ShippingPolicy';
import CancellationsRefunds from './pages/CancellationsRefunds';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BlogListingPage from './pages/BlogListingPage';
import BlogPostPage from './pages/BlogPostPage';

// Component to handle referral tracking
function ReferralTracker() {
  useEffect(() => {
    // Check for ?ref=[code] in the URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      // Store in sessionStorage for the duration of the session
      sessionStorage.setItem('active_referral', refCode);
      console.log('Referral code captured:', refCode);
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
        <Routes>
          <Route path="/" element={<HomePage />} />
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

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
