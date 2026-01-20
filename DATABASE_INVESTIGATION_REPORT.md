# Supabase Database Investigation Report

**Generated:** January 20, 2026  
**Project:** Guiderr  
**Status:** COMPREHENSIVE ANALYSIS COMPLETE

---

## 📋 Executive Summary

Your Guiderr Supabase project uses **TWO DIFFERENT TABLE NAMING CONVENTIONS**:

1. **Active in Migrations:** `creators` table (influencer/partner data)
2. **Referenced in Code:** `partners` table (legacy affiliate system)
3. **CRITICAL ISSUE:** The `partners` table is **NOT created in any migration file**

---

## 🔍 Findings

### 1. TABLE NAMES & SOURCES

#### Created via Migrations (✅ Exists):

| Table | Columns | Source | Status |
|-------|---------|--------|--------|
| `ebooks` | id, slug, title, author, category, price, downloadLink, cover_image, synopsis, featured, created_at, updated_at | [20260119_guiderr_complete_schema.sql](supabase/migrations/20260119_guiderr_complete_schema.sql) | ✅ Active |
| `orders` | id, razorpay_order_id, buyer_name, buyer_email, total_amount, creator_code, payment_status, delivery_status, razorpay_payment_id, notes, public_token, created_at, updated_at | [20251205120141_create_orders_and_payments_tables.sql](supabase/migrations/20251205120141_create_orders_and_payments_tables.sql) + updates | ✅ Active |
| `order_items` | id, order_id, product_id, product_title, price, delivery_link_sent, created_at | Same | ✅ Active |
| `creators` | id, name, code, email, commission_rate, total_revenue, total_orders, status, created_at, updated_at | [20260119_guiderr_complete_schema.sql](supabase/migrations/20260119_guiderr_complete_schema.sql) | ✅ Active |
| `creator_transactions` | id, creator_id, order_id, order_amount, commission_rate, commission_amount, status, notes, created_at, updated_at | [20260119_guiderr_complete_schema.sql](supabase/migrations/20260119_guiderr_complete_schema.sql) | ✅ Active |
| `referral_tracking` | id, creator_id, order_id, referral_code, clicks, conversions, commission_amount, created_at | [20260119_guiderr_complete_schema.sql](supabase/migrations/20260119_guiderr_complete_schema.sql) | ✅ Active |

#### Referenced in Code BUT NOT in Migrations (❌ Missing):

| Table | Referenced In | Expected Columns | Status |
|-------|---|---|---|
| `partners` | [src/utils/supabase.ts](src/utils/supabase.ts) line 33-40 | id, code, name, upi_id, commission_rate, clicks, created_at, updated_at | ❌ **DOES NOT EXIST** |

---

## 🔍 CRITICAL ISSUE: Partners Table

### Problem
The code expects a `partners` table:

```typescript
// From src/utils/supabase.ts (Line 33-40)
export interface Partner {
  id: string;
  code: string;
  name: string;
  upi_id: string;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}
```

But **no migration file creates this table**.

### Where It's Referenced:
- ✅ [src/utils/supabase.ts](src/utils/supabase.ts) - `getAllPartners()`, `getPartnerStats()`
- ✅ [src/pages/PartnersManagement.tsx](src/pages/PartnersManagement.tsx)
- ✅ [src/components/admin/PartnersAnalytics.tsx](src/components/admin/PartnersAnalytics.tsx)
- ✅ [AFFILIATE_SYSTEM_COMPLETE.md](AFFILIATE_SYSTEM_COMPLETE.md) - SQL creation instructions (line 157)

### Expected Schema (from Documentation):
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  commission_rate NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 Database Schema Details

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id TEXT UNIQUE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  total_amount_paise DECIMAL(15, 2),      -- Stored in paise (1 INR = 100 paise)
  referral_code TEXT,                      -- Links to partners or creators
  creator_code TEXT,                       -- Links to creators table
  public_token UUID,                       -- For anonymous checkout (thank-you page)
  payment_status TEXT ('pending'|'completed'|'failed'),
  delivery_status TEXT ('pending'|'delivered'),
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Creators Table
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,               -- Unique identifier (e.g., "sarah", "mike")
  email TEXT,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  total_revenue DECIMAL(15, 2) DEFAULT 0,  -- CACHED (not updated automatically)
  total_orders INTEGER DEFAULT 0,           -- CACHED (not updated automatically)
  status TEXT ('active'|'inactive'),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Sample data inserted:
-- ('Sarah Speed', 'sarah', 'sarah@example.com', 10.00, 'active')
-- ('Mike Motorbike', 'mike', 'mike@example.com', 15.00, 'active')
-- ('Alex Adventure', 'alex', 'alex@example.com', 12.00, 'active')
```

---

## 🔐 RLS Policies

### Orders Table RLS

```sql
-- Anonymous users CAN insert (MVP checkout)
CREATE POLICY "orders_insert_anonymous_checkout" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Authenticated users can select
CREATE POLICY "orders_select_authenticated" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "orders_update_authenticated" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anonymous users can select by public_token
CREATE POLICY "orders_select_by_public_token_anonymous" ON orders
  FOR SELECT USING (auth.role() = 'anon');
