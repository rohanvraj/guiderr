# Selling Setup (Razorpay) 🧾💳

This document explains how selling via Razorpay works in Guiderr and what environment variables / configuration you need to run payments in production.

---

## How Razorpay is used in this project 🔧

- The app loads Razorpay's checkout script in the browser (`https://checkout.razorpay.com/v1/checkout.js`).
- The checkout is opened client-side using `src/utils/razorpay.ts` (`openRazorpayCheckout`).
- The app passes the payment amount (in paise) and buyer prefill data (name + email) to Razorpay.
- On successful payment Razorpay returns `razorpay_payment_id` to the handler; the app then:
  - Updates a local Supabase `orders` record (if Supabase is configured) with the payment id and `payment_status: 'completed'`.
  - Clears the cart and redirects the buyer to `/thank-you?order_id=<ORDER_ID>`.
- The Thank You page shows the buyer a confirmation and the message: “You’ll receive your ebook(s) via email shortly”. Fulfillment is currently manual.

> Implementation locations
> - Razorpay utils: `src/utils/razorpay.ts` 🔁
> - Checkout UI: `src/components/CheckoutFlow.tsx` ✅
> - Thank You page: `src/pages/ThankYouPage.tsx` ✅
> - Optional order storage (Supabase): `src/utils/supabase.ts` ⚠️ (see below)

---

## Required environment variables 🧩

- `VITE_RAZORPAY_KEY_ID` — **required** (public key, client-side only). Example: `rzp_test_...` or `rzp_live_...`

Optional (only if you're using Supabase order storage):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Important: Never put Razorpay secret keys in the frontend or commit them to the repo. Only use the public key (`VITE_RAZORPAY_KEY_ID`) in the client.

---

## Switching from Test to Live ⚙️

- In development use `rzp_test_...` keys (set these in your local `.env` or local dev env).
- For production (Netlify) replace the env var `VITE_RAZORPAY_KEY_ID` with your live key `rzp_live_...` in Netlify site settings → Environment variables.
- No code changes are needed to switch keys.

---

## Where sales data lives 📊

- Primary source of truth: **Razorpay Dashboard** — all successful payments are visible there.
- If Supabase is configured, a copy of the order (and items) is stored in Supabase and viewed via the Admin Dashboard in the app.

---

## Supabase (optional) — quick notes 🗄️

- Supabase is optional. The app supports both modes:
  - **Without Supabase**: payments still complete and appear in Razorpay; the app will still redirect buyers to `/thank-you` and show the confirmation message.
  - **With Supabase**: the app creates a simple `orders` record and `order_items` before opening checkout and updates payment info after success.

If you want to enable Supabase later, create a minimal `orders` table with these fields (basic):
- `id` (uuid or text)
- `razorpay_order_id` (text)
- `buyer_email` (text)
- `buyer_name` (text)
- `total_amount` (integer, paise)
- `payment_status` (text)
- `delivery_status` (text)
- `razorpay_payment_id` (text)
- `created_at`, `updated_at`

And `order_items` with:
- `id`, `order_id`, `product_id`, `product_title`, `price`, `delivery_link_sent`

---

## Operational notes & maintenance tips ⚠️

- The flow is intentionally simple: no customer accounts, no automatic email delivery, no webhooks, and no server-side Razorpay logic.
- For manual fulfillment: use the Admin Dashboard (`/admin`) to view orders and click "Send Email" to contact buyers.
- If you later want automated flows, consider adding server-side webhook handling and secure verification of Razorpay signatures.

---

If you'd like, I can also add a short checklist for releasing to production (env variables, test payment, verify Razorpay dashboard). ✅
