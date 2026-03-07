# Guiderr — Virality & Bot Prevention Audit

**Audit Date:** March 2026  
**Auditor Scope:** Full codebase scan — Frontend (React/Vite), Backend (Supabase Edge Functions), Database (Supabase Postgres + RLS), Media (Cloudinary), Hosting (Netlify)  
**Objective:** Protect Supabase, Cloudinary, and Netlify free tiers from bot abuse, unnecessary API calls, and traffic spikes before launching the blog + AdSense monetization.

---

## 1. Executive Summary

The Guiderr MVP is functional but **not hardened for virality or free-tier survival**. The codebase contains several critical vulnerabilities that would cause free-tier quota exhaustion under even moderate traffic spikes:

| Risk Area | Severity | Impact |
|-----------|----------|--------|
| **Double product fetch on homepage** (Hero + Products both call `getAllProducts()`) | 🔴 Critical | 2× Supabase API calls per visitor — doubles your row-read burn rate |
| **N+1 queries in admin OrdersPanel** (loops `getOrderItems()` per order) | 🔴 Critical | 101 API calls per admin page load (with 100 orders) |
| **No caching layer** (no React Query/SWR) | 🔴 Critical | Every component mount = fresh Supabase call. Hot reload in dev compounds this. |
| **Temporary test query on ThankYouPage** (creates 2nd Supabase client, runs `select('*').limit(1)`) | 🟡 High | Wasted API call on every post-payment page view |
| **`select('*')` on 11 queries** — leaks `delivery_link` to anonymous users | 🔴 Critical | Security hole: any visitor can see paid download links via browser DevTools |
| **Cloudinary images served without `f_auto,q_auto`** | 🟡 High | Full-size PNGs/JPGs served — 3–5× bandwidth waste on free tier |
| **Zero `loading="lazy"` on any image** | 🟡 High | All images load eagerly — wastes Cloudinary bandwidth on below-fold content |
| **CORS set to `Access-Control-Allow-Origin: *`** on both Edge Functions | 🟡 High | Any domain can call your Razorpay order-creation endpoint |
| **Hardcoded admin credentials** in SuperadminDashboard (`admin`/`guiderr123`) | 🔴 Critical | Anyone reading your JS bundle can log in as superadmin |
| **Anonymous INSERT on orders table** (`WITH CHECK (TRUE)`) | 🟡 High | Bots can spam thousands of fake orders, exhausting Supabase row limits |
| **Anonymous SELECT on all orders** (RLS allows `auth.role() = 'anon'` to read ANY order) | 🔴 Critical | Entire orders table is scrapeable — intended to restrict to token-based lookup but doesn't |
| **No rate limiting** on Edge Functions or any endpoint | 🔴 Critical | Bot can call `create-razorpay-order` thousands of times per minute |
| **No Netlify `netlify.toml`** config file | 🟡 High | Missing security headers, caching rules, redirect optimization |
| **50+ `console.log` statements** leaking order tokens, payment IDs, download links, secret keys | 🟡 High | Any user opening DevTools sees sensitive operational data |

**Bottom line:** A single trending blog post or a moderately determined bot could exhaust your Supabase free tier (50,000 monthly API calls, 500MB database) within hours. The fixes below are ordered by impact-per-effort.

---

## 2. Current Loopholes and Danger Areas

### 2.1 Supabase Free Tier Risks

#### 2.1.1 Double-Fetch on Homepage
**Files:** `src/components/Hero.tsx` (line 44), `src/components/Products.tsx` (line 147)

Both components independently call `getAllProducts()` when the homepage mounts. This means **every homepage visit = 2 Supabase API calls** fetching the same data.

```
Homepage Load:
  → Hero.tsx → useEffect → getAllProducts() → Supabase API call #1
  → Products.tsx → useEffect → getAllProducts() → Supabase API call #2
```

**Free-tier impact:** With 1,000 daily visitors, this wastes 60,000 API calls/month on duplicates alone (exceeding the 50K free tier).

#### 2.1.2 N+1 Query Pattern in OrdersPanel
**File:** `src/components/admin/OrdersPanel.tsx` (lines 18–22)

After fetching all orders, the code loops through each order and calls `getOrderItems(order.id)` individually:

```typescript
// Current: 1 query for orders + N queries for items = N+1 total
const ordersData = await getAllOrders();
for (const order of ordersData) {
  const items = await getOrderItems(order.id);  // ← Called per order
}
```

