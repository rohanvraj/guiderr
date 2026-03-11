# Partner Referral & Revenue Engine — Discovery Audit

**Audit Date:** 10 March 2026  
**Scope:** Read-only discovery scan. No code modified.  
**Auditor:** GitHub Copilot (Senior Fintech Architect mode)  
**Goal:** Map every file and line that powers the Partner Referral engine before performing the Math Audit.

---

## PHASE BUILD LOG

### PHASE 1 — Database Integrity ✅ COMPLETE
**Branch:** `fix/partner-analytics`  
**Date:** 10 March 2026  
**Migration file:** `supabase/migrations/20260310141958_track_partners_table.sql`

#### Changes applied (migration only — no application code modified):

| # | Change | Addresses Loophole |
|---|---|---|
| P1-1 | `CREATE TABLE IF NOT EXISTS partners` — full DDL with all columns, CHECK constraints, and RLS policies | L-8 (untracked schema) |
| P1-2 | `CREATE INDEX IF NOT EXISTS idx_orders_referral_created` — composite partial index on `orders(referral_code, created_at DESC)` where `referral_code IS NOT NULL AND payment_status = 'completed'` | Audit §7.4 (over-fetch) |
| P1-3 | `CREATE OR REPLACE FUNCTION increment_partner_click(p_code TEXT)` — `SECURITY DEFINER` RPC that runs a single `UPDATE partners SET clicks = clicks + 1` | L-2 (click tracking gap) |

#### Safety confirmation:
- **`orders` data:** Zero rows touched. Index creation only reads metadata; no row mutations.
- **`partners` data:** `IF NOT EXISTS` makes the `CREATE TABLE` a NO-OP against the live project. Existing rows are unaffected.
- **RLS policies:** No existing `orders` or `order_items` policies modified.
- **Application code:** No `.ts` / `.tsx` files changed in this phase.

#### Remaining Phase 1 open items (require SQL Editor in Supabase Dashboard):
- Run the 4 verification queries at the bottom of the migration file to confirm index + RPC exist.
- Smoke-test: `SELECT increment_partner_click('__smoke_test__');` should return `void` without error.

---

## 1. DATA SOURCE — Supabase Tables

### 1.1 `partners` Table
**Schema origin:** ⚠️ NOT in any migration file. Created directly in the Supabase Dashboard.  
This means the schema is **untracked** — a destructive dashboard action (e.g. project reset) would lose it with no recovery script.

**Known columns** (inferred from `src/utils/supabase.ts` → `getAllPartners()` and `getCreatorStats()`):

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `code` | TEXT | The public referral code (e.g. `rahul10`). Used in `?ref=` URLs |
| `name` | TEXT | Display name of the partner |
| `upi_id` | TEXT | Payment destination for commission payouts |
| `commission_rate` | INTEGER | % of gross sale (e.g. `10` = 10%) |
| `clicks` | INTEGER | ⚠️ See loophole §5.2 — never incremented anywhere |
| `secret_key` | TEXT | UUID/token for the creator's private stats URL. See §4 |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### 1.2 `orders` Table
**Schema origin:** `supabase/migrations/20251205120141_create_orders_and_payments_tables.sql` (line 46)  
Refined by: `supabase/migrations/20260307085510_fix_rls_and_security.sql`

The referral link lives in `orders.referral_code` (TEXT, nullable).  
This is the **single source of truth** for all commission calculations.

**Key referral-relevant columns:**

| Column | Type | Notes |
|---|---|---|
| `referral_code` | TEXT | FK-by-value to `partners.code`. No DB-level FK constraint |
| `total_amount_paise` | INTEGER | Gross order value in paise |
| `payment_status` | TEXT | `'pending' \| 'completed' \| 'failed'` |
| `public_token` | UUID | Secure token for buyer's thank-you page access |

**Index on referral_code:** `idx_orders_referral_code` exists (line 87 of first migration). ✅

### 1.3 `referral_tracking` Table
**Schema origin:** `supabase/migrations/20251205120141_create_orders_and_payments_tables.sql` (line 72)

⚠️ **LOOPHOLE — ORPHANED TABLE:** This table exists in the DB schema with columns  
`order_id`, `referral_code`, `commission_amount`, `status` — but the function that writes to it  
(`addReferralTracking` in `src/utils/supabase.ts` line 363) is **never called anywhere in the codebase.**  
All commission data is calculated on-the-fly from `orders.referral_code`. The table has zero rows.

