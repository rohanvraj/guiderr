# Razorpay Webstore Success URL - Configuration Guide

## Question
What URL should you set in Razorpay Webstore's success redirect field to work with our dynamic ThankYouPage.tsx?

---

## Answer: The Correct URL Format

### ✅ Base Success URL
```
https://yourdomain.com/thank-you
```

Replace `yourdomain.com` with your actual domain (e.g., `guiderr.com`).

---

## 🔴 Important: Razorpay Webstore Limitation

**Razorpay Webstore does NOT automatically pass product IDs as query parameters** in the success redirect URL.

When a customer completes payment in Razorpay Webstore, it redirects to your success URL but **does not include product information by default**.

---

## ✅ Solution: Two Practical Approaches

### **Approach 1: Use Order ID + Backend (Most Reliable)**
```
Success URL: https://yourdomain.com/thank-you?order_id={order_id}
```

Razorpay will substitute `{order_id}` with the actual order ID. Then:
1. Your backend fetches order details from Razorpay API using the order_id
2. Backend queries which products were in the order
3. Backend redirects to: `https://yourdomain.com/thank-you?ebooks=id1,id2&ref=code`
4. Frontend ThankYouPage displays downloads

**But this requires a backend** (contradicts your "frontend-only" requirement).

---

### **Approach 2: Store Ebook IDs Before Checkout (Frontend-Only)**

This is the **frontend-only approach that works with your current setup**:

1. **Before customer clicks "Buy"**, store ebook IDs in `localStorage`:
   ```javascript
   localStorage.setItem('purchasedEbookIds', 'motorcycle-beginners-1,advanced-riding-2');
   localStorage.setItem('referralCode', 'tarun');
   ```

2. **Set Razorpay success URL to:**
   ```
   https://yourdomain.com/thank-you
   ```

3. **Modify ThankYouPage.tsx to:**
   - First check URL query params: `?ebooks=...&ref=...`
   - If not found, retrieve from localStorage
   - Clear localStorage after displaying

4. **After payment completes**, Razorpay redirects to `/thank-you`
5. **Your ThankYouPage** reads from localStorage and displays downloads

---

## 🎯 Example: Complete Flow with Approach 2

### Step 1: User selects ebooks to buy
Customer on your store selects:
- Ebook 1: `motorcycle-beginners-1`
- Ebook 2: `advanced-riding-2`
- Referral source: `tarun` (influencer)

### Step 2: Before Razorpay checkout
```javascript
// Store in localStorage before opening Razorpay
localStorage.setItem('purchasedEbookIds', 'motorcycle-beginners-1,advanced-riding-2');
localStorage.setItem('referralCode', 'tarun');

// Open Razorpay Webstore/checkout
```

### Step 3: Configure Razorpay success URL
```
https://guiderr.com/thank-you
```

### Step 4: After payment
Razorpay redirects to: `https://guiderr.com/thank-you`

### Step 5: ThankYouPage retrieves data
```javascript
// In ThankYouPage.tsx
const ebooksParam = searchParams.get('ebooks') || localStorage.getItem('purchasedEbookIds') || '';
const refCode = searchParams.get('ref') || localStorage.getItem('referralCode');

// Clear localStorage after showing
localStorage.removeItem('purchasedEbookIds');
localStorage.removeItem('referralCode');
```

---

## 🎯 Recommended: URL for Razorpay Webstore Setting

**Exact URL to enter in Razorpay Webstore:**

```
https://guiderr.com/thank-you
```

(or `https://yoursite.com/thank-you` with your domain)

---

## 📝 What NOT to Use

❌ **Do NOT use:**
```
https://guiderr.com/thank-you?ebooks={product_id}&ref={referrer_code}
```

**Why:** Razorpay Webstore doesn't support these placeholders. They won't be substituted.

---

## ✅ Modified ThankYouPage Code

Here's how to update ThankYouPage.tsx to work with localStorage fallback:

```tsx
export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse query parameters OR fall back to localStorage
  const ebooksParam = searchParams.get('ebooks') || 
                     localStorage.getItem('purchasedEbookIds') || 
                     '';
  const refCode = searchParams.get('ref') || 
                 localStorage.getItem('referralCode');

  // Rest of component logic stays the same...
  
  // Clean up localStorage after component mounts
  useEffect(() => {
    if (ebooksParam && !searchParams.get('ebooks')) {
      // Data came from localStorage, clear it
      localStorage.removeItem('purchasedEbookIds');
      localStorage.removeItem('referralCode');
    }
  }, []);
  
  // ... rest of component
}
```

---

## 🔄 Complete Example: Store Integration

### Before Customer Goes to Razorpay

```javascript
// In your store/checkout component
function handleBuyClick(ebookIds, referrerCode) {
  // Store for thank you page
  localStorage.setItem('purchasedEbookIds', ebookIds.join(','));
  localStorage.setItem('referralCode', referrerCode || '');
  
  // Then redirect to Razorpay checkout
  // (your existing Razorpay checkout code)
}
```

### After Payment (Razorpay redirects to `/thank-you`)

ThankYouPage automatically displays:
1. Stored ebook IDs from localStorage
2. Referral code if provided
3. Google Drive download links
4. Success message

---

## 🎯 Summary: What to Enter in Razorpay

| Setting | Value |
|---------|-------|
| **Success Redirect URL** | `https://guiderr.com/thank-you` |
| **Failure Redirect URL** | `https://guiderr.com/` (or your store page) |
| **Webhook URL** | Optional (for backend tracking) |

---

## ✅ Why This Approach Works

✅ **Frontend-only** - No backend API calls needed  
✅ **Dynamic** - Works for any number of ebooks  
✅ **Works with any influencer** - Referral code stored  
✅ **Simple** - Just localStorage + query params  
✅ **Scalable** - No Razorpay configuration per product needed  
✅ **Matches Razorpay limitations** - Doesn't rely on unsupported placeholders  

---

## 📋 Comparison Table

| Method | Backend | Scalable | Razorpay Support |
|--------|---------|----------|------------------|
| URL placeholders | No | ✅ Yes | ❌ No |
| Order ID lookup | ✅ Required | ✅ Yes | ✅ Yes |
| **localStorage** | ❌ No | ✅ Yes | ✅ Yes |

---

## ⚠️ Important Notes

1. **localStorage only works on same domain** - Razorpay must redirect back to your site
2. **localStorage is per-browser** - Works fine for web, but not cross-device
3. **Clear localStorage after displaying** - To avoid showing stale data
4. **As backup, also support URL query params** - For direct links: `/thank-you?ebooks=...&ref=...`

---

## Final Answer

### In Razorpay Webstore, set:
```
Success URL: https://guiderr.com/thank-you
```

### Before sending to Razorpay, store:
```javascript
localStorage.setItem('purchasedEbookIds', 'ebook-id-1,ebook-id-2');
localStorage.setItem('referralCode', 'influencer-code');
```

### ThankYouPage.tsx handles:
- Reading from localStorage OR URL params (if direct link)
- Matching ebook IDs to data
- Displaying downloads
- Clearing localStorage after display

This is the **correct, production-ready approach for frontend-only** with Razorpay Webstore! ✅