With the default `limit(100)`, this is **101 Supabase API calls per admin page load**.

#### 2.1.3 No Caching Strategy
**Impact:** Every `useEffect` mount triggers a fresh Supabase fetch. There is no:
- React Query / SWR / TanStack Query
- In-memory cache
- `staleTime` / `cacheTime` configuration
- Request deduplication

Components that re-mount (e.g., navigating away and back) repeat all their queries.

#### 2.1.4 Missing `.limit()` on Public Queries
| Function | Table | Limit? |
|----------|-------|--------|
| `getAllProducts()` | products | ❌ None |
| `getProductsByCategory()` | products | ❌ None |
| `getAllPartners()` | partners | ❌ None |
| `getOrderItems()` | order_items | ❌ None |
| `getPartnerStats()` → orders | orders | ❌ None |

As the database grows, these unbounded queries fetch increasingly large payloads, consuming both API calls and egress bandwidth.

#### 2.1.5 `select('*')` Leaking Sensitive Columns
**File:** `src/utils/supabase.ts` — 11 occurrences

The `getAllProducts()` and `getProductsByCategory()` functions use `select('*')`, which returns the `delivery_link` column (the paid ebook download URL) to **every anonymous visitor**. Anyone opening browser DevTools → Network tab can see and copy the Google Drive links.

Additionally, `getAllPartners()` uses `select('*')`, potentially exposing `secret_key` values.

#### 2.1.6 Temporary Debug Code on ThankYouPage
**File:** `src/pages/ThankYouPage.tsx` (lines 33–60)

A block marked `// TEMPORARY` creates a **second Supabase client** and runs `select('*').limit(1)` on the products table on every ThankYou page load. This is pure waste — 1 extra API call per purchase.

#### 2.1.7 RLS Policy Allows Full Orders Table Scraping
**Migration:** `20260120_add_rls_anonymous_select_by_token.sql`

The current RLS policy:
```sql
CREATE POLICY "orders_select_by_public_token_anonymous" ON orders
  FOR SELECT
  USING (auth.role() = 'anon');
```

This allows **any anonymous user to SELECT all rows** from the orders table — not just their own order by token. The intent was token-restricted access, but the policy has no column-level or row-level filter. A scraper could run:
```sql
SELECT * FROM orders;  -- Returns ALL orders to any anonymous visitor
```

#### 2.1.8 Anonymous INSERT With No Restrictions
**Migration:** `20260119_fix_orders_rls_for_anonymous_checkout.sql`

```sql
CREATE POLICY "orders_insert_anonymous_checkout" ON orders
  FOR INSERT WITH CHECK (TRUE);
```

Any anonymous user can insert unlimited rows into the orders table. A bot could flood this with fake orders, exhausting your 500MB database storage.

---

### 2.2 Cloudinary Free Tier Risks

#### 2.2.1 No Image Optimization Transforms
**Files:** `src/components/admin/EbookManager.tsx` (line 93), `src/pages/ExpertProfilePage.tsx` (line 83)

When images are uploaded to Cloudinary, the raw `data.secure_url` is stored directly in the database. This URL serves the original unoptimized image.

**Example stored URL:**
```
https://res.cloudinary.com/dhzxdbo8q/image/upload/v1234567/ebook-cover.png
```

**Should be transformed to:**
```
https://res.cloudinary.com/dhzxdbo8q/image/upload/f_auto,q_auto,w_600/v1234567/ebook-cover.png
```

**Impact:** Without `f_auto` (auto-format: serves WebP to Chrome, AVIF where supported) and `q_auto` (auto-quality compression), images are 3–5× larger than necessary. Cloudinary free tier allows 25GB bandwidth/month — serving unoptimized hero images to viral traffic would exhaust this quickly.

#### 2.2.2 No Lazy Loading
**Confirmed:** Zero `loading="lazy"` attributes exist anywhere in the codebase.

| File | Image Context | Impact |
|------|--------------|--------|
| `Products.tsx` | Product grid (all cards) | All card images load immediately, even below fold |
| `Hero.tsx` | Carousel (duplicated for infinite scroll) | 12 images load at once (6 × 2 duplicated) |
| `CategoryPage.tsx` | Category product grid | All products load eagerly |
| `SuperadminDashboard.tsx` | Admin ebook grid | Loads all product images on mount |