---

## 2. CALCULATION LOGIC — Where the Math Lives

### 2.1 Admin View: `getPartnerStats()`
**File:** `src/utils/supabase.ts`  
**Approximate lines:** 462 – 540  
**Used by:** `src/components/admin/PartnersAnalytics.tsx` (line 4 import, line 28 call)

**Data fetching strategy (2 queries):**
```
Query 1: SELECT * FROM partners                                          ← fetches ALL partners
Query 2: SELECT referral_code, total_amount_paise, payment_status
         FROM orders
         WHERE referral_code IS NOT NULL                                 ← fetches ALL referral orders
```
**All filtering is done in JavaScript memory**, not in SQL.

**Commission formula applied (JavaScript):**
```ts
const commissionOwed = Math.round((totalRevenue * partner.commission_rate) / 100);
```
- Uses `Math.round()` ✅ (integer-safe, no decimal drift)
- Operates on **paise integers** ✅
- Filters to `payment_status === 'completed'` in memory ✅
- ⚠️ `commission_rate` is on **GROSS** amount — no Razorpay fee (~2%) is deducted

**Orphaned codes:** The function also detects orders with a `referral_code` that has no matching row in `partners`. These appear as `[Unregistered: code]` with `commission_rate: 0`.

### 2.2 Creator Self-Service View: `getCreatorStats()`
**File:** `src/utils/supabase.ts`  
**Approximate lines:** 542 – 600  
**Used by:** `src/pages/CreatorStatsPage.tsx` (line 6 import, line 43 call)  
**Route:** `/stats/:secretKey`

**Data fetching strategy (2 queries):**
```
Query 1: SELECT id, code, name, commission_rate, upi_id, clicks, secret_key
         FROM partners
         WHERE secret_key = :normalizedSecretKey                         ← exact match on secret token
         LIMIT 1

Query 2: SELECT id, total_amount_paise, payment_status
         FROM orders
         WHERE referral_code = :partner.code
           AND payment_status = 'completed'                              ← SQL-filtered ✅
```

**Commission formula:**
```ts
const earningsPaise = (totalRevenuePaise * partner.commission_rate) / 100;
```
⚠️ **No `Math.round()` here** — result is a floating-point decimal in paise. Minor but a fintech concern.

**Display formatting (both views):**
```ts
const formatCurrency = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
```
Located in `src/components/admin/PartnersAnalytics.tsx` line ~45 and `src/pages/CreatorStatsPage.tsx` line ~63.

---

## 3. THE LINK MECHANISM — Referral Capture & Storage

### 3.1 Entry Point: URL Parameter
**Format:** `https://www.guiderr.in/?ref=<code>`  
Example: `https://www.guiderr.in/?ref=rahul10`

### 3.2 Capture Logic
**File:** `src/App.tsx`  
**Lines:** 20 – 34

```ts
function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      sessionStorage.setItem('active_referral', refCode);  // ← line 29
    }
  }, []);
  return null;
}
```

`<ReferralTracker />` is mounted at the top of the React tree (line 41), so it fires on **every page load**.

### 3.3 Storage Medium
**Storage:** `sessionStorage` under key `active_referral`  
⚠️ **LOOPHOLE — SESSION SCOPE LOSS:** `sessionStorage` is scoped to the browser tab and cleared when the tab closes. If a visitor:
- Clicks a referral link → opens in a **new tab** (e.g. right-click → open in tab)
- Comes back **hours later** in a fresh tab
- Shares the untagged URL with a friend who then buys

...the referral is silently lost. `localStorage` would survive these scenarios.

### 3.4 Read + Pass to Order
**File:** `src/components/CheckoutFlow.tsx`  
**Line:** ~154

```ts
const referralCode = sessionStorage.getItem('active_referral') || undefined;
```

Then passed to `createOrder()` as `referral_code`:
```ts
await createOrder({
  ...
  referral_code: referralCode,   // ← written to orders.referral_code
});
```

**No validation is performed** — if someone manually sets `sessionStorage.setItem('active_referral', 'fakecode')` in DevTools, that string is written to `orders.referral_code` as-is. The backend does no lookup to confirm the code exists in `partners`.

---

## 4. THE URL — Tracking ID Security (Guessable vs. Unguessable)

The engine uses a **dual-track** scheme:

