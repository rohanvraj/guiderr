# 🔍 Diagnostic Guide: Unmasking 400 Bad Request Errors

**Date:** 24 January 2026  
**Purpose:** Real-time debugging for Razorpay integration

---

## 🚀 Quick Start

When you click "Buy" and get a 400 error, **open your browser DevTools Console** and look for logs starting with:
- `[EDGE-FUNCTION]` - Shows server-side diagnostics from Supabase
- `[CHECKOUT]` - Shows client-side payment initiation
- `[RAZORPAY-DIAGNOSTICS]` - Shows backend validation

---

## 📋 What Each Log Tells You

### **Frontend Console (Browser DevTools)**

#### 1. Payment Initiation
```
[CHECKOUT] Initiating payment {
  product_id: "uuid...",
  product_name: "Product Name",
  amount_in_rupees: 100,
  amount_in_paise: 10000,
  buyer_email: "user@example.com",
  buyer_name: "John Doe",
  items_count: 1
}
```
✅ **What it means:** Frontend successfully gathered data  
❌ **If missing:** Check product data loading

---

#### 2. Request Payload
```
[EDGE-FUNCTION] Sending payload: {
  "amount_paise": 10000,
  "buyer_email": "user@example.com",
  "buyer_name": "John Doe",
  "notes": {
    "items_count": 1,
    "timestamp": "2026-01-24T10:30:00.000Z"
  }
}
```
✅ **What it means:** Payload matches Edge Function expectations  
❌ **If empty or wrong structure:** Check CheckoutFlow.tsx

---

#### 3. Response Metadata
```
[EDGE-FUNCTION] Response received: {
  "status": 400,
  "statusText": "Bad Request",
  "headers": {
    "content-type": "application/json",
    "access-control-allow-origin": "*"
  }
}
```
❌ **Status 400:** Bad Request (see below for fixes)  
❌ **Status 500:** Server error in Edge Function  
✅ **Status 200:** Success!

---

#### 4. Response Body
```
[EDGE-FUNCTION] Response body parsed: {
  "error": "RAZORPAY_ERROR_DETAILS_HERE",
  "razorpay_error_code": "BAD_REQUEST_ERROR",
  "razorpay_error_description": "Invalid API Key ID Provided",
  "razorpay_error_source": "api",
  "razorpay_error_reason": "invalid_key_id"
}
```
🎯 **THIS IS THE KEY PART** - The real error is here!  
See "Common 400 Errors" section below.

---

### **Backend Console (Terminal running `supabase functions serve`)**

#### 1. Request Validation
```
[RAZORPAY-DIAGNOSTICS] Field validation {
  "has_amount_paise": true,
  "has_buyer_email": true,
  "has_buyer_name": true,
  "amount_paise_value": 10000,
  "buyer_email_value": "user@example.com",
  "buyer_name_value": "John Doe"
}
```
✅ **All true:** Request passed validation  
❌ **Any false:** Missing required field

---

#### 2. Environment Check
```
[RAZORPAY-DIAGNOSTICS] Environment check {
  "has_key_id": true,
  "has_key_secret": true,
  "key_id_length": 25,
  "key_secret_length": 32
}
```
✅ **All true + lengths > 0:** Keys are loaded  
❌ **has_key_id: false or length 0:** RAZORPAY_KEY_ID not in .env

---

#### 3. Razorpay API Payload
```
[RAZORPAY-DIAGNOSTICS] Razorpay API payload {
  "amount": 10000,
  "currency": "INR",
  "receipt": "order_1706086200000",
  "notes": {
    "buyer_email": "user@example.com",
    "buyer_name": "John Doe",
    "items_count": 1,
    "timestamp": "2026-01-24T10:30:00.000Z"
  }
}
```
✅ **Looks good:** Payload is correct  
❌ **Amount 0 or negative:** Check amountInPaise calculation

---

#### 4. Razorpay Response
```
[RAZORPAY-DIAGNOSTICS] Razorpay response received {
  "status": 400,
  "status_ok": false,
  "response_body": {
    "error": {
      "code": "BAD_REQUEST_ERROR",
      "description": "Invalid API Key ID Provided",
      "source": "api",
      "reason": "invalid_key_id"
    }
  }
}
```
🎯 **Check the error.description** - This tells you what Razorpay rejected!

---

## 🔧 Common 400 Errors & Fixes

### **Error: "Invalid API Key ID Provided"**
```
razorpay_error_reason: "invalid_key_id"
```
**Root Cause:** `RAZORPAY_KEY_ID` not set or malformed in `.env`

**Fix:**
```bash
# Terminal 1: Check your .env file
cat .env | grep RAZORPAY_KEY_ID

# Should output:
# RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Terminal 2: Restart supabase functions
supabase functions serve

# Terminal 3: Check logs from Terminal 1 for:
# [RAZORPAY-DIAGNOSTICS] Environment check {
#   "has_key_id": true,     ← Should be true
```