#### 2.2.3 External Placeholder Dependency
5+ files use `https://via.placeholder.com/...` as fallback images. This external service is a reliability risk and adds unnecessary external requests.

---

### 2.3 Netlify & Frontend Risks

#### 2.3.1 No `netlify.toml` Configuration
There is no `netlify.toml` file. This means:
- No custom caching headers for static assets
- No security headers (CSP, X-Frame-Options, etc.)
- No edge-level redirects (only the catch-all `_redirects` file exists)
- No function-level configuration

#### 2.3.2 SPA Architecture = No SSG/ISR for Blog
The entire app is a client-side SPA (Vite + React). Every page load:
1. Downloads the full JS bundle
2. Mounts React
3. Makes client-side API calls to Supabase

For a blog section aiming for SEO and AdSense:
- **Google cannot efficiently crawl** client-rendered content
- **Every blog reader triggers Supabase API calls** instead of reading from CDN cache
- **Viral articles will hammer Supabase** instead of being served as static HTML

#### 2.3.3 No Bundle Optimization
The `vite.config.ts` has no:
- Code splitting strategy
- Chunk naming for caching
- Compression plugins (gzip/brotli)
- Image optimization plugins

---

### 2.4 Security & Bot Prevention Risks

#### 2.4.1 Hardcoded Admin Credentials
**File:** `src/pages/SuperadminDashboard.tsx` (lines 38–39)

```typescript
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'guiderr123';
```

These are baked into the production JS bundle and visible to anyone who opens DevTools → Sources.

#### 2.4.2 Password Stored in LocalStorage
**File:** `src/pages/AdminDashboard.tsx` (line 43)

```typescript
localStorage.setItem('adminToken', adminPassword);
```

The raw plaintext password is stored in localStorage, accessible to any XSS attack or browser extension.

#### 2.4.3 Client-Side-Only Auth Gates
**Files:** `AdminDashboard.tsx`, `PartnersManagement.tsx`, `SuperadminDashboard.tsx`

Admin access is gated by `localStorage.getItem('adminSession') === 'true'`. Any user can bypass this in the browser console:

```javascript
localStorage.setItem('adminSession', 'true');
// → Full admin dashboard access
```

The actual security depends on Supabase RLS, but the UI gate creates a false sense of security and may expose admin-only UI features.

#### 2.4.4 No Rate Limiting
Neither Edge Function (`create-razorpay-order`, `send_order_notification`) has any rate limiting. A bot could:
- Spam order creation (each call also hits the Razorpay API)
- Trigger unlimited email notifications via Resend
- Exhaust Supabase Edge Function invocations (500K/month free tier)

#### 2.4.5 CORS Allows All Origins
**Files:** Both Edge Functions use:
```typescript
'Access-Control-Allow-Origin': '*'
```

This means any website can make API calls to your Edge Functions. Combined with no rate limiting, this is a wide-open attack surface.

#### 2.4.6 No Bot Detection
There is no:
- CAPTCHA on checkout form
- Honeypot fields
- User-Agent filtering
- Suspicious behavior detection

#### 2.4.7 Edge Function URL Hardcoded
**File:** `src/utils/edgeFunction.ts` (line 8)
```typescript
const EDGE_FUNCTION_URL = 'https://luxeufxyluqxrwuejjpx.supabase.co/functions/v1/create-razorpay-order';
```