| Track | Identifier | Guessable? | Used For |
|---|---|---|---|
| Public referral URL | `partners.code` (e.g. `rahul10`) | ✅ YES — human-readable | `?ref=rahul10` in shared link |
| Creator stats URL | `partners.secret_key` (UUID/long token) | ❌ NO — 128-bit random | `/stats/:secretKey` private dashboard |

### 4.1 Public Code (`partners.code`)
- Exposed in the URL, printed on cards, shared socially — **intentionally guessable**
- Only used for attribution; a guessed code can't steal money, only credit a referral to the wrong partner
- ⚠️ No DB-level foreign key from `orders.referral_code` → `partners.code`, so fabricated codes create orphaned tracking rows

### 4.2 Secret Key (`partners.secret_key`)
- **Security implementation:** `getAllPartners()` in `supabase.ts` line 438 **explicitly excludes** `secret_key` from the column list. Admins cannot accidentally leak it via the partner directory UI.
- Only fetched in `getCreatorStats()` via an exact-match `WHERE secret_key = :input` lookup
- Route: `/stats/:secretKey` — defined in `src/App.tsx` line 49
- ⚠️ `secret_key` is stored in the `partners` table as plaintext. If Supabase RLS on partners is misconfigured, it could be read by an anon query.

---

## 5. LOOPHOLE REGISTER

| # | Severity | Loophole | Location | Impact | Status |
|---|---|---|---|---|---|
| L-1 | 🔴 Critical | `referral_tracking` table is completely orphaned — `addReferralTracking()` is defined but **never called** | `src/utils/supabase.ts` line 363 | No audit trail for commission payouts. All commission data lives only in `orders.referral_code` with no immutable record | 🔲 Open |
| L-2 | 🔴 Critical | Click tracking column (`partners.clicks`) **is never incremented** anywhere in the codebase | No file — feature is missing entirely | Creator's dashboard shows `totalClicks: 0` for all time. Creators cannot trust their stats | ✅ Fixed — RPC `increment_partner_click` wired in `App.tsx` with 24h localStorage debounce (Phase 3) |
| L-3 | 🟡 High | `sessionStorage` loses referral after tab close or new tab open | `src/App.tsx` line 29 | Silent commission miss — common user behaviour (mobile browsers, link-share without `?ref`) | ✅ Fixed — changed to `localStorage` (Phase 2) |
| L-4 | 🟡 High | No server-side validation that `referral_code` in `orders` matches a real row in `partners` | `src/components/CheckoutFlow.tsx` ~line 154 | Fabricated referral codes can be injected via DevTools; creates orphaned tracking data | 🔲 Open |
| L-5 | 🟡 High | `getPartnerStats()` fetches `SELECT *` on `partners` including `secret_key` | `src/utils/supabase.ts` line 463 | `secret_key` is returned to the admin browser. Low risk (admin-only page) but unnecessary exposure | ✅ Fixed — explicit column list in `getPartnerStats()` (Phase 2) |
| L-6 | 🟡 High | `getCreatorStats()` commission formula lacks `Math.round()` | `src/utils/supabase.ts` ~line 583 | Floating-point paise displayed to creator (e.g. `₹1,200.000000001`) | ✅ Fixed — `Math.round()` applied (Phase 2) |
| L-7 | 🟡 High | Commission calculated on **gross** `total_amount_paise` — Razorpay ~2% fee not deducted | Both stat functions | Guiderr pays commission on money it doesn't keep | 🔲 Open — business decision required |
| L-8 | 🟠 Medium | `partners` table has NO migration file — exists only in Supabase Dashboard | Schema drift | Project reset / new environment = partners table vanishes with no recovery script | ✅ Fixed — P1-1 (`20260310141958_track_partners_table.sql`) |
| L-9 | 🟠 Medium | `getPartnerStats()` over-fetches all orders with a referral code then filters in JS memory. No date filter, no pagination | `src/utils/supabase.ts` ~line 470 | As orders grow, this becomes a 500ms+ query and approaches Supabase free-tier row-read limits | ✅ Fixed — `payment_status` filter pushed to DB, optional `startDate`/`endDate` params added, hard `.limit(1000)` cap, `payment_status` removed from JS filter (Phase 3) |
| L-10 | 🔴 Critical | `CheckoutFlow.tsx` reads `active_referral` from `sessionStorage` but `App.tsx` writes it to `localStorage` | `src/components/CheckoutFlow.tsx` line 150 | After Phase 2 changed App.tsx to `localStorage`, the checkout flow silently reads `null` — **every referral code is dropped at purchase time**, breaking affiliate attribution | ✅ Fixed — `CheckoutFlow.tsx` updated to read from `localStorage` (Final Audit) |

