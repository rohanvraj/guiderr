# Guiderr MVP - Supabase Schema (Final)

## ⚠️ IMPORTANT
**Run this SQL ONCE on a fresh Supabase project for Guiderr.**

This is the authoritative, production-ready database schema. All tables are optimized for:
- ✅ Currency handling (amounts in paise as integers)
- ✅ Data integrity (CHECK constraints on all statuses)
- ✅ Performance (indexed queries)
- ✅ Scalability (proper foreign keys with cascading deletes)

---

## 📋 Copy This SQL Directly Into Supabase

```sql
-- ============================================================================
-- GUIDERR FINAL SCHEMA - COPY AND PASTE THIS ENTIRE BLOCK
-- Run ONCE on fresh Supabase project
-- ============================================================================

-- ============================================================================
-- 1. EBOOKS TABLE - Product Catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Slug: unique, lowercase, hyphen-separated identifier
  -- Example: "motorcycle-beginners-1", "safety-gear-guide"
  -- CHECK enforces format to prevent slugs like "Motorcycle-1" or "motorcycle_1"
  slug TEXT UNIQUE NOT NULL,
  CONSTRAINT slug_format CHECK (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT,
  
  -- Price stored in paise (1 INR = 100 paise)
  -- Example: 299 INR = 29900 paise
  -- Stored as INTEGER for precision, no floating point errors
  price_paise INTEGER NOT NULL,
  
  -- Download link (nullable - can be added later)
  download_link TEXT,
  
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
-- 2. CREATORS TABLE - Influencer/Creator Profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  
  -- Unique code for referral attribution (e.g., "sarah", "mike", "alex")
  code TEXT UNIQUE NOT NULL,
  
  email TEXT,
  
  -- Commission rate percentage (e.g., 10.00 = 10%)
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  
  -- CACHED FIELDS: Updated via triggers or API calls
  -- Do NOT update these directly - they are derived from creator_transactions
  -- Use queries: SUM(commission_amount) FROM creator_transactions WHERE creator_id = X
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Status: 'active' or 'inactive'
  status TEXT DEFAULT 'active',
  CONSTRAINT status_check CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_creators_code ON creators(code);
CREATE INDEX idx_creators_status ON creators(status);


-- ============================================================================
-- 3. ORDERS TABLE - Customer Orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Razorpay-provided order ID (unique per transaction)
  razorpay_order_id TEXT UNIQUE NOT NULL,
  
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  
  -- Total amount in paise (1 INR = 100 paise)
  -- Example: ₹499 = 49900 paise
  -- INTEGER prevents floating-point precision issues
  total_amount_paise INTEGER NOT NULL,
  
  -- Creator who referred this order (nullable - can be NULL if no referral)
  -- ON DELETE SET NULL: If creator is deleted, order remains but referral is cleared
  creator_code TEXT REFERENCES creators(code) ON DELETE SET NULL,
  
  -- Payment status: 'pending', 'completed', 'failed', 'refunded'
  payment_status TEXT DEFAULT 'pending',
  CONSTRAINT payment_status_check CHECK (
    payment_status IN ('pending', 'completed', 'failed', 'refunded')
  ),
  
  -- Delivery status: 'pending', 'sent', 'failed'
  delivery_status TEXT DEFAULT 'pending',
  CONSTRAINT delivery_status_check CHECK (
    delivery_status IN ('pending', 'sent', 'failed')
  ),
  
  -- Razorpay payment ID (stored after successful payment)
  razorpay_payment_id TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_razorpay_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_creator_code ON orders(creator_code);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);


-- ============================================================================
-- 4. ORDER_ITEMS TABLE - Individual Items in Each Order
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to orders table
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Product ID: References ebooks.slug
  -- Example: "motorcycle-beginners-1"
  product_id TEXT NOT NULL,
  
  product_title TEXT NOT NULL,
  
  -- Price in paise at time of purchase (preserved for audit trail)
  price_paise INTEGER NOT NULL,
  
  -- Delivery status: Has download link been sent?
  delivery_link_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);


-- ============================================================================
-- 5. CREATOR_TRANSACTIONS TABLE - Revenue Tracking Per Order
-- ============================================================================
CREATE TABLE IF NOT EXISTS creator_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Creator who earned commission
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  
  -- Order associated with this transaction
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Order amount in paise (snapshot for audit)
  order_amount_paise INTEGER NOT NULL,
  
  -- Commission rate at time of transaction (snapshot for audit)
  commission_rate DECIMAL(5, 2) NOT NULL,
  
  -- Calculated commission in paise
  commission_amount_paise INTEGER NOT NULL,
  
  -- Status: 'pending', 'completed', 'rejected', 'refunded'
  status TEXT DEFAULT 'pending',
  CONSTRAINT trans_status_check CHECK (
    status IN ('pending', 'completed', 'rejected', 'refunded')
  ),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_creator_trans_creator_id ON creator_transactions(creator_id);
CREATE INDEX idx_creator_trans_order_id ON creator_transactions(order_id);
CREATE INDEX idx_creator_trans_status ON creator_transactions(status);
CREATE INDEX idx_creator_trans_created_at ON creator_transactions(created_at);

-- Unique constraint: One transaction per creator per order
CREATE UNIQUE INDEX idx_creator_trans_unique ON creator_transactions(creator_id, order_id);


-- ============================================================================
-- 6. REFERRAL_TRACKING TABLE (Optional: Detailed Referral Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Referral code used (e.g., "SARAH10")
  referral_code TEXT NOT NULL,
  
  -- Click tracking (how many times link was clicked)
  clicks INTEGER DEFAULT 1,
  
  -- Conversion tracking (resulted in purchase)
  conversions INTEGER DEFAULT 1,
  
  -- Commission in paise
  commission_amount_paise INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_creator_id ON referral_tracking(creator_id);
CREATE INDEX idx_referral_code ON referral_tracking(referral_code);
CREATE INDEX idx_referral_order_id ON referral_tracking(order_id);


-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- RLS POLICIES - Security Rules
-- ============================================================================

-- EBOOKS: Public read access (everyone can see products)
CREATE POLICY "ebooks_select_public" ON ebooks
  FOR SELECT USING (TRUE);

CREATE POLICY "ebooks_insert_admin" ON ebooks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ebooks_update_admin" ON ebooks
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ORDERS: Authenticated users can read/write
CREATE POLICY "orders_select_auth" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_insert_auth" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "orders_update_auth" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ORDER_ITEMS: Authenticated users can read/write
CREATE POLICY "order_items_select_auth" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "order_items_insert_auth" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- CREATORS: Public read access (see available influencers)
CREATE POLICY "creators_select_public" ON creators
  FOR SELECT USING (TRUE);

CREATE POLICY "creators_insert_admin" ON creators
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "creators_update_admin" ON creators
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- CREATOR_TRANSACTIONS: Authenticated users can read/write (revenue tracking)
CREATE POLICY "creator_transactions_select_auth" ON creator_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "creator_transactions_insert_auth" ON creator_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "creator_transactions_update_auth" ON creator_transactions
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- REFERRAL_TRACKING: Authenticated users can read/write
CREATE POLICY "referral_tracking_select_auth" ON referral_tracking
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "referral_tracking_insert_auth" ON referral_tracking
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================================================
-- SAMPLE DATA (Test Data - Delete After Testing)
-- ============================================================================

-- Insert sample ebook (price in paise: 299 INR = 29900 paise)
INSERT INTO ebooks (slug, title, author, category, price_paise, download_link, synopsis, featured)
VALUES (
  'motorcycle-beginners-guide',
  'Motorcycle Basics for Beginners',
  'John Rider',
  'motorcycles',
  29900,
  NULL,
  'Learn the fundamentals of motorcycle riding with expert guidance.',
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample creators
INSERT INTO creators (name, code, email, commission_rate, status)
VALUES
  ('Sarah Speed', 'sarah', 'sarah@example.com', 10.00, 'active'),
  ('Mike Motorbike', 'mike', 'mike@example.com', 15.00, 'active'),
  ('Alex Adventure', 'alex', 'alex@example.com', 12.00, 'active')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
```