The full Supabase project URL is exposed in the client bundle (this is somewhat unavoidable for client-side calls, but combined with `CORS: *` and no rate limiting, it's easily abusable).

#### 2.4.8 Verbose Console Logging
50+ `console.log`/`console.error` statements across the codebase leak:
- Supabase connection details
- Order tokens and payment IDs
- Download links (Google Drive URLs)
- Partner secret keys
- Product pricing and delivery data

---

## 3. Step-by-Step Actionable Fixes

### Priority 1: CRITICAL — Fix Before Blog Launch

#### Fix 1.1: Add React Query for Caching & Deduplication

**Install:**
```bash
npm install @tanstack/react-query
```

**Setup in `main.tsx`:**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data fresh for 5 minutes
      gcTime: 30 * 60 * 1000,       // Cache retained for 30 minutes
      refetchOnWindowFocus: false,   // Don't refetch on tab switch
      retry: 1,                      // Only 1 retry on failure
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

**Replace direct Supabase calls in components. Example for `Products.tsx`:**
```tsx
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../utils/supabase';

function Products() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    staleTime: 10 * 60 * 1000, // Products don't change often
  });
  // ... rest of component
}
```

**Hero.tsx uses the same query key** — React Query automatically deduplicates:
```tsx
const { data: products = [] } = useQuery({
  queryKey: ['products'],
  queryFn: getAllProducts,
});
const featuredEbooks = products.slice(0, 6);
```

**Result:** Homepage goes from 2 API calls → 1 (deduplicated). Subsequent visits within 5 minutes → 0 calls (served from cache).

---

#### Fix 1.2: Restrict `select()` Columns — Stop Leaking `delivery_link`

**In `src/utils/supabase.ts`, replace all public-facing `select('*')` calls:**

```typescript
// BEFORE (leaks delivery_link to anonymous users):
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_type', 'ebook')
    .order('created_at', { ascending: false });
  // ...
}

// AFTER (only columns needed for storefront display):
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_in_rupees, cover_image_url, category, author, product_type')
    .eq('product_type', 'ebook')
    .order('created_at', { ascending: false })
    .limit(50);
  // ...
}
```

Apply the same pattern to:
- `getProductsByCategory()` — add `.limit(50)` and restrict columns
- `getProductByName()` — this one needs `delivery_link` for checkout, so restrict it to authenticated-only context or fetch `delivery_link` only during the checkout flow via the edge function
- `getAllPartners()` — exclude `secret_key` column

---

#### Fix 1.3: Fix the RLS Policy — Restrict Anonymous SELECT to Token-Based Lookup

**Run this migration in Supabase SQL Editor:**

```sql
-- Drop the overly permissive anonymous SELECT policy
DROP POLICY IF EXISTS "orders_select_by_public_token_anonymous" ON orders;

-- Create a properly restricted policy:
-- Anonymous users can ONLY see orders where they provide the correct public_token
-- This is enforced at the database level — no amount of client manipulation can bypass it
CREATE POLICY "orders_select_by_public_token_only" ON orders
  FOR SELECT
  USING (
    -- Authenticated users (admins) can see all orders
    auth.role() = 'authenticated'
    OR
    -- Anonymous users can ONLY see their own order via public_token
    -- The token must be passed as a filter in the query WHERE clause
    -- Supabase evaluates RLS USING clause per-row, so this effectively
    -- requires: SELECT ... WHERE public_token = 'exact-uuid'
    (auth.role() = 'anon' AND public_token IS NOT NULL)
  );
```

> **Important:** The above still allows anonymous users to scan if they guess tokens. For stronger protection, use a Supabase RPC function:

```sql
-- Even better: Create a server-side function that returns only specific columns
CREATE OR REPLACE FUNCTION get_order_by_token(p_token UUID)
RETURNS TABLE (
  buyer_name TEXT,
  notes TEXT,
  total_amount_paise BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with full privileges, bypasses RLS
AS $$
BEGIN
  RETURN QUERY
    SELECT o.buyer_name, o.notes, o.total_amount_paise, o.created_at
    FROM orders o
    WHERE o.public_token = p_token
    LIMIT 1;
END;
$$;
```

Then call from the frontend:
```typescript
const { data } = await supabase.rpc('get_order_by_token', { p_token: publicToken });
```

---

#### Fix 1.4: Rate-Limit the Edge Functions

**Add rate limiting to `create-razorpay-order/index.ts`:**

```typescript
// Simple in-memory rate limiter (resets on cold start, which is fine for Edge Functions)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(clientIp: string, maxRequests = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }
  return false;
}

// Inside Deno.serve handler, add at the top (after CORS preflight):
const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  || req.headers.get('cf-connecting-ip')
  || 'unknown';

if (isRateLimited(clientIp)) {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
    headers: corsHeaders,
    status: 429,
  });
}
```

---

#### Fix 1.5: Restrict CORS to Your Domain

**In both Edge Functions, replace:**
```typescript
// BEFORE:
'Access-Control-Allow-Origin': '*',

// AFTER:
'Access-Control-Allow-Origin': 'https://guiderr.com',
// Or if you also use a www subdomain:
// 'Access-Control-Allow-Origin': req.headers.get('origin') === 'https://guiderr.com' ? 'https://guiderr.com' : '',
```

**For multiple allowed origins (production + preview):**
```typescript
const ALLOWED_ORIGINS = [
  'https://guiderr.com',
  'https://www.guiderr.com',
  // Add Netlify preview URL if needed during development:
  // 'https://guiderr.netlify.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}
```

---

#### Fix 1.6: Remove Hardcoded Credentials & Fix Admin Auth

**In `SuperadminDashboard.tsx`, remove:**
```typescript
// DELETE THESE LINES:
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'guiderr123';
```

**Replace with Supabase Auth (already partially implemented in `AdminDashboard.tsx`):**
```typescript
import { authenticateAdmin, getCurrentUser } from '../utils/supabase';

// Use Supabase Auth for superadmin too:
const handleLogin = async () => {
  const result = await authenticateAdmin(email, password);
  if (result.success) {
    setIsAuthenticated(true);
  } else {
    setError('Invalid credentials');
  }
};
```

**In `AdminDashboard.tsx`, stop storing password in localStorage:**
```typescript
// DELETE:
localStorage.setItem('adminToken', adminPassword);

// Supabase Auth already manages the session — use:
const user = await getCurrentUser();
if (user) {
  setIsAuthenticated(true);
}
```

---

#### Fix 1.7: Add Spam Protection to Anonymous Order Inserts

**Option A (Quick): Add a Supabase RPC function for order creation that validates basic constraints:**

```sql
CREATE OR REPLACE FUNCTION create_checkout_order(
  p_razorpay_order_id TEXT,
  p_buyer_email TEXT,
  p_buyer_name TEXT,
  p_total_amount_paise BIGINT,
  p_referral_code TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_public_token UUID;
  v_recent_count INT;
BEGIN
  -- Rate limit: max 3 orders per email per hour
  SELECT COUNT(*) INTO v_recent_count
  FROM orders
  WHERE buyer_email = p_buyer_email
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many orders. Please try again later.';
  END IF;

  -- Validate amount range (₹10 to ₹50,000 in paise)
  IF p_total_amount_paise < 1000 OR p_total_amount_paise > 5000000 THEN
    RAISE EXCEPTION 'Invalid order amount';
  END IF;

  v_public_token := gen_random_uuid();

  INSERT INTO orders (
    razorpay_order_id, buyer_email, buyer_name,
    total_amount_paise, referral_code, notes, public_token
  ) VALUES (
    p_razorpay_order_id, p_buyer_email, p_buyer_name,
    p_total_amount_paise, p_referral_code, p_notes, v_public_token
  );

  RETURN v_public_token;
END;
$$;
```

**Then lock down the direct INSERT policy:**
```sql
DROP POLICY IF EXISTS "orders_insert_anonymous_checkout" ON orders;

-- Only allow inserts through the RPC function (SECURITY DEFINER) or authenticated users
CREATE POLICY "orders_insert_authenticated_only" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Option B (Better, long-term): Move order creation entirely to the `create-razorpay-order` Edge Function** so the frontend never writes to the orders table directly.

---

#### Fix 1.8: Remove Debug Console Logs

**Strip all sensitive `console.log` statements from production code.** The most critical ones:

| File | What's Leaked |
|------|---------------|
| `ThankYouPage.tsx` | Order tokens, download links, Supabase connection info |
| `supabase.ts` (`getCreatorStats`) | Partner secret keys, revenue data |
| `EbookManager.tsx` | Product delivery links, insert payloads |
| `edgeFunction.ts` | Full request/response payloads |
| `CheckoutFlow.tsx` | Payment IDs, order IDs, public tokens |

**Quick fix — add to `vite.config.ts` to strip console.* in production builds:**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Strips ALL console.* calls from production bundle
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

---

#### Fix 1.9: Fix the N+1 Query in OrdersPanel

**Replace the per-order loop with a single joined query:**

```typescript
// BEFORE: N+1 queries
const ordersData = await getAllOrders();
for (const order of ordersData) {
  const items = await getOrderItems(order.id);
  // ...
}

// AFTER: Single query with join
export async function getAllOrdersWithItems(limit = 100) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        product_title,
        price,
        delivery_link_sent
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

**Result:** 101 API calls → 1 API call.

---

#### Fix 1.10: Remove the Temporary ThankYouPage Test Query

**In `src/pages/ThankYouPage.tsx`, delete the entire block (approximately lines 30–60) that:**
1. Creates a second Supabase client
2. Runs `select('*').limit(1)` on products
3. Logs connection diagnostics

This block is marked `// TEMPORARY` and wastes an API call on every thank-you page load.

---

### Priority 2: HIGH — Cloudinary & Image Optimization

#### Fix 2.1: Create a Cloudinary URL Transform Helper

**Create `src/utils/cloudinary.ts`:**
```typescript
/**
 * Transform a raw Cloudinary URL to include optimization parameters.
 * Converts: .../upload/v123/image.png
 * To:       .../upload/f_auto,q_auto,w_600/v123/image.png
 */
export function optimizeCloudinaryUrl(
  url: string | undefined,
  options: { width?: number; quality?: string } = {}
): string {
  if (!url) return '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  const { width = 600, quality = 'auto' } = options;
  const transforms = `f_auto,q_${quality},w_${width}`;

  // Insert transforms after /upload/
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Generate a tiny placeholder (blur-up) URL for progressive loading
 */
export function getPlaceholderUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return '';
  return url.replace('/upload/', '/upload/f_auto,q_10,w_20,e_blur:500/');
}
```

**Usage in components:**
```tsx
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

// In product cards:
<img
  src={optimizeCloudinaryUrl(product.cover_image_url, { width: 400 })}
  loading="lazy"
  alt={product.name}
/>

// In hero carousel (larger):
<img
  src={optimizeCloudinaryUrl(ebook.cover_image_url, { width: 800 })}
  loading="lazy"
  alt={ebook.name}
/>
```

#### Fix 2.2: Add `loading="lazy"` to All Images

Every `<img>` tag that is NOT the first above-the-fold hero image should have:
```html
<img loading="lazy" ... />
```

**Apply to:**
- `Products.tsx` — all product card images
- `Hero.tsx` — carousel images (except the first visible one)
- `CategoryPage.tsx` — all product grid images
- `SuperadminDashboard.tsx` — admin ebook grid images

#### Fix 2.3: Replace External Placeholders

Replace all `https://via.placeholder.com/...` URLs with a local SVG data URI:

```typescript
// In a constants file or inline:
export const PLACEHOLDER_COVER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23e2e8f0'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='%2394a3b8' font-size='14'%3ENo Cover%3C/text%3E%3C/svg%3E`;
```

---

### Priority 3: Netlify Configuration & Headers

#### Fix 3.1: Create `netlify.toml`

**Create `netlify.toml` in the project root:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA catch-all redirect
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers for all pages
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    # CSP: Allow Razorpay checkout, Cloudinary images, Supabase API, Google AdSense
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://*.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lux.razorpay.com https://api.cloudinary.com; frame-src https://api.razorpay.com https://checkout.razorpay.com https://pagead2.googlesyndication.com;"

# Cache static assets aggressively (immutable hashed files from Vite)
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Cache images
[[headers]]
  for = "/covers/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"

# Don't cache HTML (always serve fresh for SPA)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

### Priority 4: Additional Hardening

#### Fix 4.1: Add Input Validation to Edge Functions

**In `create-razorpay-order/index.ts`, add after field validation:**

```typescript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(buyer_email)) {
  return new Response(JSON.stringify({ error: 'Invalid email format' }), {
    headers: corsHeaders,
    status: 400,
  });
}

