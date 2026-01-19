# Store Integration Guide - How to Pass Data to ThankYouPage

## Overview
When your customer clicks "Buy" before going to Razorpay Webstore checkout, store the ebook IDs and referral code in localStorage. Razorpay will redirect to `/thank-you`, where the page automatically retrieves and displays the purchased ebooks.

---

## Step 1: Before Opening Razorpay Checkout

### Example: In your store/product component

```javascript
// Store ebook purchase data before Razorpay checkout
function handlePurchaseClick(ebookIds, referralCode = null) {
  // Store for thank you page (survives Razorpay redirect)
  localStorage.setItem('purchasedEbookIds', ebookIds.join(','));
  
  if (referralCode) {
    localStorage.setItem('referralCode', referralCode);
  }
  
  // Then open Razorpay checkout
  // (your existing Razorpay code here)
  openRazorpayCheckout();
}
```

---

## Step 2: Example - Buying Multiple Ebooks

### Scenario: Customer buys 2 ebooks from influencer "tarun"

```javascript
function handleBuyMultiple() {
  const selectedEbooks = [
    'motorcycle-beginners-1',
    'advanced-riding-2'
  ];
  
  const referrer = 'tarun'; // From URL param like ?ref=tarun
  
  // Store in localStorage
  localStorage.setItem('purchasedEbookIds', selectedEbooks.join(','));
  localStorage.setItem('referralCode', referrer);
  
  // Redirect to Razorpay or open Razorpay modal
  // After payment, Razorpay redirects to: https://guiderr.com/thank-you
}
```

---

## Step 3: ThankYouPage Automatically Handles It

When Razorpay redirects to `/thank-you`:

1. ✅ Page checks for `?ebooks=...` in URL (direct link testing)
2. ✅ If not found, retrieves from localStorage (Razorpay redirect)
3. ✅ Displays purchased ebooks with download links
4. ✅ Shows referral code if provided
5. ✅ Clears localStorage after displaying

**No additional code needed on ThankYouPage!**

---

## Code Snippets: Common Scenarios

### Scenario 1: Single Ebook Purchase

```javascript
function buySingleEbook(ebookId, referralCode) {
  localStorage.setItem('purchasedEbookIds', ebookId);
  localStorage.setItem('referralCode', referralCode);
  
  // Open Razorpay
  window.location.href = 'https://razorpay.com/webstore/...';
}

// Usage:
buySingleEbook('motorcycle-beginners-1', 'influencer_name');
```

### Scenario 2: Multi-Ebook Bundle

```javascript
function buyBundle(bundleEbookIds, referralCode) {
  // bundleEbookIds is an array like:
  // ['motorcycle-beginners-1', 'advanced-riding-2', 'investing-beginners-3']
  
  localStorage.setItem('purchasedEbookIds', bundleEbookIds.join(','));
  localStorage.setItem('referralCode', referralCode);
  
  // Open Razorpay
  openRazorpayWebstore();
}

// Usage:
buyBundle(
  ['motorcycle-beginners-1', 'advanced-riding-2'],
  'tarun'
);
```

### Scenario 3: From URL Referral Parameter

```javascript
function purchaseWithReferral() {
  // Get referral from URL: ?ref=influencer_name
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  
  const selectedEbookIds = ['solo-travel-4', 'kids-learning-5'];
  
  localStorage.setItem('purchasedEbookIds', selectedEbookIds.join(','));
  if (referralCode) {
    localStorage.setItem('referralCode', referralCode);
  }
  
  // Open Razorpay
  startCheckout();
}
```

---

## Integration with Your Store Page

If you have a store/homepage with ebook listings:

```tsx
// In HomePage.tsx or similar
import { useSearchParams } from 'react-router-dom';

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref'); // From URL ?ref=...
  
  function handleBuyClick(ebookId) {
    localStorage.setItem('purchasedEbookIds', ebookId);
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
    
    // Redirect to Razorpay Webstore
    window.location.href = 'https://your-razorpay-webstore-url';
  }
  
  return (
    <div>
      {/* Your ebook listings */}
      <button onClick={() => handleBuyClick('motorcycle-beginners-1')}>
        Buy Now
      </button>
    </div>
  );
}
```

---

## Data Flow Diagram

```
Customer browsing store
        ↓
Clicks "Buy Now" button
        ↓
handleBuyClick() stores in localStorage:
  - purchasedEbookIds: "ebook-id-1,ebook-id-2"
  - referralCode: "influencer_name"
        ↓
Redirects to Razorpay Webstore
        ↓
Customer completes payment
        ↓
Razorpay redirects to: https://guiderr.com/thank-you
        ↓
ThankYouPage retrieves from localStorage
        ↓
Displays purchased ebooks + download links
        ↓
Clears localStorage
```

---

## Testing Locally

### Test 1: Direct URL (simulating backend redirect)
```javascript
// In browser console:
localStorage.setItem('purchasedEbookIds', 'motorcycle-beginners-1,advanced-riding-2');
localStorage.setItem('referralCode', 'tarun');
window.location.href = '/thank-you';
```

### Test 2: URL query params (for testing)
```
http://localhost:5173/thank-you?ebooks=motorcycle-beginners-1,advanced-riding-2&ref=tarun
```

Both should show the same result!

---

## Edge Cases Handled

| Scenario | Result |
|----------|--------|
| Only ebook IDs, no ref | ✅ Shows ebooks, no referral message |
| With referral code | ✅ Shows "Bought via [ref]" |
| No localStorage, no URL params | ✅ Shows friendly "No ebooks" message |
| Invalid ebook ID | ✅ Silently skips invalid, shows valid ones |
| Multiple purchases on same browser | ✅ Last purchase data used |

---

## Storage Management

### Automatic Cleanup
- ThankYouPage automatically clears localStorage after displaying
- No manual cleanup needed

### Manual Cleanup (if needed)
```javascript
localStorage.removeItem('purchasedEbookIds');
localStorage.removeItem('referralCode');
```

---

## Browser Compatibility

✅ Works in all modern browsers (Chrome, Firefox, Safari, Edge)  
✅ localStorage available in all modern browsers  
✅ Graceful fallback if localStorage disabled (use URL params)  

---

## Summary

**Before Razorpay checkout:**
```javascript
localStorage.setItem('purchasedEbookIds', 'ebook-id-1,ebook-id-2');
localStorage.setItem('referralCode', 'influencer_code');
// Then redirect to Razorpay
```

**After payment:**
- Razorpay redirects to `/thank-you`
- ThankYouPage automatically retrieves from localStorage
- Shows downloads
- Clears storage

**That's it!** No backend needed. ✅
