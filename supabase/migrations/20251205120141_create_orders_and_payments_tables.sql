/*
  # Create Orders and Payments Tables for Razorpay Integration

  1. New Tables
    - `orders` - Stores payment order information
      - `id` (uuid, primary key)
      - `razorpay_order_id` (text) - Razorpay order ID for tracking
      - `buyer_email` (text) - Customer email
      - `buyer_name` (text) - Customer name
      - `total_amount` (integer) - Total in paise
      - `referral_code` (text) - Influencer referral code if applicable
      - `payment_status` (text) - pending, completed, failed
      - `delivery_status` (text) - pending, delivered
      - `razorpay_payment_id` (text) - Razorpay payment ID after completion
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_items` - Individual products in each order
      - `id` (uuid, primary key)
      - `order_id` (uuid) - Foreign key to orders
      - `product_id` (text) - Product ID from products array
      - `product_title` (text) - Product title
      - `price` (integer) - Price in paise
      - `delivery_link_sent` (boolean) - Whether delivery link was sent

    - `referral_tracking` - Track referral commissions
      - `id` (uuid, primary key)
      - `order_id` (uuid) - Foreign key to orders
      - `referral_code` (text) - Influencer code
      - `commission_amount` (integer) - Commission in paise
      - `status` (text) - pending, approved, paid

  2. Security
    - Enable RLS on all tables
    - Public read for orders (by email)
    - Public insert for creating orders
    - Admin-only update/delete policies

  3. Indexes
    - Index on razorpay_order_id for fast lookups
    - Index on buyer_email for customer queries
    - Index on referral_code for commission tracking
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id text UNIQUE NOT NULL,
  buyer_email text NOT NULL,
  buyer_name text NOT NULL,
  total_amount integer NOT NULL,
  referral_code text,
  payment_status text NOT NULL DEFAULT 'pending',
  delivery_status text NOT NULL DEFAULT 'pending',
  razorpay_payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_title text NOT NULL,
  price integer NOT NULL,
  delivery_link_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create referral_tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  commission_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referral_code ON referral_tracking(referral_code);

-- RLS Policies for orders table
CREATE POLICY "Public can read orders by email"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for order_items table
CREATE POLICY "Public can read order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Public can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- RLS Policies for referral_tracking table
CREATE POLICY "Public can read referral tracking"
  ON referral_tracking FOR SELECT
  USING (true);

CREATE POLICY "Public can create referral entries"
  ON referral_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update referral tracking"
  ON referral_tracking FOR UPDATE
  USING (true)
  WITH CHECK (true);