// Validate name (prevent injection, limit length)
if (buyer_name.length > 100 || buyer_name.length < 2) {
  return new Response(JSON.stringify({ error: 'Invalid name' }), {
    headers: corsHeaders,
    status: 400,
  });
}

// Validate amount range (₹1 to ₹50,000 in paise)
if (!Number.isInteger(amount_paise) || amount_paise < 100 || amount_paise > 5000000) {
  return new Response(JSON.stringify({ error: 'Invalid amount' }), {
    headers: corsHeaders,
    status: 400,
  });
}
```

#### Fix 4.2: Add Honeypot Field to Checkout Form

**In `CheckoutFlow.tsx`, add a hidden field that bots will fill but humans won't:**

```tsx
const [honeypot, setHoneypot] = useState('');

// In the form:
<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
/>

// In handlePayment:
if (honeypot) {
  // Bot detected — silently reject
  console.warn('Bot detected via honeypot');
  return;
}
```

#### Fix 4.3: Move Edge Function URL to Environment Variable

**In `src/utils/edgeFunction.ts`:**
```typescript
// BEFORE:
const EDGE_FUNCTION_URL = 'https://luxeufxyluqxrwuejjpx.supabase.co/functions/v1/create-razorpay-order';

// AFTER:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-razorpay-order`;
```

This uses the already-configured `VITE_SUPABASE_URL` env var instead of hardcoding the project URL.

---

## 4. Blog Architecture Recommendations

### 4.1 Do NOT Build the Blog Inside the React SPA

**Why:** Your current Vite + React SPA renders everything client-side. Every blog page visit would:
1. Download the full React bundle (~200KB+)
2. Mount the app
3. Fetch blog content from Supabase via API call
4. Render the content

This is disastrous for:
- **SEO:** Googlebot can render JS, but does so on a delayed second pass. Your blog pages will rank poorly.
- **Free tier:** Every reader = 1+ Supabase API call. A viral article with 50K readers = 50K+ API calls.
- **AdSense:** Google AdSense approval requires fast-loading, crawlable content. CSR pages often get rejected.
- **Core Web Vitals:** Client-rendered pages have poor LCP and CLS scores.

### 4.2 Recommended Architecture: Separate Static Blog

**Use Astro, Next.js (SSG mode), or 11ty for the blog as a separate project/subdirectory.**

#### Option A: Astro (Recommended for Blog + AdSense)

```
guiderr.com/              → Existing React SPA (Netlify)
guiderr.com/blog/          → Astro static site (Netlify, same project or separate)
```

**Why Astro:**
- Zero JavaScript by default (pure HTML/CSS output)
- Built-in image optimization (`<Image>` component)
- Markdown/MDX support for blog posts
- Outputs static HTML files — served 100% from Netlify CDN
- 0 API calls per reader (content is pre-built at deploy time)
- Perfect Lighthouse scores for AdSense approval

**Setup:**
```bash
# Create Astro blog alongside existing project
npx create-astro@latest blog --template blog
```

**Deploy as a path on Netlify:**
```toml
# netlify.toml - add to existing config
[[redirects]]
  from = "/blog/*"
  to = "/blog/:splat"
  status = 200