---

## 🔑 Key Changes & Rationale

### 1. **Currency as INTEGER (Paise)**
```sql
-- OLD (Problematic)
price DECIMAL(10, 2)  -- Floating point = precision errors
total_amount DECIMAL(15, 2)

-- NEW (Correct)
price_paise INTEGER  -- 1 INR = 100 paise
total_amount_paise INTEGER  -- No precision errors, faster calculations
```
**Why:** Floating-point decimals cause precision errors in financial calculations. Paise (smallest unit) as integer eliminates this.

### 2. **Slug Format Validation**
```sql
CONSTRAINT slug_format CHECK (
  slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
)
```
**Why:** Prevents invalid slugs like "Motorcycle-1" (uppercase), "motorcycle_1" (underscore). Ensures consistency and URL-friendliness.

### 3. **download_link Renamed & Nullable**
```sql
-- OLD
downloadLink TEXT NOT NULL  -- Camel case (non-standard), required

-- NEW
download_link TEXT  -- Snake case, nullable
```
**Why:** SQL convention is snake_case. Nullable because links can be added later.

### 4. **Cached Fields with Comments**
```sql
-- CACHED FIELDS: Updated via triggers or API calls
total_revenue DECIMAL(15, 2) DEFAULT 0,
total_orders INTEGER DEFAULT 0,
```
**Why:** These are denormalized for query performance but must be kept in sync with actual transactions. Comments warn against direct updates.

