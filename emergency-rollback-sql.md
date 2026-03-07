# Emergency Rollback — Phase 4 Database Security Hardening

> **When to use:** Only if Phase 4 RLS changes break your live checkout flow or admin dashboard.  
> **Effect:** Returns the `orders` table policies to the state at end of Phase 3 (Migration `20260120`).  
> **Data impact:** NONE — this only changes policy objects, not table data or schema.

---

## Step-by-Step Instructions

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/luxeufxyluqxrwuejjpx
2. Go to **SQL Editor** (left sidebar).
3. Click **New Query**.
4. Paste the **entire SQL block** from Section A below.
5. Click **Run** (or press Cmd+Enter).
6. Confirm you see `Success. No rows returned` for each statement.
7. Paste the **verification query** from Section B and run it.
8. Confirm you see exactly **4 policies** listed in the results.

---

## Section A — Rollback SQL

```sql
-- ============================================================================
-- EMERGENCY ROLLBACK: Revert Phase 4 security hardening
-- Returns orders RLS to the state at end of Phase 3 (migration 20260120)
-- ============================================================================

-- ─── 1. DROP the Phase 4 policies ───────────────────────────────────────────

DROP POLICY IF EXISTS "orders_select_scoped" ON orders;
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout_restricted" ON orders;
DROP POLICY IF EXISTS "orders_update_authenticated" ON orders;

-- ─── 2. RE-CREATE the original Phase 3 policies ────────────────────────────

-- Original anonymous token-based SELECT (from migration 20260120)
CREATE POLICY "orders_select_by_public_token_anonymous" ON orders
  FOR SELECT
  USING (
    auth.role() = 'anon'
    AND public_token IS NOT NULL
  );

-- Original authenticated SELECT (from migration 20260120)
CREATE POLICY "orders_select_authenticated" ON orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Original anonymous INSERT with no restrictions (from migration 20260119)
CREATE POLICY "orders_insert_anonymous_checkout" ON orders
  FOR INSERT
  WITH CHECK (TRUE);

-- Original authenticated UPDATE (from migration 20260119)
CREATE POLICY "orders_update_authenticated" ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## Section B — Verification Query

Run this after the rollback to confirm all 4 original policies are restored:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
```

**Expected output (4 rows):**

| policyname | cmd | qual | with\_check |
|---|---|---|---|
| orders\_insert\_anonymous\_checkout | INSERT | | `true` |
| orders\_select\_authenticated | SELECT | `(auth.role() = 'authenticated')` | |
| orders\_select\_by\_public\_token\_anonymous | SELECT | `((auth.role() = 'anon') AND (public_token IS NOT NULL))` | |
| orders\_update\_authenticated | UPDATE | `(auth.role() = 'authenticated')` | `(auth.role() = 'authenticated')` |

If you see exactly these 4 rows, the rollback is complete and your database is back to its Phase 3 state.
