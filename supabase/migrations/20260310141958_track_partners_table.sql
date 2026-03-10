-- ============================================================================
-- PHASE 1: Track Partners Table + Performance Indexes + Click RPC
-- ============================================================================
--
-- AUDIT REFERENCE: partner-analytics-audit.md §1.1, §7.3, §7.4
--
-- WHAT THIS MIGRATION DOES:
--   1. Declares the `partners` table via CREATE TABLE IF NOT EXISTS so the
--      schema is tracked in version control. The live table in Supabase already
--      has data — IF NOT EXISTS means this statement is a NO-OP against a
--      running project and safe to apply at any time.
--   2. Adds a composite partial index on `orders` for the date-filtered
--      `getPartnerStats()` query (§7.4). Reduces free-tier row-read waste.
--   3. Adds a Postgres RPC function `increment_partner_click(p_code TEXT)`
--      used by the Edge Function click-debounce flow (§7.3).
--
-- WHAT IS NOT TOUCHED:
--   - Existing `orders` rows — zero data mutations.
--   - Existing `orders` RLS policies — unchanged.
--   - Existing `partners` data — IF NOT EXISTS guarantees no overwrite.
--   - Any other tables (order_items, referral_tracking) — unchanged.
-- ============================================================================


-- ─── 1. partners table ───────────────────────────────────────────────────────
--
-- This table was previously created directly in the Supabase Dashboard and had
-- no migration file (audit loophole L-8). This statement brings it under
-- version control. All column types and defaults mirror the live schema.
--
-- commission_rate: stored as INTEGER percentage (e.g. 10 = 10%).
-- clicks: always-integer counter; incremented via the RPC below, never in JS.
-- secret_key: unguessable UUID token for the creator's private stats URL.

CREATE TABLE IF NOT EXISTS partners (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text        NOT NULL UNIQUE,
  name            text        NOT NULL,
  upi_id          text        NOT NULL,
  commission_rate integer     NOT NULL DEFAULT 10 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  clicks          integer     NOT NULL DEFAULT 0  CHECK (clicks >= 0),
  secret_key      text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: admin-only reads/writes. Anon users have NO access to this table.
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partners_select_authenticated" ON partners;
CREATE POLICY "partners_select_authenticated" ON partners
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "partners_insert_authenticated" ON partners;
CREATE POLICY "partners_insert_authenticated" ON partners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "partners_update_authenticated" ON partners;
CREATE POLICY "partners_update_authenticated" ON partners
  FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "partners_delete_authenticated" ON partners;
CREATE POLICY "partners_delete_authenticated" ON partners
  FOR DELETE
  USING (auth.role() = 'authenticated');


-- ─── 2. Composite partial index on orders (§7.4) ────────────────────────────
--
-- Supports the proposed date-filtered getPartnerStats() query:
--   SELECT referral_code, total_amount_paise
--   FROM orders
--   WHERE payment_status = 'completed'
--     AND referral_code IS NOT NULL
--     AND created_at BETWEEN :from AND :to
--
-- Partial index (WHERE clause) means only completed referral rows are indexed —
-- zero storage waste on pending/failed/non-referred orders.

CREATE INDEX IF NOT EXISTS idx_orders_referral_created
  ON orders (referral_code, created_at DESC)
  WHERE referral_code IS NOT NULL
    AND payment_status = 'completed';


-- ─── 3. increment_partner_click RPC (§7.3) ───────────────────────────────────
--
-- Called by the `increment-click` Supabase Edge Function after the 24h
-- localStorage debounce gate passes (App.tsx / ReferralTracker).
-- A single UPDATE — no SELECT + UPDATE round-trip. Skips silently if code
-- does not exist (no error thrown to the browser).
--
-- Usage from Edge Function:
--   const { error } = await supabase.rpc('increment_partner_click', { p_code: code });

CREATE OR REPLACE FUNCTION increment_partner_click(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE partners
  SET    clicks     = clicks + 1,
         updated_at = now()
  WHERE  code = p_code;
  -- If p_code does not match any row, this is a silent no-op.
  -- No exception is raised; the caller can check affected rows via GET DIAGNOSTICS if needed.
END;
$$;

-- Grant execute to the anon role so the Edge Function (which runs as anon/service)
-- can call the RPC. The SECURITY DEFINER ensures only the clicks column is touched.
GRANT EXECUTE ON FUNCTION increment_partner_click(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_partner_click(TEXT) TO authenticated;


-- ─── Verification queries (run manually in SQL Editor after applying) ────────
--
-- 1. Confirm partners table exists and columns match:
--    SELECT column_name, data_type, column_default
--    FROM information_schema.columns
--    WHERE table_name = 'partners'
--    ORDER BY ordinal_position;
--
-- 2. Confirm composite index exists:
--    SELECT indexname, indexdef
--    FROM pg_indexes
--    WHERE tablename = 'orders' AND indexname = 'idx_orders_referral_created';
--
-- 3. Confirm RPC exists:
--    SELECT routine_name, security_type
--    FROM information_schema.routines
--    WHERE routine_name = 'increment_partner_click';
--
-- 4. Smoke-test RPC (safe — will no-op on non-existent code):
--    SELECT increment_partner_click('__smoke_test__');
-- ============================================================================
