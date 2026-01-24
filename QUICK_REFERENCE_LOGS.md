# 🎯 Quick Reference: Reading Diagnostic Logs

## 🔴 You See: 400 Bad Request

### Step 1: Check Browser Console (F12)

```
❌ [EDGE-FUNCTION] Response received: { "status": 400, ... }
   ↓
❌ [EDGE-FUNCTION] Response body parsed: { "error": "...", ... }
   ↓ LOOK HERE ↓
```

The `error` field in "Response body parsed" is your answer!

---

## 📋 Error Quick Lookup

| Error Message | Fix |
|---|---|
| `Invalid API Key ID Provided` | Update RAZORPAY_KEY_ID in .env |
| `Invalid API Key Secret` | Update RAZORPAY_KEY_SECRET in .env |
| `Missing required fields: amount_paise, ...` | Check payload structure matches: `{ amount_paise, buyer_email, buyer_name }` |
| `Amount must be greater than 0` | Check `amountInPaise` calculation in CheckoutFlow.tsx |
| `No order ID returned from Edge Function` | Look at earlier logs for actual Razorpay error |
| `Invalid JSON in request body` | Payload not valid JSON - check JSON.stringify() |

---

## ✅ What Success Looks Like

```
✅ [CHECKOUT] Initiating payment { amount_in_paise: 10000, ... }
✅ [EDGE-FUNCTION] Sending payload: { amount_paise: 10000, ... }
✅ [EDGE-FUNCTION] Response received: { "status": 200, ... }
✅ [EDGE-FUNCTION] Success! Returning: { id: "order_xxx", ... }
✅ [CHECKOUT] Order created successfully: { id: "order_xxx", ... }
  → Razorpay modal opens automatically
```

---

## 🔧 Immediate Fixes

### Fix #1: Wrong Razorpay Keys
```bash
# 1. Get your real keys from:
#    https://dashboard.razorpay.com/app/keys

# 2. Update .env
echo "RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE" > .env
echo "RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE" >> .env

# 3. Restart supabase functions serve
# (Kill with Ctrl+C, run again)
```

### Fix #2: Fields Mismatch
Verify CheckoutFlow.tsx is calling:
```typescript
createRazorpayOrderViaEdgeFunction({
  amount_paise: amountInPaise,    // ← NOT "amount"
  buyer_email: buyerInfo.email,
  buyer_name: buyerInfo.name,
})
```

### Fix #3: .env Not Loaded
```bash
# 1. Verify .env exists in project root
ls .env

# 2. Check keys are there
grep RAZORPAY .env

# 3. Restart supabase functions serve
# (Ctrl+C then run again)
```

---

## 📱 Mobile Verification

Can't run local? Check in **Supabase Dashboard**:

1. Go to **Functions** → **create-razorpay-order**
2. Click **Logs** tab
3. Click **Buy** button in your app
4. Refresh logs - you should see `[RAZORPAY-DIAGNOSTICS]` entries
5. Look for error.description in the logs

---

## ⏱️ When to Check Each Place

| When | Check |
|---|---|
| Frontend sends wrong data | Look at `[CHECKOUT]` logs first |
| Request structure wrong | Look at `[EDGE-FUNCTION] Sending payload` |
| 400 received from Razorpay | Look at `[EDGE-FUNCTION] Response body parsed` |
| Backend not loaded keys | Look at `[RAZORPAY-DIAGNOSTICS] Environment check` |
| Razorpay rejects call | Look at `[RAZORPAY-DIAGNOSTICS] Razorpay response received` |

---

## 🚨 If You're Still Stuck

Provide these details:

1. **Screenshot of:** `[EDGE-FUNCTION] Response body parsed: { ... }`
2. **Screenshot of:** `[RAZORPAY-DIAGNOSTICS] Environment check { ... }` (from terminal)
3. **Confirm:**
   - [ ] RAZORPAY_KEY_ID is set in .env
   - [ ] RAZORPAY_KEY_SECRET is set in .env
   - [ ] supabase functions serve is running
   - [ ] npm run dev is running
   - [ ] Opened browser console (F12)

---

## 📝 Log Format Reference

All new logs use this format:

```
[SOURCE] STAGE/EVENT: {
  "field": "value",
  "status": "ok|error",
  ...
}
```

**Sources:**
- `[CHECKOUT]` - Frontend payment initiation
- `[EDGE-FUNCTION]` - Frontend to backend communication
- `[RAZORPAY-DIAGNOSTICS]` - Backend processing

---

## 💾 One-Minute Setup

```bash
# Terminal 1
supabase functions serve

# Terminal 2 (in project root)
npm run dev

# Browser
http://localhost:5173
F12 (open console)
Click Buy
Watch logs
```

That's it! Everything is logged. 🎯