```

**Impact:** Anonymous (unauthenticated) users can:
- ✅ INSERT orders
- ✅ SELECT orders (by public_token on thank-you page)

Authenticated users can:
- ✅ SELECT orders (admin dashboard)
- ✅ UPDATE orders (admin marking as delivered)

### Partners Table RLS (if it existed)

```sql
CREATE POLICY "authenticated_full" ON partners
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_read_only" ON partners
  FOR SELECT TO anon
  USING (true);
```

**Impact:** Anon users can only READ. No write access.

### Creators Table RLS

```sql
CREATE POLICY "creators_select_public" ON creators
  FOR SELECT USING (TRUE);
```

**Impact:** Everyone can read creators (public read).

---

## 🧪 How to Verify Data Was Inserted

### Test 1: Check if Creators Exist
```typescript
import { supabase } from './src/utils/supabase';

const { data: creators, error } = await supabase
  .from('creators')
  .select('*');

console.log('Creators:', creators);
// Should return: Sarah Speed, Mike Motorbike, Alex Adventure
```

### Test 2: Check Orders
```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .limit(5);

console.log('Recent orders:', orders);
// Shows any test orders created during checkout
```

### Test 3: Check Referral Tracking
```typescript
const { data: tracking, error } = await supabase
  .from('referral_tracking')
  .select('*');

console.log('Referral tracking:', tracking);
// Shows which referral codes generated sales
```

### Test 4: Via Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project → **SQL Editor**
3. Run:
   ```sql
   SELECT COUNT(*) as creator_count FROM creators;
   SELECT COUNT(*) as order_count FROM orders;
   SELECT COUNT(*) as referral_count FROM referral_tracking;
   ```

---

## ❌ Why Queries Fail

If you see errors like:
- `"relation 'partners' does not exist"` → The `partners` table was never created
- `"permission denied for schema public"` → RLS policy is blocking the query
- `"violates row-level security policy"` → You don't have permission for that operation

### Most Likely Issue
Your code is trying to read from the `partners` table, but **it doesn't exist in your Supabase database**. You should either:

1. **Option A:** Create the `partners` table manually in Supabase
2. **Option B:** Rename `partners` references to use `creators` table instead
3. **Option C:** Create a migration file to generate the `partners` table

---

## 📝 Environment Configuration

### Location
[.env.example](/.env.example)

### Required Variables
```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=your-razorpay-key
VITE_ADMIN_PASSWORD=guiderr2024
```

**Important:** These are exposed in the browser (it's safe - anon key is not secret).

---

## 🔑 Key Insights

### 1. Two Systems Exist:
- **`creators` table** - Used in migrations (authoritative)
- **`partners` table** - Used in frontend code (missing)

### 2. Sample Data:
The migrations insert 3 sample creators that should exist:
- Sarah Speed (code: `sarah`, commission: 10%)
- Mike Motorbike (code: `mike`, commission: 15%)
- Alex Adventure (code: `alex`, commission: 12%)

### 3. Data Integrity:
- ✅ Total revenue and order counts are CACHED fields (not auto-updated)
- ✅ Must be calculated from `referral_tracking` or `creator_transactions`
- ✅ Currency in paise (100 paise = 1 INR)

### 4. Anonymous Checkout:
- ✅ Allowed by RLS policy (no auth required)
- ✅ Each order gets a unique `public_token` for security
- ✅ Thank-you page can look up order by `public_token`

### 5. Admin Operations:
- ✅ Require authentication (Supabase Auth or localStorage password)
- ✅ Can view all orders and update delivery status
- ✅ Partner creation disabled in frontend (must use Supabase Dashboard)

---

## 🎯 Recommendations

### Immediate Action
1. **Verify the table exists:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partners');
   ```

2. **If `partners` table does NOT exist:**
   - Create it manually in Supabase SQL Editor, OR
   - Update code to use `creators` table instead

3. **If `partners` table DOES exist:**
   - Check if it has data:
     ```sql
     SELECT COUNT(*) FROM partners;
     SELECT * FROM partners LIMIT 10;
     ```

### Data Verification Checklist
- [ ] Sample creators exist (sarah, mike, alex)
- [ ] Orders table has test orders
- [ ] Referral codes are properly linked
- [ ] RLS policies allow expected access
- [ ] Partners table is created (if using affiliate system)

### For Production
- [ ] Remove anonymous INSERT policy from orders
- [ ] Create Supabase Edge Function for secure order creation
- [ ] Add proper Supabase Auth instead of localStorage password
- [ ] Set up automated payouts via partners analytics

---

## 📎 Related Documentation

- [AFFILIATE_SYSTEM_COMPLETE.md](AFFILIATE_SYSTEM_COMPLETE.md)
- [SECURITY_RESTORATION_COMPLETE.md](SECURITY_RESTORATION_COMPLETE.md)
- [SUPABASE_SCHEMA_FINAL.md](SUPABASE_SCHEMA_FINAL.md)
- [RLS_FIX_PARTNERS.md](RLS_FIX_PARTNERS.md)
- [supabase/migrations/20260119_guiderr_complete_schema.sql](supabase/migrations/20260119_guiderr_complete_schema.sql)

---

## 🚨 Critical Next Steps

1. **Check if `partners` table exists** in your Supabase project
2. **If missing:** Either create it or update references to use `creators`
3. **If exists:** Verify it has data with the queries above
4. **Test data insertion:** Run a test checkout to verify orders are being saved
5. **Check RLS policies:** Ensure they match the ones in the migrations

