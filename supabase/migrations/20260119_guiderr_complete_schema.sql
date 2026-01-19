-- Guiderr Complete Database Schema Migration
-- This migration creates all tables needed for Guiderr MVP
-- Includes: ebooks, orders, order_items, creators, and creator_transactions

-- ============================================================================
-- EBOOKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  downloadLink TEXT NOT NULL,
  cover_image TEXT,
  synopsis TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ebooks_slug ON ebooks(slug);
CREATE INDEX idx_ebooks_category ON ebooks(category);
CREATE INDEX idx_ebooks_featured ON ebooks(featured);

-- ============================================================================
-- CREATORS TABLE (Influencers/Creators)
-- ============================================================================
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_creators_code ON creators(code);
CREATE INDEX idx_creators_status ON creators(status);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id TEXT UNIQUE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  creator_code TEXT,
  payment_status TEXT DEFAULT 'pending',
  delivery_status TEXT DEFAULT 'pending',
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (creator_code) REFERENCES creators(code)
);

CREATE INDEX idx_orders_razorpay_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_creator_code ON orders(creator_code);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================================================
-- ORDER_ITEMS TABLE (Items within each order)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  delivery_link_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- CREATOR_TRANSACTIONS TABLE (Revenue tracking per order)
-- ============================================================================
CREATE TABLE IF NOT EXISTS creator_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  order_id UUID NOT NULL,
  order_amount DECIMAL(15, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_creator_trans_creator_id ON creator_transactions(creator_id);
CREATE INDEX idx_creator_trans_order_id ON creator_transactions(order_id);
CREATE INDEX idx_creator_trans_status ON creator_transactions(status);
CREATE INDEX idx_creator_trans_created_at ON creator_transactions(created_at);

-- ============================================================================
-- REFERRAL_TRACKING TABLE (Optional: for detailed referral metrics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  order_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  clicks INTEGER DEFAULT 1,
  conversions INTEGER DEFAULT 1,
  commission_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_referral_creator_id ON referral_tracking(creator_id);
CREATE INDEX idx_referral_code ON referral_tracking(referral_code);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Public read access to ebooks (for frontend display)
CREATE POLICY "ebooks_select_public" ON ebooks
  FOR SELECT USING (TRUE);

-- Admin-only policies for orders (customize based on your auth setup)
-- For now, allowing all authenticated users to read orders
-- Adjust based on your JWT claims or user roles
CREATE POLICY "orders_select_auth" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_insert_auth" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "orders_update_auth" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "order_items_select_auth" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "order_items_insert_auth" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Creators public read
CREATE POLICY "creators_select_public" ON creators
  FOR SELECT USING (TRUE);

-- Creator transactions (auth required)
CREATE POLICY "creator_transactions_select_auth" ON creator_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "creator_transactions_insert_auth" ON creator_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "creator_transactions_update_auth" ON creator_transactions
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Referral tracking policies
CREATE POLICY "referral_tracking_select_auth" ON referral_tracking
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "referral_tracking_insert_auth" ON referral_tracking
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- SAMPLE DATA (Optional: Remove after testing)
-- ============================================================================

-- Insert sample ebook
INSERT INTO ebooks (slug, title, author, category, price, downloadLink, synopsis, featured)
VALUES (
  'motorcycle-beginners-1',
  'Motorcycle Basics for Beginners',
  'John Rider',
  'motorcycles',
  299.00,
  'https://drive.google.com/file/d/sample-id-1/view',
  'Learn the fundamentals of motorcycle riding with expert guidance.',
  TRUE
) ON CONFLICT DO NOTHING;

-- Insert sample creators
INSERT INTO creators (name, code, email, commission_rate, status)
VALUES
  ('Sarah Speed', 'sarah', 'sarah@example.com', 10.00, 'active'),
  ('Mike Motorbike', 'mike', 'mike@example.com', 15.00, 'active'),
  ('Alex Adventure', 'alex', 'alex@example.com', 12.00, 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