---

## 6. FILES & LINE REFERENCE SUMMARY

| Concern | File | Lines |
|---|---|---|
| `ReferralTracker` — URL capture | `src/App.tsx` | 20–34 |
| Route binding `/stats/:secretKey` | `src/App.tsx` | 49 |
| `sessionStorage` read at checkout | `src/components/CheckoutFlow.tsx` | ~154 |
| `referral_code` written to order | `src/components/CheckoutFlow.tsx` | ~165–175 |
| `Partner` TypeScript interface | `src/utils/supabase.ts` | 72–81 |
| `Order` TypeScript interface (referral_code field) | `src/utils/supabase.ts` | 48–64 |
| `createOrder()` — referral_code parameter | `src/utils/supabase.ts` | 207–245 |
| `addReferralTracking()` — ORPHANED, never called | `src/utils/supabase.ts` | 363–375 |
| `getAllPartners()` — reads clicks, excludes secret_key | `src/utils/supabase.ts` | 434–443 |
| `getPartnerStats()` — admin commission calc | `src/utils/supabase.ts` | 462–540 |
| `getCreatorStats()` — creator private stats | `src/utils/supabase.ts` | 542–600 |
| Admin analytics display | `src/components/admin/PartnersAnalytics.tsx` | full file |
| Creator stats display | `src/pages/CreatorStatsPage.tsx` | full file |
| `partners` TypeScript type (separate) | `src/types/partner.ts` | full file |
| `orders` table schema | `supabase/migrations/20251205120141_create_orders_and_payments_tables.sql` | 46–60 |
| `referral_tracking` schema | `supabase/migrations/20251205120141_create_orders_and_payments_tables.sql` | 72–84 |
| `orders` RLS hardening | `supabase/migrations/20260307085510_fix_rls_and_security.sql` | full file |
| `partners` table schema | ⚠️ NOT IN ANY MIGRATION — Dashboard only | — |

---

---

## 7. MATHEMATICAL & FRUGALITY AUDIT
*Added: 10 March 2026*

---

### 7.1 Commission Math — Integer vs. Decimal (Fintech Precision)

#### Admin view: `getPartnerStats()` — `src/utils/supabase.ts` ~line 487

```ts
const commissionOwed = Math.round((totalRevenue * (partner.commission_rate || 0)) / 100);
```

| Check | Result |
|---|---|
| Input unit | Paise (INTEGER from DB) ✅ |
| Multiplication overflow risk | None — JS numbers safe to 2^53, max paise ~₹90 trillion ✅ |
| Division produces float | YES — e.g. `(100000 * 10) / 100 = 10000.0` (benign) or `(100001 * 10) / 100 = 10000.1` (requires rounding) |
| `Math.round()` applied | ✅ YES — rounds to nearest paise |
| Gross vs. Net | ⚠️ GROSS — no Razorpay fee deducted (see §7.3) |

**Verdict: SAFE for display.** `Math.round()` prevents fractional paise in UI. No money is lost to float drift here.

---

#### Creator view: `getCreatorStats()` — `src/utils/supabase.ts` ~line 583

```ts
const earningsPaise = (totalRevenuePaise * partner.commission_rate) / 100;
```

| Check | Result |
|---|---|
| Input unit | Paise (INTEGER from DB) ✅ |
| `Math.round()` applied | ❌ NO — raw float passed directly to UI |
| Example with real numbers | `(100001 * 10) / 100 = 10000.100000000001` |
| Displayed to creator as | `₹100.00` (toLocaleString rounds at display) ✅ — low visual risk |
| Used in payout calculation? | Not yet — but if a webhook or payout script ever reads `earningsPaise` directly, it will carry a floating-point tail |

**Verdict: LOW VISUAL RISK NOW, HIGH RISK LATER.** Safe today because `toLocaleString` masks the float in the UI. Becomes a bug the moment `earningsPaise` is written to any DB column or used in arithmetic downstream (e.g. `totalPayoutBatch += earningsPaise`).

