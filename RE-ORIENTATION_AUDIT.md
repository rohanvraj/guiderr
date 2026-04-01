# RE-ORIENTATION AUDIT — Guiderr "State of the Engine"
**Date:** 1 April 2026  
**Auditor Role:** Senior Cloud Architect & Security Auditor  
**Filters Applied:** Lean Fortress (zero-cost free tier) · Feather-Weight (Cloudinary eco)

---

## SECTION 1 — ✅ WORKING / SET

### 1.1 Infrastructure & Security

| Check | File | Verdict |
|---|---|---|
| React Query `staleTime` = 5 min | `src/main.tsx` | ✅ CONFIRMED |
| React Query `gcTime` = 30 min | `src/main.tsx` | ✅ CONFIRMED |
| `refetchOnWindowFocus: false` | `src/main.tsx` | ✅ CONFIRMED |
| CORS restricted to `guiderr.in` | `supabase/functions/create-razorpay-order/index.ts` | ✅ CONFIRMED |
| Rate Limiting: 5 req / 60 sec per IP | `supabase/functions/create-razorpay-order/index.ts` | ✅ CONFIRMED |
| Method-only-POST enforcement | `supabase/functions/create-razorpay-order/index.ts` | ✅ CONFIRMED |
| Input validation (email regex, name 2–100 chars, amount ₹1–₹50K) | `supabase/functions/create-razorpay-order/index.ts` | ✅ CONFIRMED |
| RLS migration chain for `orders` (latest hardened state) | `supabase/migrations/20260307085510_fix_rls_and_security.sql` | ✅ IN FILE (see 2.1 caveat) |
| RLS for `partners` (admin-only, all 4 CRUD ops) | `supabase/migrations/20260310141958_track_partners_table.sql` | ✅ IN FILE (see 2.1 caveat) |
| Security headers (X-Frame-Options, CSP, HSTS-equiv) | `netlify.toml` | ✅ CONFIRMED |
| Netlify CSP allows `unpkg.com`, `media-library.cloudinary.com` | `netlify.toml` | ✅ CONFIRMED |
| Vite asset immutable caching (1 year) | `netlify.toml` | ✅ CONFIRMED |
| SPA catch-all redirect with CMS override | `netlify.toml` | ✅ CONFIRMED |

### 1.2 Media & Frugality (Feather-Weight)

| Check | File | Verdict |
|---|---|---|
| `q_auto:eco` is the default quality in `optimizeCloudinaryUrl` | `src/utils/cloudinary.ts` | ✅ CONFIRMED |
| `f_auto` injected globally (serves WebP/AVIF by browser support) | `src/utils/cloudinary.ts` | ✅ CONFIRMED |
| Guards against `[object Object]` and null inputs | `src/utils/cloudinary.ts` | ✅ CONFIRMED |
| Non-Cloudinary URLs passed through unchanged (CDN-safe) | `src/utils/cloudinary.ts` | ✅ CONFIRMED |
| `Hero.tsx` uses `optimizeCloudinaryUrl` + `loading="lazy"` | `src/components/Hero.tsx` L305–307 | ✅ CONFIRMED |
| `Products.tsx` uses `optimizeCloudinaryUrl` + `loading="lazy"` | `src/components/Products.tsx` L72–74 | ✅ CONFIRMED |
| `BlogPostPage.tsx` uses `optimizeCloudinaryUrl` for featured image | `src/pages/BlogPostPage.tsx` L54 | ✅ CONFIRMED |
| `BlogPostPage.tsx` inline markdown images use `optimizeBlogImage` + `loading="lazy"` | `src/pages/BlogPostPage.tsx` L65–70 | ✅ CONFIRMED |
| CMS `config.yml` forces `fetch_format: auto, quality: "auto:eco"` on uploads | `public/cms/config.yml` | ✅ CONFIRMED |

### 1.3 Blog & CMS

| Check | File | Verdict |
|---|---|---|
| Blog is a **static markdown engine** — zero DB calls for readers | `src/utils/blog.ts` | ✅ CONFIRMED |
| `import.meta.glob` with `eager: true` bundles all `.md` at build time | `src/utils/blog.ts` L35–40 | ✅ CONFIRMED |
| Blog images route through `optimizeBlogImage()` → `q_auto:eco` | `src/utils/blog.ts` L63–66 | ✅ CONFIRMED |
| Blog posts stored in `src/content/blog/` (Git-tracked, zero hosting cost) | `public/cms/config.yml` L35 | ✅ CONFIRMED |

### 1.4 Revenue & Partner Engine

