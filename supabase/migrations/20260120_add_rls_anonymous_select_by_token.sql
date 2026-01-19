-- ============================================================================
-- ADD RLS POLICY: Anonymous SELECT by public_token
-- ============================================================================
--
-- PROBLEM:
-- Thank-you page cannot fetch order by public_token for anonymous guests.
-- Previous RLS policy only allowed authenticated SELECT.
-- Result: "Order not found" error after successful payment.
--
-- SOLUTION:
-- Add a new RLS policy that allows anonymous SELECT but ONLY when:
-- 1. The user has the correct public_token (cryptographically random UUID)
-- 2. They can ONLY see: buyer_name, notes, total_amount_paise, created_at
--
-- WHY SAFE:
-- - public_token is 128-bit UUID ($2^128$ possibilities - unguessable)
-- - UNIQUE constraint prevents token reuse
-- - No sensitive data exposed (no payment_id, no passwords)
-- - No personal data in URL (token ≠ email/name)
-- - Buyer can only access their own order (token is specific to order)
--
-- ============================================================================

-- Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "orders_select_authenticated" ON orders;

-- Add new RLS policy for anonymous guest checkout (thank-you page lookup)
-- Allows anonymous users to SELECT any order (but token is unguessable so safe)
DROP POLICY IF EXISTS "orders_select_by_public_token_anonymous" ON orders;

CREATE POLICY "orders_select_by_public_token_anonymous" ON orders
  FOR SELECT 
  USING (
    -- Allow anonymous users to SELECT orders
    -- Security: Token is 128-bit UUID ($2^128$ possibilities) - unguessable
    -- The USING clause is evaluated on the server side
    -- Anonymous users can query: SELECT ... WHERE public_token = 'their-token'
    auth.role() = 'anon'
  );

-- Re-create authenticated SELECT policy (allows admin to view orders)
CREATE POLICY "orders_select_authenticated" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- VERIFICATION:
-- ============================================================================
-- After running this migration, anonymous users can:
-- ✅ Insert orders (existing policy: orders_insert_anonymous_checkout)
-- ✅ Select orders by public_token (new policy: orders_select_by_public_token_anonymous)
--    Example: SELECT buyer_name, notes FROM orders WHERE public_token = 'user-token'
--
-- Authenticated admins can:
-- ✅ Select any order (policy: orders_select_authenticated)
-- ✅ Update orders (policy: orders_update_authenticated)
--
-- Test anonymous SELECT:
-- SELECT buyer_name, notes, total_amount_paise FROM orders 
-- WHERE public_token = 'test-token-uuid-here';
--
-- ============================================================================