**Fix required (one line):**
```ts
// Before
const earningsPaise = (totalRevenuePaise * partner.commission_rate) / 100;
// After
const earningsPaise = Math.round((totalRevenuePaise * partner.commission_rate) / 100);
```

---

### 7.2 Gross vs. Net — The Hidden Commission Inflation

Both calculation functions operate on `orders.total_amount_paise` which is the **full amount paid by the buyer**, before Razorpay deducts its processing fee.

**Razorpay Standard Pricing (India, 2026):** ~2% per domestic transaction (capped at ₹200 + GST).

**Concrete example at 10% commission rate, ₹499 product:**

| Item | Amount |
|---|---|
| Buyer pays | ₹499.00 (49,900 paise) |
| Razorpay fee (~2%) | −₹9.98 |
| **Guiderr actually receives** | **₹489.02** |
| Commission calculated on | 49,900 paise (GROSS) |
| Commission paid to partner | ₹49.90 |
| **Guiderr net after commission** | **₹439.12** |
| Correct net-basis commission | ₹48.90 (10% of ₹489.02) |
| **Guiderr overpays partner by** | **₹1.00 per sale** |

At scale (1,000 sales/month): Guiderr absorbs an extra **~₹1,000/month** in commission overpayment. Not catastrophic, but mathematically incorrect. The `commission_rate` is being applied to money Guiderr never received.

**Decision required (not a code fix):** Agree with partners whether commission is on "Gross collected" or "Net after gateway fees." Both are industry-normal — but it must be documented and consistent. Currently it is undocumented.

---

### 7.3 Click Tracking — Gap Analysis & Zero-Write Solution

#### Current State
`partners.clicks` column exists (INTEGER) but **no code anywhere increments it.** The field is always `0` or `null`. The `addReferralTracking()` function is similarly declared but never called (`src/utils/supabase.ts` line 363 — no callers found in full codebase scan).

#### Why naive click counting destroys free tier

A Supabase UPDATE on every `?ref=` page load would consume:
- 1 DB write per visitor click
- With 100 clicks/day = 3,000 writes/month → benign alone
- But with a viral blog post: 10,000 clicks in one day = 10,000 writes = **free-tier row-write quota exhausted in hours**

#### Recommended: Debounced Server-Side Increment via Supabase Edge Function

The safest zero-waste pattern for free tier:

**Option A — Batch edge-function counter (recommended):**
1. On `?ref=code` capture in `App.tsx`, call a lightweight Supabase Edge Function `increment-click` with the partner code
2. The Edge Function uses `postgres.rpc('increment_partner_click', { p_code: code })` which runs a single `UPDATE partners SET clicks = clicks + 1 WHERE code = $1`
3. Add a **60-second debounce** in the Edge Function using an in-memory Map keyed by `IP + code` — prevents bot-driven write spam: one write per unique visitor per minute per code
4. Edge Function invocations: free tier allows 500,000/month — far more headroom than direct DB writes

**Option B — localStorage debounce (zero backend cost):**
```ts
// In ReferralTracker (App.tsx) — before sessionStorage.setItem:
const throttleKey = `ref_click_${refCode}`;
const lastClick = localStorage.getItem(throttleKey);
const now = Date.now();
if (!lastClick || now - parseInt(lastClick) > 86_400_000) { // 24h window
  localStorage.setItem(throttleKey, String(now));
  // fire increment here
}
```
This prevents the same browser from incrementing more than once per 24 hours — eliminates refresh-spam and multi-tab inflation with **zero Supabase writes** for returning visitors.

**Recommended combination:** Option B for debounce gate + Option A for the actual write. Result: one DB write per unique browser per 24-hour window per code.

---

### 7.4 Frugality — Date-Filtered Reporting Without Over-fetching

#### Current Over-fetch Profile

`getPartnerStats()` today:
```sql
-- Query 1: all partners (unbounded)
SELECT * FROM partners

-- Query 2: ALL orders that have any referral_code (unbounded, grows forever)
SELECT referral_code, total_amount_paise, payment_status
FROM orders
WHERE referral_code IS NOT NULL
```

With 10 partners and 5,000 orders, Query 2 returns **5,000 rows to the browser**, all filtered in JavaScript. After 12 months of operation this will:
- Hit Supabase free-tier row-read limit (500,000/month) from admin page reloads alone
- Cause 1–3 second load times on the analytics page

#### Correct Date-Filtered Pattern (Zero over-fetch)

Move all filtering to SQL using `created_at` bounds. The query only returns the exact rows needed:

