import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartPanel from './components/CartPanel';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import ContactUs from './pages/ContactUs';
import TermsAndConditions from './pages/TermsAndConditions';
import ShippingPolicy from './pages/ShippingPolicy';
import CancellationsRefunds from './pages/CancellationsRefunds';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <CartPanel />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:category" element={<CategoryPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/superadmin" element={<SuperadminDashboard />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/refunds" element={<CancellationsRefunds />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