# Or deploy as separate Netlify site on subdomain: blog.guiderr.com
```

#### Option B: Markdown Files in Repo + Build-Time Rendering

If you want to keep things simple and in one repo:

1. Store blog posts as Markdown files in `content/blog/`
2. Use a Vite plugin (like `vite-plugin-md`) or a custom build step to convert them to static HTML at build time
3. Each blog post becomes a static `.html` file in the `dist/` folder
4. Netlify serves them from CDN — zero Supabase calls

### 4.3 Blog Content Caching Strategy

```
Blog Post Request Flow (Optimal):

User → Netlify CDN Edge (cache HIT) → Static HTML served
                                      → Zero Supabase calls
                                      → Zero JS execution
                                      → ~50ms response time

Store/App Request Flow (Current):

User → Netlify CDN → index.html → React App → Supabase API → Render
                                              → 200ms+ wait
                                              → 1+ API call per visit
```

### 4.4 AdSense-Optimized Blog Structure

```
/blog/
  ├── index.html                          ← Blog listing page
  ├── motorcycles/
  │   ├── best-touring-bikes-2026.html    ← Static HTML
  │   ├── beginner-riding-guide.html
  │   └── ...
  ├── finance/
  │   ├── mutual-fund-guide.html
  │   └── ...
  └── travel/
      ├── ladakh-road-trip-guide.html
      └── ...