---

### **Error: "Invalid API Key Secret"**
```
razorpay_error_reason: "invalid_key_secret"
```
**Root Cause:** `RAZORPAY_KEY_SECRET` not set or incorrect

**Fix:**
```bash
# Verify both keys are in .env
grep RAZORPAY .env

# Should show both:
# RAZORPAY_KEY_ID=rzp_test_...
# RAZORPAY_KEY_SECRET=xxxx...
```

---

### **Error: "Missing required fields"**
```
error: "Missing required fields: amount_paise, buyer_email, buyer_name"
received_fields: ["amount", "currency", "receipt"]
```
**Root Cause:** Frontend is sending wrong field names!

**Fix:** This means CheckoutFlow.tsx is sending the wrong structure. Check:
```typescript
// ✅ CORRECT payload in edgeFunction.ts
createRazorpayOrderViaEdgeFunction({
  amount_paise: 10000,    // ← Not "amount"
  buyer_email: "...",
  buyer_name: "...",
})
```

---

### **Error: "Invalid JSON in request body"**
```
error: "Invalid JSON in request body"
details: "Unexpected token..."
```
**Root Cause:** Payload sent is not valid JSON

**Check:**
1. All strings are quoted
2. All objects closed properly
3. No circular references

---

### **Error: No Order ID returned from Edge Function**
```
error: "No order ID returned from Edge Function"
Invalid response - missing order ID: { "error": "..." }
```
**Root Cause:** Razorpay rejected the order creation

**Check the earlier logs** for the actual Razorpay error (error.description)

---

## 📊 Diagnostic Checklist

When you get a 400 error, go through this in order:

```
1. [ ] Check [CHECKOUT] logs - Is payment data correct?
2. [ ] Check [EDGE-FUNCTION] Sending payload - Is structure right?
3. [ ] Check [RAZORPAY-DIAGNOSTICS] Environment check - Are keys loaded?
   [ ] has_key_id: true
   [ ] has_key_secret: true
   [ ] Both have length > 0
4. [ ] Check [RAZORPAY-DIAGNOSTICS] Razorpay API payload - Is data valid?
5. [ ] Check [RAZORPAY-DIAGNOSTICS] Razorpay response - What's the error?
   [ ] Look at: response_body.error.description
6. [ ] Check [EDGE-FUNCTION] Response body parsed - Raw error details
```

---

## 🛡️ Security Notes

✅ **Protected:**
- API Keys only logged as "length: XX" (not exposed)
- Passwords redacted in logs
- Full error stack only in backend console (not exposed to frontend)

❌ **NEVER do this:**
- Don't log RAZORPAY_KEY_SECRET raw
- Don't send backend errors directly to frontend (already handled)
- Don't expose environment variables to browser console

---

## 🚨 Emergency: "Deno is not defined"

If you see errors like `Cannot find name 'Deno'`, this is **NOT a real error**:
- It's just TypeScript linting noise
- The Edge Function will work fine in Supabase runtime
- Ignore it - the function runs correctly

---

## 📝 How to Share Logs with Support

When asking for help, provide:

1. **Terminal output from `supabase functions serve`:**
   ```
   Copy all [RAZORPAY-DIAGNOSTICS] logs here
   ```

2. **Browser console logs:**
   ```
   Copy all [EDGE-FUNCTION] and [CHECKOUT] logs here
   ```

3. **Your .env file (ONLY the length, NOT the values):**
   ```
   RAZORPAY_KEY_ID length: 25 chars ✓
   RAZORPAY_KEY_SECRET length: 32 chars ✓
   ```

---

## 🎯 Success Criteria

When it's working, you should see:

```
✅ [CHECKOUT] Initiating payment { ... }
✅ [EDGE-FUNCTION] Sending payload: { ... }
✅ [RAZORPAY-DIAGNOSTICS] Environment check { has_key_id: true, has_key_secret: true }
✅ [RAZORPAY-DIAGNOSTICS] Razorpay API payload { ... }
✅ [RAZORPAY-DIAGNOSTICS] Success - returning to frontend { id: "order_xxx", ... }
✅ [EDGE-FUNCTION] Response received: { status: 200, statusText: "OK" }
✅ [EDGE-FUNCTION] Success! Returning: { id: "order_xxx", status: 'success' }
✅ [CHECKOUT] Order created successfully: { id: "order_xxx", ... }
✅ Razorpay checkout modal opens
```

---

## 🔄 Version Info

- **Date Created:** 24 January 2026
- **Last Updated:** 24 January 2026
- **Files Modified:**
  - `supabase/functions/create-razorpay-order/index.ts` - Added [RAZORPAY-DIAGNOSTICS] logging
  - `src/utils/edgeFunction.ts` - Added [EDGE-FUNCTION] logging with JSON.stringify
  - `src/components/CheckoutFlow.tsx` - Added [CHECKOUT] logging