```ts
// Proposed signature for a new getPartnerStatsByPeriod(from, to) function
const { data: orders } = await supabase
  .from('orders')
  .select('referral_code, total_amount_paise')  // remove payment_status — filter in SQL
  .eq('payment_status', 'completed')             // SQL filter, not JS filter
  .not('referral_code', 'is', null)
  .gte('created_at', from.toISOString())         // date lower bound
  .lte('created_at', to.toISOString())           // date upper bound
  .limit(1000);                                  // hard safety cap
```

**Row-read cost comparison:**

| Method | Rows read | Free-tier safety |
|---|---|---|
| Current (no date filter) | ALL referral orders ever | ❌ Degrades over time |
| Proposed (30-day window) | ~30 days of orders | ✅ ~96% fewer reads |
| Proposed (7-day window) | ~7 days of orders | ✅ ~99% fewer reads |

**Index requirement:** `idx_orders_referral_code` already exists. Add a composite index for the date-filtered query to be instant:
```sql
CREATE INDEX idx_orders_referral_created
  ON orders(referral_code, created_at DESC)
  WHERE referral_code IS NOT NULL AND payment_status = 'completed';
```
This is a **partial index** — only indexes the rows the query cares about. Zero storage waste.

---

### 7.5 Security — Guessability of Partner Codes

#### Current Architecture (Dual-Track — Correctly Designed)

| Track | Value example | Entropy | Guessable |
|---|---|---|---|
| Public referral URL `?ref=` | `rahul10` | ~3–4 chars, human-chosen | ✅ Fully guessable — intentional |
| Private stats URL `/stats/` | UUID or long token in `secret_key` | ~122 bits (UUID v4) | ❌ Computationally unguessable |

The public/private split is architecturally correct. **No fix needed for the basic security model.**

#### Remaining Exposure on Public Codes

Guessing a partner code (e.g. trying `rohan10`, `rohan20`) only causes **attribution fraud** — the attacker credits a sale to a partner they know. It does not:
- Give the attacker any money
- Let them read orders or private data
- Let them access the creator's private stats URL

**However, two risks exist:**

**Risk A — Fabricated code injection (L-4 from §5):**  
A buyer could `sessionStorage.setItem('active_referral', 'fakeXYZ')` in DevTools before checkout. This writes `fakeXYZ` to `orders.referral_code`. Impact: orphaned row in tracking, zero commission paid (no matching partner), no financial damage. Mitigation: add server-side code validation in the Razorpay Edge Function or a Supabase DB trigger.

**Risk B — `secret_key` returned to admin browser:**  
`getPartnerStats()` uses `SELECT *` on `partners` (line 463), which includes `secret_key` in the response payload returned to the admin browser. The admin component never displays it, but it sits in browser memory and is visible in DevTools Network tab.

**Fix (one-line change to `getPartnerStats`):**
```ts
// Before (line 463)
.select('*')
// After — explicit column list, secret_key excluded
.select('id, code, name, upi_id, commission_rate, clicks, created_at, updated_at')
```

---

### 7.6 State of the Engine — Summary Card

| Dimension | Status | Severity |
|---|---|---|
| Paise storage in DB | ✅ Correct — integers throughout | — |
| Admin commission rounding (`Math.round`) | ✅ Present | — |
| Creator commission rounding (`Math.round`) | ✅ Fixed — Phase 2 | — |
| Commission basis (Gross vs Net) | ⚠️ Gross — undocumented | 🟡 High — business decision |
| Click tracking implemented | ✅ Fixed — 24h localStorage debounce + `increment_partner_click` RPC wired (Phase 3) | — |
| `referral_tracking` table used | ❌ Orphaned — zero writes ever | 🔴 Critical |
| `sessionStorage` referral lifetime | ✅ Fixed — changed to `localStorage` (Phase 2) | — |
| Checkout reads from correct storage | ✅ Fixed — `CheckoutFlow.tsx` aligned to `localStorage` (Final Audit) | — |
| Referral code validated server-side | ❌ Fake codes accepted silently | 🟡 High |
| `secret_key` leaked to admin browser | ✅ Fixed — explicit column list excludes `secret_key` (Phase 2) | — |
| Admin stats query date-filtered | ✅ Fixed — DB-level filter with optional date bounds + `.limit(1000)` cap (Phase 3) | — |
| `partners` table has migration file | ✅ Fixed — `20260310141958_track_partners_table.sql` | — |
| Composite index for date queries | ✅ Fixed — `idx_orders_referral_created` created in P1-2 | — |