| Check | File | Verdict |
|---|---|---|
| `getPartnerStats()` commission uses `Math.round()` | `src/utils/supabase.ts` L508 | ✅ CONFIRMED |
| `getCreatorStats()` earnings use `Math.round()` | `src/utils/supabase.ts` L601 | ✅ CONFIRMED |
| `CheckoutFlow.tsx` paise conversion uses `Math.round()` | `src/components/CheckoutFlow.tsx` L121 | ✅ CONFIRMED |
| `App.tsx` / `ReferralTracker` writes to `localStorage` (`active_referral`) | `src/App.tsx` L31 | ✅ CONFIRMED |
| `CheckoutFlow.tsx` reads `localStorage` (`active_referral`) — key is consistent | `src/components/CheckoutFlow.tsx` L154 | ✅ CONFIRMED |
| 24-hour debounce: `86_400_000 ms` check via `last_click_for_${refCode}` | `src/App.tsx` L36–41 | ✅ CONFIRMED |
| `increment_partner_click` RPC: `SECURITY DEFINER` + `GRANT EXECUTE TO anon` | `supabase/migrations/20260310141958_track_partners_table.sql` L103–115 | ✅ CONFIRMED |
| `getPartnerStats()` excludes `secret_key` from SELECT (explicit column list) | `src/utils/supabase.ts` L469 | ✅ CONFIRMED |
| `getPartnerStats()` accepts `startDate`/`endDate` for date-scoped queries | `src/utils/supabase.ts` L462–464 | ✅ CONFIRMED |
| `.limit(1000)` hard cap on order reads prevents unbounded free-tier scans | `src/utils/supabase.ts` L481 | ✅ CONFIRMED |
| Composite partial index on `orders (referral_code, created_at DESC)` | `supabase/migrations/20260310141958_track_partners_table.sql` L78–83 | ✅ IN FILE |

---

## SECTION 2 — 🔴 BROKEN / CRASHED

### 2.1 THE ACTIVE CRASH: `/cms` — `TypeError: Cannot read properties of null (reading 'appendChild')`

**Severity:** CRITICAL — CMS is entirely unusable. No blog posts can be published.

**File:** `public/cms/index.html`

**Root Cause — DOM-Readiness Failure (Primary Bug):**

All four `<script>` tags in `public/cms/index.html` are loaded **synchronously in `<head>`** with **no `defer` or `async` attribute**. The browser's parsing behavior is:

1. Parser starts reading `<html>` → `<head>`
2. Encounters `<script src="...">` (no defer/async)
3. Parser **pauses**, fetches the script from CDN, then **executes it immediately**
4. At execution time, the `<body>` tag has NOT been parsed yet
5. Therefore, `document.body === null`
6. `decap-cms.js` initializes and calls `document.body.appendChild(container)` to mount the CMS UI
7. **→ `Uncaught TypeError: Cannot read properties of null (reading 'appendChild')`**

```html
<!-- CURRENT (BROKEN) — scripts are synchronous, body is null at execution time -->
<head>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  <script src="https://unpkg.com/cloudinary-core@^2.13.0/..."></script>
  <script src="https://media-library.cloudinary.com/global/all.js"></script>
  <script src="https://unpkg.com/decap-cms@^3.3.3/dist/decap-cms.js"></script>             <!-- ← crashes here -->
  <script src="https://unpkg.com/netlify-cms-media-library-cloudinary@^1.3.10/..."></script>
</head>
<body>
  <!-- body is empty, no <div id="nc-root"> mount point explicitly declared -->
</body>
```

**The fix is to add `defer` to all script tags.** `defer` guarantees scripts execute **after the full DOM is parsed** but before `DOMContentLoaded`. The existing script order is already correct (Cloudinary → Media Library → Decap CMS → Bridge), so `defer` alone resolves the crash.

**Secondary Risk — Bridge Package Incompatibility:**

`netlify-cms-media-library-cloudinary@^1.3.10` was the Cloudinary integration plugin for **Netlify CMS** (the legacy product). Decap CMS is a fork that has had breaking internal changes in v3.x. The plugin calls `CMS.registerMediaLibrary(cloudinaryMediaLibrary)` — this API still exists in Decap CMS for backwards compatibility, but the internal event system and widget lifecycle have diverged. If the crash persists after adding `defer`, this package is the next suspect.

**There is no `<div id="nc-root">`** in the `<body>`. Decap CMS looks for this element to mount into. While Decap will create it dynamically, explicitly declaring `<div id="nc-root"></div>` is the recommended pattern and eliminates one class of timing issues.

---

### 2.2 RLS SYNC CAVEAT — Live DB State Unverifiable From Code

**Severity:** HIGH — Cannot confirm without running `supabase db status`

The migration files on disk are correct and in the right order. However, **there is no mechanism in this repo to confirm which migrations have actually been applied to the live Supabase project**. The two most critical migrations are:

- `20260307085510_fix_rls_and_security.sql` — Hardens `orders` SELECT (from wide-open anon to token-scoped) and hardens INSERT (from `WITH CHECK (TRUE)` to constrained fields)
- `20260310141958_track_partners_table.sql` — Sets up `partners` RLS and the `increment_partner_click` RPC

**If `20260307` has NOT been applied to the live DB**, the `orders` table still has:
- `orders_insert_anonymous_checkout` with `WITH CHECK (TRUE)` — **bots can spam unlimited orders**
- `orders_select_by_public_token_anonymous` with `USING (auth.role() = 'anon')` — **any anon user can SELECT any order without a token**