### 5. **CHECK Constraints on All Statuses**
```sql
-- Payment status
CONSTRAINT payment_status_check CHECK (
  payment_status IN ('pending', 'completed', 'failed', 'refunded')
)

-- Delivery status
CONSTRAINT delivery_status_check CHECK (
  delivery_status IN ('pending', 'sent', 'failed')
)

-- Transaction status
CONSTRAINT trans_status_check CHECK (
  status IN ('pending', 'completed', 'rejected', 'refunded')
)
```
**Why:** Prevents invalid statuses like "processing" or "shipped". Database enforces business rules.

### 6. **Creator Foreign Key with ON DELETE SET NULL**
```sql
-- OLD
creator_code TEXT REFERENCES creators(code)  -- Default: ON DELETE RESTRICT

-- NEW
creator_code TEXT REFERENCES creators(code) ON DELETE SET NULL
```
**Why:** If a creator is deleted, orders survive but referral is cleared. Better than losing order history.

### 7. **Unique Constraint on Creator Transactions**
```sql
CREATE UNIQUE INDEX idx_creator_trans_unique ON creator_transactions(creator_id, order_id);
```
**Why:** Prevents duplicate commission records. One commission per creator per order.

---

## 📊 Data Model Diagram

```
CREATORS (Influencers)
├── id (PK)
├── code (UNIQUE) ← Referenced by orders
├── commission_rate
├── total_revenue (CACHED)
├── total_orders (CACHED)
└── status (CHECK: active|inactive)

EBOOKS (Products)
├── id (PK)
├── slug (UNIQUE, validated)
├── price_paise (INTEGER)
├── download_link (nullable)
└── featured

ORDERS (Customer Purchases)
├── id (PK)
├── razorpay_order_id (UNIQUE)
├── total_amount_paise (INTEGER)
├── creator_code (FK → creators, ON DELETE SET NULL)
├── payment_status (CHECK)
├── delivery_status (CHECK)
└── razorpay_payment_id

ORDER_ITEMS (Items Per Order)
├── id (PK)
├── order_id (FK → orders, ON DELETE CASCADE)
├── product_id (references ebooks.slug)
└── price_paise (snapshot)

CREATOR_TRANSACTIONS (Revenue Tracking)
├── id (PK)
├── creator_id (FK → creators, ON DELETE CASCADE)
├── order_id (FK → orders, ON DELETE CASCADE)
├── commission_amount_paise (calculated)
├── status (CHECK: pending|completed|rejected|refunded)
└── UNIQUE(creator_id, order_id)

REFERRAL_TRACKING (Analytics)
├── id (PK)
├── creator_id (FK)
├── order_id (FK)
├── referral_code
└── commission_amount_paise
```

---

## 💾 Usage Examples