```

**Each blog post HTML should include:**
```html
<!-- Critical for AdSense approval -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Detailed SEO description...">
  <link rel="canonical" href="https://guiderr.com/blog/post-slug">

  <!-- Open Graph for social sharing (critical for virality) -->
  <meta property="og:title" content="Post Title">
  <meta property="og:description" content="Post Description">
  <meta property="og:image" content="https://res.cloudinary.com/.../f_auto,q_auto,w_1200/og-image.jpg">
  <meta property="og:type" content="article">

  <!-- Structured data for Google rich results -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Post Title",
    "author": { "@type": "Person", "name": "Author Name" },
    "datePublished": "2026-03-07",
    "image": "https://res.cloudinary.com/..../og-image.jpg",
    "publisher": {
      "@type": "Organization",
      "name": "Guiderr",
      "logo": { "@type": "ImageObject", "url": "https://guiderr.com/logo.png" }
    }
  }
  </script>

  <!-- AdSense code (after approval) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>
</head>
```

### 4.5 Virality Survival Checklist for Blog

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| **Static HTML generation** | Use Astro or 11ty | Blog readers never touch Supabase |
| **CDN caching** | Netlify serves HTML from edge | Handles millions of views |
| **Image optimization** | Cloudinary `f_auto,q_auto,w_800` for blog images | 3–5× bandwidth savings |
| **Lazy load blog images** | `loading="lazy"` on all images except hero | Reduces Cloudinary bandwidth |
| **Responsive images** | Use `srcset` with Cloudinary width transforms | Serve 400px on mobile, 800px on desktop |
| **No client-side data fetching** | Blog content baked into HTML at build time | Zero API calls per reader |
| **Social share images** | Pre-generate OG images at 1200×630px | Critical for virality on Twitter/WhatsApp |
| **RSS feed** | Generate `/blog/feed.xml` at build time | Drives repeat traffic |
| **Internal linking** | Link blog posts to ebook store pages | Converts traffic to sales |
| **Minimal JS** | No React on blog pages — pure HTML/CSS | Fastest possible load times |

### 4.6 Revenue Architecture: Blog → Store Funnel

```
                  Blog (Static HTML, AdSense)
                  ┌─────────────────────────┐
                  │  Traffic: SEO + Social   │
  Google ────────→│  Revenue: AdSense ads    │
  Social ────────→│  Cost: ₹0 (Netlify CDN) │
                  └──────────┬──────────────┘
                             │
                    "Buy the full ebook"
                    CTA button in article
                             │
                             ▼
                  Store (React SPA, Supabase)
                  ┌─────────────────────────┐
                  │  Traffic: Blog referrals │
                  │  Revenue: Ebook sales    │
                  │  Cost: Supabase API call │
                  └─────────────────────────┘
