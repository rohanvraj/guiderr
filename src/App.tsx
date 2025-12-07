import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartPanel from './components/CartPanel';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';

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
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