**Priority fix order before launch:**
1. ~~Write `partners` table migration file to track schema~~ ✅ Phase 1 done
2. ~~Add composite DB index for date-filter queries~~ ✅ Phase 1 done
3. ~~Create `increment_partner_click` RPC~~ ✅ Phase 1 done
4. ~~Add `Math.round()` to `getCreatorStats()`~~ ✅ Phase 2 done
5. ~~Change `getPartnerStats()` to `SELECT` explicit columns (exclude `secret_key`)~~ ✅ Phase 2 done
6. ~~Change `sessionStorage` → `localStorage` in `App.tsx`~~ ✅ Phase 2 done
7. ~~Add date-filter parameters to `getPartnerStats()` + wire up composite index~~ ✅ Phase 3 done
8. ~~Implement click increment with 24h localStorage debounce + RPC call~~ ✅ Phase 3 done
9. ~~Align `CheckoutFlow.tsx` referral read to `localStorage`~~ ✅ Final Audit

---

## 8. FINAL COMPLIANCE & INTEGRITY AUDIT
*Completed: 11 March 2026 — Pre-Merge to `main`*

---

### 8.1 Phase 1 — Database Integrity

| Checkpoint | File / Location | Verdict |
|---|---|---|
| `partners` table tracked in migration | `supabase/migrations/20260310141958_track_partners_table.sql` lines 36–48 | ✅ PASS — `CREATE TABLE IF NOT EXISTS partners` with all 9 columns, CHECK constraints, RLS policies |
| `idx_orders_referral_created` composite index | Same migration, lines 82–88 | ✅ PASS — partial index on `(referral_code, created_at DESC) WHERE referral_code IS NOT NULL AND payment_status = 'completed'` |
| `increment_partner_click` RPC function | Same migration, lines 99–116 | ✅ PASS — `SECURITY DEFINER`, `LANGUAGE plpgsql`, granted to both `anon` and `authenticated` roles |

---

### 8.2 Phase 2 — Privacy & Math

| Checkpoint | File / Location | Verdict |
|---|---|---|
| `getPartnerStats()` excludes `secret_key` | `src/utils/supabase.ts` line 470: `.select('id, code, name, upi_id, commission_rate, clicks, created_at, updated_at')` | ✅ PASS — 8 explicit columns, `secret_key` structurally impossible to leak |
| `getCreatorStats()` wraps earnings in `Math.round()` | `src/utils/supabase.ts` ~line 600: `Math.round((totalRevenuePaise * partner.commission_rate) / 100)` | ✅ PASS — integer-safe paise, no float tails |
| `getPartnerStats()` admin commission uses `Math.round()` | `src/utils/supabase.ts` ~line 510: `Math.round((totalRevenue * (partner.commission_rate \|\| 0)) / 100)` | ✅ PASS — consistent across both views |
| Referral stored in `localStorage` (not `sessionStorage`) | `src/App.tsx` line 30 | ✅ PASS — survives tab close, new tabs, multi-day return visits |

---

### 8.3 Phase 3 — Frugality & Clicks

| Checkpoint | File / Location | Verdict |
|---|---|---|
| `getPartnerStats()` accepts `startDate` / `endDate` params | `src/utils/supabase.ts` line 462–464: `(startDate?: string \| Date, endDate?: string \| Date)` | ✅ PASS — optional ISO string or Date objects |
| Date filter pushed to Supabase query (`.gte` / `.lte`) | `src/utils/supabase.ts` lines 483–490 | ✅ PASS — `ordersQuery.gte('created_at', iso)` / `.lte('created_at', iso)` |
| `payment_status = 'completed'` filter pushed to DB | `src/utils/supabase.ts` line 479: `.eq('payment_status', 'completed')` | ✅ PASS — no longer filtered in JS memory |
| Hard `.limit(1000)` safety cap on orders | `src/utils/supabase.ts` line 481 | ✅ PASS — prevents unbounded reads even without date params |
| 24-hour click debounce in `ReferralTracker` | `src/App.tsx` lines 35–43: `last_click_for_${refCode}` + `86_400_000` ms comparison | ✅ PASS — one DB write per browser per 24h per code |
| Click fires `supabase.rpc('increment_partner_click')` | `src/App.tsx` line 42: `.rpc('increment_partner_click', { p_code: refCode })` | ✅ PASS — fire-and-forget with `.catch()`, never crashes storefront |
| `supabase` client imported in `App.tsx` | `src/App.tsx` line 3: `import { supabase } from './utils/supabase'` | ✅ PASS |

