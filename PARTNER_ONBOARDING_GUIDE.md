# Partner Onboarding Guide — Guiderr
**For admin eyes only. Last updated: April 2026.**

---

## 1. HOW TO ADD A PARTNER (Admin)

Partners must be created in the **Supabase Dashboard** directly.  
Client-side creation is intentionally blocked — `createPartner()` throws before touching the DB.

### Steps

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → **guiderr project** → **Table Editor** → `partners` table.

2. Click **Insert row** and fill in:

   | Column | Value | Notes |
   |---|---|---|
   | `code` | e.g. `priya20` | All lowercase, no spaces. This goes in the URL. |
   | `name` | e.g. `Priya Sharma` | Display name shown on their private dashboard. |
   | `upi_id` | e.g. `priya@upi` | Used by you to pay them each Sunday. |
   | `commission_rate` | e.g. `30` | Integer percentage (30 = 30%). |
   | `secret_key` | Generate a UUID: `SELECT gen_random_uuid();` in SQL editor | This is their private dashboard password — share only with them. |
   | `clicks` | `0` | Leave as 0. Auto-increments on every link visit. |

3. Click **Save**. The partner is live instantly — no deploy needed.

### Generate a secret_key quickly
In the Supabase SQL Editor, run:
```sql
SELECT gen_random_uuid();
```
Copy the result. Paste it as the `secret_key` value.

---

## 2. LINK GENERATION

The referral link format is:
```
https://www.guiderr.in/?ref=[partner_code]
```

### Examples
| Partner | Code | Referral Link |
|---|---|---|
| Priya Sharma | `priya20` | `https://www.guiderr.in/?ref=priya20` |
| Rahul M | `rahul50` | `https://www.guiderr.in/?ref=rahul50` |

### How it works (for your reference)
- When a visitor lands on any page with `?ref=priya20`, the `ReferralTracker` component in `App.tsx` fires.
- It stores `priya20` in `localStorage` under the key `active_referral`.
- A 24-hour debounce prevents repeated clicks from inflating the count. One write per browser per day per code.
- The referral code persists across all page navigations until the browser session ends.

---

## 3. EBOOK-SPECIFIC LINKS

To send a creator a link that lands directly on a specific category page **and** still tracks the referral:

```
https://www.guiderr.in/[category]?ref=[partner_code]
```

The `?ref=` param is read from the URL by `ReferralTracker` regardless of which page the visitor lands on (it's mounted at the App root, not on a specific route).

### Category URL slugs
| Category | URL Segment | Full Referral Link Example |
|---|---|---|
| Motorcycles | `/motorcycles` | `https://www.guiderr.in/motorcycles?ref=priya20` |
| Finance | `/finance` | `https://www.guiderr.in/finance?ref=priya20` |
| Travel | `/travel` | `https://www.guiderr.in/travel?ref=priya20` |
| Children | `/children` | `https://www.guiderr.in/children?ref=priya20` |
| Parenting | `/parenting` | `https://www.guiderr.in/parenting?ref=priya20` |
| Art | `/art` | `https://www.guiderr.in/art?ref=priya20` |

> **Tip:** Give lifestyle/parenting creators the `/parenting?ref=` link so they land exactly where their audience wants to go, while still getting tracked.

---

## 4. CREATOR DASHBOARD — Private View

Each creator gets a private, read-only stats dashboard. It shows **only their own data** — no revenue from other partners, no admin data, no other creator info.

### The URL format
```
https://www.guiderr.in/stats/[secret_key]
```

### What it shows
- Total link clicks
- Total completed sales attributed to their code
- Total earnings (calculated as: `completed_order_revenue × commission_rate / 100`)
- Their referral link (for easy copying)

### How to give a creator their dashboard link

1. Go to Supabase → `partners` table → find their row → copy the `secret_key`.
2. Compose their private URL:
   ```
   https://www.guiderr.in/stats/[their_secret_key]
   ```
3. Send it to them via DM or email. **Do not share it publicly.**

### Security model
- The `secret_key` is the only credential — possession of the URL grants read access to that partner's stats only.
- The query in `getCreatorStats()` matches on `secret_key` using RLS-protected `partners` table.
- `upi_id` and other sensitive admin fields are **not** returned to the creator dashboard — it only receives `name`, `code`, `commission_rate`, and `clicks`.
- No login required for creators; no passwords to manage.

---

## 5. SUNDAY PAYOUT WORKFLOW

1. Go to `https://www.guiderr.in/admin` → **Partners & Analytics** tab.
2. Note the **Commission Owed** column for each partner (already calculated in rupees).
3. Open your UPI app, send payment to the `upi_id` shown, note the partner name in the UPI note field.
4. Keep a screenshot of each payment confirmation.
5. Repeat for all partners with commission > ₹0.

> Commission is calculated only from **completed** orders. Pending or failed payments are excluded automatically.

---

## 6. FRUGALITY & FREE-TIER STATUS

| Operation | DB Calls | Free-Tier Impact |
|---|---|---|
| Link click (24h debounce) | 1 `UPDATE` per visitor per day | Negligible |
| Order creation | 1 `INSERT` to `orders` | Per sale |
| Admin analytics view | 2 queries (partners + orders) | Per admin page view |
| Creator stats view | 2 queries (partner + orders) | Per creator dashboard load |

**Verdict:** This "Linked Table" approach (orders carry `referral_code`, calculated at query time) is the gold standard for zero-cost commissions. There is no scheduled job, no materialized view, no background worker — all math happens in JavaScript at query time. Supabase free tier limit is 500MB storage and 2GB bandwidth/month; this system uses a few KB per month of bandwidth for analytics.

No simplification needed. "Plan B" (a flat spreadsheet or Google Sheet) would trade auditability and real-time accuracy for marginal simplicity — not worth it at this scale.