**Action Required:** Immediately run `supabase db status` in terminal or check the Supabase Dashboard → SQL Editor and run:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('orders', 'partners') ORDER BY tablename, cmd;
```
Expected live state for `orders`: `orders_select_scoped` (SELECT), `orders_insert_anonymous_checkout_restricted` (INSERT), `orders_update_authenticated` (UPDATE).

---

## SECTION 3 — 🟡 IN-PROGRESS / HANGING

### 3.1 `ExpertProfilePage.tsx` — Built But Unreachable

**File:** `src/pages/ExpertProfilePage.tsx` exists.  
**Status:** No route registered in `src/App.tsx`. The page is compiled into the bundle but accessible at no URL. Hanging feature — either needs a route added or the file should be archived.

### 3.2 Admin Date Picker for Partner Analytics — Backend Ready, UI Missing

**File:** `src/components/admin/PartnersAnalytics.tsx` L29: `await getPartnerStats()` (zero args)  
**Status:** `getPartnerStats()` in `supabase.ts` accepts `startDate`/`endDate` params and uses the composite DB index for date-scoped queries. The backend is complete. The `PartnersAnalytics.tsx` UI does not yet have date picker inputs wired to these params. Documented in `partner-analytics-audit.md` as a future enhancement.

### 3.3 Dedicated `increment-click` Edge Function — Skipped, Direct RPC Used Instead

**Status:** `virality-and-bot-prevention.md` and `partner-analytics-audit.md` reference a planned `increment-click` Supabase Edge Function (a dedicated serverless wrapper for click tracking). This was never created.  
**Current implementation:** `ReferralTracker` in `App.tsx` calls `supabase.rpc('increment_partner_click', ...)` **directly from the browser** — the anon client key is used. This works because the RPC has `SECURITY DEFINER` + `GRANT EXECUTE TO anon`.  
**Risk assessment:** Low. The `SECURITY DEFINER` function only touches the `clicks` column on the matched `partners.code` row. No financial or PII data is exposed. The 24-hour `localStorage` debounce prevents spam.  
**Verdict:** Not a crash, not a security hole, but the missing Edge Function means the rate limiting on click increments relies solely on the client-side debounce (bypassable by a motivated bot). The dedicated Edge Function would add server-side debounce.

### 3.4 Multiple `console.log('[DEBUG] ...')` Statements Left in Production

**File:** `src/utils/supabase.ts` — `getCreatorStats()` function (L560–617) has ~6 verbose `console.log` debug statements that log partner secret keys, order amounts, and full query results to the browser console. While not a security breach (the data is already fetched by the authenticated user), it is unnecessary information exposure in production and wastes CPU/network on JSON serialization.

---

## SECTION 4 — FREE TIER HEALTH CHECK

| Service | Usage Pattern | Status |
|---|---|---|
| **Supabase (Free Tier)** | React Query 5-min staleTime prevents repeated API calls. Hero + Products share the `['products']` query key — zero duplicate fetches. Blog = 0 DB reads. `getPartnerStats()` has `.limit(1000)` hard cap + DB-level `payment_status` filter. | ✅ WITHIN FREE TIER |
| **Netlify (Free Tier)** | Static Vite SPA. Build command: `npm run build`. No Netlify Functions used (Edge Functions are Supabase-hosted). Bandwidth risk is low (all images served from Cloudinary CDN, not Netlify). | ✅ WITHIN FREE TIER |
| **Cloudinary (Free Tier: 25 credits/mo)** | `q_auto:eco` + `f_auto` active on all image paths. Width constraints (w_300–w_1200) prevent over-delivery. CMS upload defaults also enforce `auto:eco`. Cannot verify monthly credit consumption from code alone — monitor Cloudinary dashboard. | ⚠️ LIKELY WITHIN FREE TIER (verify dashboard) |

---

## SECTION 5 — PRIORITY ACTION LIST

| Priority | Item | Effort |
|---|---|---|
| 🔴 P0 | **Fix `/cms` crash** — Add `defer` to all `<script>` tags in `public/cms/index.html` | 5 min |
| 🔴 P0 | **Verify RLS migration sync** — Run `SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('orders', 'partners')` in Supabase SQL Editor and confirm hardened policies are live | 5 min |
| 🟡 P1 | Add `<div id="nc-root"></div>` to `<body>` in `public/cms/index.html` (explicit mount point, best practice) | 2 min |
| 🟡 P1 | Remove 6 `console.log('[DEBUG]...')` statements from `getCreatorStats()` in `supabase.ts` | 10 min |
| 🟢 P2 | Register a route for `ExpertProfilePage.tsx` in `App.tsx` or archive the file | 15 min |
| 🟢 P2 | Wire date picker inputs to `getPartnerStats(startDate, endDate)` in `PartnersAnalytics.tsx` | 1–2 hrs |
| 🟢 P3 | Change first 3 Hero carousel images from `loading="lazy"` to `loading="eager"` to improve LCP score | 5 min |