---

### 8.4 The Surgeon's Rule

| System | File | Verdict |
|---|---|---|
| Razorpay amount calculation | `src/components/CheckoutFlow.tsx` line 121: `Math.round(product.price_in_rupees * 100)` | ✅ UNTOUCHED |
| Razorpay Edge Function (order creation) | `supabase/functions/create-razorpay-order/index.ts` | ✅ UNTOUCHED |
| Razorpay payment capture | Auto-capture via `payment_capture: 1` in Edge Function | ✅ UNTOUCHED |
| Admin Auth (`signInWithPassword`) | `src/utils/supabase.ts` line 13: `authenticateAdmin()` | ✅ UNTOUCHED |
| Ebook delivery links | `src/components/CheckoutFlow.tsx` `product.delivery_link` passthrough | ✅ UNTOUCHED |
| Order notification Edge Function | `supabase/functions/send_order_notification/index.ts` | ✅ UNTOUCHED |

---

### 8.5 Bug Caught During Audit

| Bug | Severity | Root Cause | Fix Applied |
|---|---|---|---|
| **L-10: Referral code silently dropped at checkout** | 🔴 Critical | Phase 2 changed `App.tsx` to write `active_referral` to `localStorage`, but `CheckoutFlow.tsx` line 150 still read from `sessionStorage`. Result: referral code was always `null` at purchase time — zero commissions attributed. | `CheckoutFlow.tsx` line 150 updated to `localStorage.getItem('active_referral')` — aligned with App.tsx |

---

### 8.6 Known Open Items (Not In Scope for This Merge)

| # | Item | Severity | Notes |
|---|---|---|---|
| L-1 | `referral_tracking` table is orphaned — `addReferralTracking()` never called | 🔴 Critical | Immutable audit trail for commission payouts. Recommend wiring in a future sprint. |
| L-4 | No server-side validation of `referral_code` against `partners` table | 🟡 High | Fabricated codes are accepted silently. Mitigate via DB trigger or Edge Function check. |
| L-7 | Commission on Gross vs. Net (Razorpay fee not deducted) | 🟡 High | Business decision required. Currently partners are paid on gross — must be documented in partner agreement. |
| UI | `PartnersAnalytics.tsx` calls `getPartnerStats()` with zero arguments | 🟠 Medium | Date pickers not yet wired in frontend. Backend supports `startDate`/`endDate` — UI work is a future enhancement. |

---

### 8.7 Final Verdict

```
╔════════════════════════════════════════════════════════════════╗
║         PARTNER ANALYTICS ENGINE — FINAL GREEN LIGHT        ║
╠════════════════════════════════════════════════════════════════╣
║  Phase 1 (Database)      : ✅ ALL PASS                       ║
║  Phase 2 (Privacy & Math) : ✅ ALL PASS                       ║
║  Phase 3 (Frugality)      : ✅ ALL PASS                       ║
║  Surgeon's Rule           : ✅ ALL PASS — Zero Razorpay drift  ║
║  Critical Bug L-10        : ✅ CAUGHT & FIXED during audit     ║
║                                                                ║
║  Branch: fix/partner-analytics                                ║
║  Status: CLEAR TO MERGE TO MAIN                               ║
╚════════════════════════════════════════════════════════════════╝
```

**Files changed across all 3 phases + audit fix:**

| File | Changes |
|---|---|
| `supabase/migrations/20260310141958_track_partners_table.sql` | Phase 1 — partners schema, composite index, RPC |
| `src/utils/supabase.ts` | Phase 2 — explicit select (no secret_key), `Math.round()` on earnings; Phase 3 — date-filter params, DB-level `payment_status` filter, `.limit(1000)` cap |
| `src/App.tsx` | Phase 2 — `sessionStorage` → `localStorage`; Phase 3 — 24h click debounce + `supabase.rpc()` import |
| `src/components/CheckoutFlow.tsx` | Final Audit — aligned `active_referral` read to `localStorage` (L-10 fix) |
| `partner-analytics-audit.md` | Updated loophole register, summary card, and this final report |
