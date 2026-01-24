# ✅ Local Setup Verification Checklist

**To fix the 400 Bad Request error, verify these steps in order:**

---

## Step 1: Check Your .env File

```bash
# Terminal: Navigate to your project root
cd /Users/rohanmacbook/Downloads/all\ my\ web\ apps/guiderr

# Check if .env exists and has the Razorpay keys
cat .env | grep RAZORPAY

# You should see BOTH:
# RAZORPAY_KEY_ID=rzp_test_...   (or rzp_live_...)
# RAZORPAY_KEY_SECRET=...
```

**❌ If missing:** 
```bash
# Create/update .env with your keys
echo "RAZORPAY_KEY_ID=YOUR_KEY_HERE" >> .env
echo "RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE" >> .env
```

---

## Step 2: Verify Supabase Functions Can Access .env

```bash
# Terminal 1: Start supabase functions
supabase functions serve

# You should see:
# ✓ Started Supabase local development server
# Listening on http://localhost:54321
```

✅ **Leave this running** while testing

---

## Step 3: Test the Edge Function Directly (Optional)

```bash
# Terminal 2: Send test request to Edge Function
curl -X POST http://localhost:54321/functions/v1/create-razorpay-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount_paise": 10000,
    "buyer_email": "test@example.com",
    "buyer_name": "Test User",
    "notes": {"test": true}
  }'

# You should see either:
# ✅ {"id":"order_...", "amount":10000, ...}
# ❌ {"error":"Invalid API Key ID Provided", ...}
```

---

## Step 4: Start Your Frontend Dev Server

```bash
# Terminal 2 (if not using for curl test): Start Vite dev server
npm run dev

# You should see:
# VITE v... ready in ... ms
# ➜  Local: http://localhost:5173/
```

---

## Step 5: Open Browser DevTools

```bash
# In your browser:
1. Open http://localhost:5173
2. Press F12 or Cmd+Option+I
3. Go to "Console" tab
4. Click "Buy" button
5. Watch for logs starting with [CHECKOUT], [EDGE-FUNCTION], [RAZORPAY-DIAGNOSTICS]
```

---

## Step 6: Read the Diagnostic Logs

**Look for this sequence in your browser console:**

```
✅ [CHECKOUT] Initiating payment { ... }
   ↓
✅ [EDGE-FUNCTION] Sending payload: { ... }
   ↓
✅ [EDGE-FUNCTION] Response received: { status: 200, ... }
   ↓
✅ [EDGE-FUNCTION] Response body parsed: { id: "order_...", ... }
   ↓
✅ [CHECKOUT] Order created successfully: { ... }
```

**If you see a 400:**

```
✅ [EDGE-FUNCTION] Response received: { status: 400, ... }
   ↓
❌ [EDGE-FUNCTION] Response body parsed: { error: "THE_REAL_ERROR_HERE", ... }
```

---

## Step 7: Check Backend Logs

**Look in Terminal 1 (where supabase functions serve is running):**

```
[RAZORPAY-DIAGNOSTICS] Environment check {
  "has_key_id": true,        ← Should be true
  "has_key_secret": true,    ← Should be true
  "key_id_length": 25,       ← Should be > 0
  "key_secret_length": 32    ← Should be > 0
}

[RAZORPAY-DIAGNOSTICS] Razorpay response received {
  "status": 400,
  "status_ok": false,
  "response_body": {
    "error": {
      "description": "Invalid API Key ID Provided",  ← THE ACTUAL ERROR
      ...
    }
  }
}
```

---

## 🔧 If You Get Each Error:

### Error: "has_key_id: false" or "key_id_length: 0"

**Fix:**
```bash
# 1. Stop supabase functions serve (Ctrl+C)
# 2. Update .env with your actual Razorpay Key ID
# 3. Restart: supabase functions serve
```

---

### Error: "Invalid API Key ID Provided"

**Fix:**
```bash
# 1. Get your real Razorpay Key from:
#    https://dashboard.razorpay.com/app/keys
# 2. Copy the Key ID (starts with rzp_test_ or rzp_live_)
# 3. Update .env:
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
# 4. Restart supabase functions serve
```

---

### Error: "Missing required fields"

**This means the frontend payload structure is wrong!**

Check logs show:
```
received_fields: ["amount", "currency", ...] ← Wrong field names!
```

**Verify CheckoutFlow.tsx sends:**
```typescript
createRazorpayOrderViaEdgeFunction({
  amount_paise: amountInPaise,    // ← amountInPaise, not amount
  buyer_email: buyerInfo.email,
  buyer_name: buyerInfo.name,
})
```

---

## 📋 Complete Verification Checklist

Before clicking "Buy", verify all of these are ✅:

```
Pre-Flight Checks:
[ ] .env file exists in project root
[ ] .env contains RAZORPAY_KEY_ID
[ ] .env contains RAZORPAY_KEY_SECRET
[ ] supabase functions serve is running (Terminal 1)
[ ] npm run dev is running (Terminal 2)
[ ] Browser opened to http://localhost:5173
[ ] DevTools Console is open (F12)

Click "Buy" Checks:
[ ] [CHECKOUT] log appears with payment data
[ ] [EDGE-FUNCTION] Sending payload log appears
[ ] [EDGE-FUNCTION] Response received log shows status 200 or 400
[ ] If 400: [RAZORPAY-DIAGNOSTICS] error.description tells you why
[ ] If 200: Razorpay checkout modal opens
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| `Cannot find name 'Deno'` in console | This is just TypeScript linting noise. Ignore it - Edge Function works fine. |
| `[object Object]` in error | ✅ FIXED - now you'll see real error messages |
| 400 Bad Request with no error details | ✅ FIXED - logs now show the actual Razorpay error |
| Supabase functions won't start | Run: `supabase functions serve` in project root |
| .env changes not picked up | Restart `supabase functions serve` (kill and restart) |
| Frontend not hitting Edge Function | Verify URL is exactly: `https://luxeufxyluqxrwuejjpx.supabase.co/functions/v1/create-razorpay-order` |

---

## 📞 Ready to Debug?

When you're ready, follow this sequence:

1. **Open Terminal 1:** Run `supabase functions serve`
2. **Open Terminal 2:** Run `npm run dev`
3. **Open Browser:** Go to http://localhost:5173
4. **Open DevTools:** Press F12, go to Console
5. **Click Buy:** Watch the logs flow in
6. **Capture output:** Take screenshots of all [RAZORPAY-DIAGNOSTICS] and [EDGE-FUNCTION] logs
7. **Compare:** Match your logs to the "Expected Output" section above

---

**The goal:** See exactly which field or validation is causing the 400 error, then fix it with confidence! 🎯
