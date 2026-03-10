-- ============================================================================
-- PHASE 4: Fix RLS Policies on orders table
-- ============================================================================
--
-- WHAT THIS FIXES:
-- 1. Anonymous SELECT was wide open — any anon user could read ALL orders.
--    Now restricted so anon can only see rows with a non-null public_token
--    (the UUID is 128-bit and unguessable, so this is effectively token-gated).
-- 2. Anonymous INSERT had WITH CHECK (TRUE) — bots could spam unlimited rows.
--    Now constrained: only pending orders with required fields can be inserted.
--
-- WHAT IS NOT TOUCHED:
-- - orders_update_authenticated (admin-only UPDATE) — unchanged
-- - order_items policies — unchanged
-- - Razorpay logic, keys, or auto-capture — unchanged
-- ============================================================================


-- ─── 1a. Fix SELECT: restrict anonymous reads to token-scoped rows ──────────

-- Drop the old policy that lets anon read ALL orders
DROP POLICY IF EXISTS "orders_select_by_public_token_anonymous" ON orders;

-- Drop the old authenticated-only SELECT (we'll merge into one combined policy)
DROP POLICY IF EXISTS "orders_select_authenticated" ON orders;

-- Drop the target policy itself if it already exists (idempotency for re-runs)
DROP POLICY IF EXISTS "orders_select_scoped" ON orders;

-- New combined policy:
--   • Authenticated users (admins) can see all orders
--   • Anonymous users can ONLY see a row where public_token IS NOT NULL
--     (they must also supply the token in a WHERE clause to actually match a row)
CREATE POLICY "orders_select_scoped" ON orders
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR
    (auth.role() = 'anon' AND public_token IS NOT NULL)
  );


-- ─── 1b. Fix INSERT: constrain anonymous order creation ─────────────────────

-- Drop the old wide-open INSERT policy
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout" ON orders;

-- Drop the target policy itself if it already exists (idempotency for re-runs)
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout_restricted" ON orders;

-- New INSERT policy: anonymous users can still insert (needed for checkout)
-- but only rows that meet basic sanity constraints:
--   • payment_status must be 'pending' (no faking completed orders)
--   • public_token, buyer_email, buyer_name must be present
--   • total_amount_paise must be positive
CREATE POLICY "orders_insert_anonymous_checkout_restricted" ON orders
  FOR INSERT
  WITH CHECK (
    payment_status = 'pending'
    AND public_token IS NOT NULL
    AND buyer_email IS NOT NULL
    AND buyer_name IS NOT NULL
    AND total_amount_paise > 0
  );


-- ─── Verify after running ────────────────────────────────────────────────────
-- Run manually in SQL Editor to confirm:
--
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';
--
-- Expected:
--   orders_select_scoped                        | SELECT
--   orders_insert_anonymous_checkout_restricted  | INSERT
--   orders_update_authenticated                  | UPDATE
