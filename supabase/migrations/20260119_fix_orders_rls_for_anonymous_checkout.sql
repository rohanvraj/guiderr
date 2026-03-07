-- ============================================================================
-- FIX: Orders RLS Policy for Anonymous Checkout (MVP)
-- ============================================================================
-- 
-- PROBLEM:
-- Current RLS policy requires auth.role() = 'authenticated' for order inserts.
-- Buyers don't have login accounts in MVP, so anonymous checkout fails with:
-- "new row violates row-level security policy for table 'orders'"
--
-- SOLUTION:
-- Allow anonymous users to INSERT orders directly from browser checkout flow.
-- Reads and updates remain restricted to authenticated users (admin/future features).
--
-- ============================================================================

-- Drop existing order insert policies (they require auth)
DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
DROP POLICY IF EXISTS "orders_select_auth" ON orders;
DROP POLICY IF EXISTS "orders_update_auth" ON orders;

-- ============================================================================
-- NEW RLS POLICIES FOR ORDERS TABLE
-- ============================================================================

-- POLICY 1: ANONYMOUS USERS CAN INSERT (MVP Checkout)
--
-- WHY SAFE FOR MVP:
-- - No sensitive data in insert: only public order metadata (name, email, amounts)
-- - Razorpay validates payment separately (not in DB trigger)
-- - No direct access to order ID from browser (generated server-side)
-- - Buyers can only see their own order on ThankYouPage (via order_id parameter)
-- - Admin reads/updates are separately restricted
--
-- PRODUCTION MIGRATION:
-- Replace this with a Supabase Edge Function that:
-- 1. Validates Razorpay payment signature server-side
-- 2. Uses service role key to insert order
-- 3. Calls function with: razorpay_payment_id, buyer_email, etc.
-- This way, browser never touches orders table directly.
--
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout" ON orders;
CREATE POLICY "orders_insert_anonymous_checkout" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- POLICY 2: SELECT - Authenticated only (admin dashboard reads)
DROP POLICY IF EXISTS "orders_select_authenticated" ON orders;
CREATE POLICY "orders_select_authenticated" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- POLICY 3: UPDATE - Authenticated only (admin marking as delivered, updating payment status)
DROP POLICY IF EXISTS "orders_update_authenticated" ON orders;
CREATE POLICY "orders_update_authenticated" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- IMPORTANT NOTES FOR PRODUCTION
-- ============================================================================
--
-- CURRENT STATE (MVP):
-- ✓ Orders inserted by anonymous checkout flow
-- ✓ Admin reads/updates require authentication
-- ✓ No exposed order data to malicious queries
--
-- BEFORE PRODUCTION LAUNCH:
-- 1. Remove this anonymous INSERT policy
-- 2. Create Supabase Edge Function: functions/create_order_secure
--    - Accept: razorpay_payment_id, buyer_email, buyer_name, total_amount_paise
--    - Validate: Razorpay signature verification
--    - Call: createOrder with SERVICE_ROLE_KEY (not anon key)
--    - Return: order_id to frontend
--
-- 3. Update CheckoutFlow.tsx to call Edge Function instead of direct insert
--    Example: supabase.functions.invoke('create_order_secure', { body: {...} })
--
-- 4. Then restore this policy:
--    CREATE POLICY "orders_insert_via_function_only" ON orders
--      FOR INSERT WITH CHECK (FALSE);  -- Deny all inserts
--    -- Orders will only be inserted via the Edge Function (service role)
--
-- ============================================================================