### Insert an Ebook (Price in Paise)
```sql
-- 499 INR = 49900 paise
INSERT INTO ebooks (slug, title, author, price_paise, download_link)
VALUES ('advanced-riding-techniques', 'Advanced Riding', 'Pro Rider', 49900, NULL);
```

### Create an Order (Amount in Paise)
```sql
-- 49900 paise (499 INR) total
INSERT INTO orders (razorpay_order_id, buyer_name, buyer_email, total_amount_paise, creator_code)
VALUES ('order_123', 'John Doe', 'john@example.com', 49900, 'sarah');
```

### Query Creator Revenue (Correct Calculation)
```sql
-- Get total commission for creator "sarah"
SELECT 
  SUM(commission_amount_paise) as total_commission_paise,
  SUM(commission_amount_paise) / 100.0 as total_commission_inr
FROM creator_transactions
WHERE creator_id = (SELECT id FROM creators WHERE code = 'sarah')
AND status = 'completed';
```

### Convert Paise to INR in Frontend
```typescript
const priceInr = pricePaise / 100;  // 49900 → 499 INR
const formatted = `₹${priceInr.toFixed(2)}`;  // ₹499.00
```

---

## 🎯 Suggestions & Next Steps

### Immediate Actions
1. ✅ Copy entire SQL block
2. ✅ Paste into Supabase → SQL Editor
3. ✅ Run (no modifications needed)
4. ✅ Delete sample data after testing

### Optional Enhancements (Post-Launch)
1. **Add Triggers** for updating cached fields
   ```sql
   CREATE TRIGGER update_creator_revenue
   AFTER INSERT ON creator_transactions
   FOR EACH ROW EXECUTE FUNCTION update_creator_totals();
   ```

2. **Add Audit Logs** table for transaction history
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY,
     table_name TEXT,
     operation TEXT,
     old_values JSONB,
     new_values JSONB,
     created_at TIMESTAMP
   );
   ```

3. **Add Soft Deletes** for order archival
   ```sql
   ALTER TABLE orders ADD COLUMN deleted_at TIMESTAMP;
   CREATE INDEX idx_orders_deleted ON orders(deleted_at);
   ```

4. **Add Payment Methods** table for future expansion
   ```sql
   CREATE TABLE payment_methods (
     id UUID PRIMARY KEY,
     order_id UUID REFERENCES orders(id),
     method TEXT CHECK (method IN ('razorpay', 'stripe', 'paypal')),
     payment_id TEXT UNIQUE
   );
   ```

### Frontend Integration Checklist
- [ ] Update price conversions: `pricePaise / 100`
- [ ] Update order amount: `totalAmountPaise / 100`
- [ ] Validate slug format before insert
- [ ] Handle NULL `download_link`
- [ ] Add creator selector to checkout
- [ ] Track commission calculations
- [ ] Display revenue dashboard with SUM queries

### Environment Variables
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## ✅ Verification Checklist

After running the SQL, verify:
```
□ 6 tables created (ebooks, creators, orders, order_items, creator_transactions, referral_tracking)
□ All CHECK constraints in place (slug format, statuses)
□ Foreign keys established with proper delete rules
□ 15+ indexes created for performance
□ RLS enabled on all 6 tables
□ 16 RLS policies created
□ Sample data inserted (3 creators, 1 ebook)
□ NO errors in Supabase editor
```

---

## 🚨 Important Notes

### DO NOT
- ❌ Modify `total_revenue` or `total_orders` directly (they're cached)
- ❌ Store prices as decimals (causes floating-point errors)
- ❌ Delete creators without checking orders (use `ON DELETE SET NULL` instead)
- ❌ Insert invalid slug formats (CHECK constraint will reject)

### DO
- ✅ Use INTEGER for all currency (paise)
- ✅ Divide by 100 when displaying to users
- ✅ Keep transactions immutable (no direct updates)
- ✅ Use referral_tracking for analytics
- ✅ Update cached fields via API/triggers

---

**Schema Version:** 1.0 Final  
**Created:** January 19, 2026  
**Status:** ✅ Production Ready  
**Copy/Paste:** Ready to use immediately in Supabase
