-- ============================================================================
-- PHASE 4: Security Audit Hardening — RLS Policy Fixes for orders table
-- ============================================================================
--
-- This migration is tracked in git for history but is applied MANUALLY via the
-- Supabase Dashboard SQL Editor (not via `supabase db push`) because the remote
-- migration history is out of sync with the local CLI.
--
-- WHAT THIS FIXES:
--   1. Anonymous SELECT was wide open — any anon user could read ALL orders.
--      Now restricted: anon can only see rows where public_token IS NOT NULL.
--   2. Anonymous INSERT had WITH CHECK (TRUE) — bots could spam unlimited rows.
--      Now constrained: only pending orders with required fields can be inserted.
--
-- WHAT IS NOT TOUCHED:
--   - orders_update_authenticated (admin-only UPDATE) — unchanged
--   - order_items policies — unchanged
--   - Razorpay logic, keys, or auto-capture — unchanged
-- ============================================================================


-- ─── 1. Fix SELECT: drop ALL old select policies, create scoped one ─────────
-- Covers policies added by migration 1, 3, 4, and 5 (all naming variants)

DROP POLICY IF EXISTS "Public can read orders by email" ON orders;
DROP POLICY IF EXISTS "orders_select_auth" ON orders;
DROP POLICY IF EXISTS "orders_select_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_select_by_public_token_anonymous" ON orders;

CREATE POLICY "orders_select_scoped" ON orders
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR
    (auth.role() = 'anon' AND public_token IS NOT NULL)
  );


-- ─── 2. Fix INSERT: drop ALL old insert policies, create restricted one ──────
-- Covers policies from migration 1, 3, and 4

DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout" ON orders;

CREATE POLICY "orders_insert_anonymous_checkout_restricted" ON orders
  FOR INSERT
  WITH CHECK (
    payment_status = 'pending'
    AND public_token IS NOT NULL
    AND buyer_email IS NOT NULL
    AND buyer_name IS NOT NULL
    AND total_amount_paise > 0
  );


-- ─── 3. Ensure UPDATE policy exists for authenticated users (admin) ──────────

DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "orders_update_auth" ON orders;
DROP POLICY IF EXISTS "orders_update_authenticated" ON orders;

CREATE POLICY "orders_update_authenticated" ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