```

This architecture ensures:
- **99% of traffic** (blog readers) is served from CDN — costs ₹0
- **Only buyers** (1–5% conversion) hit Supabase — minimal API usage
- **Viral articles** generate AdSense revenue and funnel to ebook sales
- **Free tier survives** because blog traffic never touches your backend

---

## Quick Reference: Fix Priority Matrix

| # | Fix | Effort | Impact | Do When |
|---|-----|--------|--------|---------|
| 1.1 | Add React Query caching | 2 hours | 🔴 Cuts API calls 50–80% | **Now** |
| 1.2 | Restrict `select()` columns | 30 min | 🔴 Stops delivery_link leak | **Now** |
| 1.3 | Fix RLS policy for orders | 30 min | 🔴 Prevents data scraping | **Now** |
| 1.4 | Rate-limit Edge Functions | 1 hour | 🔴 Prevents bot abuse | **Now** |
| 1.5 | Restrict CORS origins | 15 min | 🟡 Prevents cross-site abuse | **Now** |
| 1.6 | Remove hardcoded credentials | 1 hour | 🔴 Critical security fix | **Now** |
| 1.7 | Secure order inserts via RPC | 2 hours | 🟡 Prevents spam orders | **Before blog** |
| 1.8 | Strip console.log in prod | 15 min | 🟡 Stops data leaking | **Now** |
| 1.9 | Fix N+1 query | 30 min | 🔴 Admin: 101 calls → 1 | **Now** |
| 1.10 | Remove temp ThankYou query | 5 min | 🟡 Removes wasted call | **Now** |
| 2.1 | Cloudinary `f_auto,q_auto` | 1 hour | 🟡 3–5× bandwidth savings | **Now** |
| 2.2 | Add `loading="lazy"` | 30 min | 🟡 Reduces bandwidth | **Now** |
| 2.3 | Replace external placeholders | 15 min | 🟢 Removes external dependency | **When convenient** |
| 3.1 | Create `netlify.toml` | 30 min | 🟡 Security headers + caching | **Now** |
| 4.1 | Input validation on Edge Functions | 30 min | 🟡 Prevents injection | **Now** |
| 4.2 | Honeypot on checkout | 15 min | 🟢 Basic bot deterrent | **Before blog** |
| 4.3 | Move Edge URL to env var | 5 min | 🟢 Cleaner config | **When convenient** |
| Blog | Build with Astro (separate from SPA) | 1–2 days | 🔴 Critical for free tier | **Before blog launch** |

---

*End of Audit. Prioritize the "Now" items before any marketing push or blog launch.*
