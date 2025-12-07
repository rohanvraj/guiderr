# Razorpay Integration - Quick Start Guide

## 🎯 What's New

Your Guiderr platform now has:
- ✅ **Razorpay Payments** - UPI, Cards, Wallets
- ✅ **Admin Dashboard** - Manage orders & deliveries
- ✅ **Referral Tracking** - Track influencer commissions
- ✅ **Manual Delivery** - GST-free compliance
- ✅ **Order Management** - Email notifications
- ✅ **Mobile Checkout** - Fully responsive

## 🚀 Getting Started (5 Minutes)

### Step 1: Get Your Razorpay Key
1. Go to https://razorpay.com
2. Sign up as "Individual / Sole Proprietor"
3. Complete KYC verification
4. Get API Key ID from Dashboard → Settings → API Keys

### Step 2: Update Environment
Edit `.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_HERE
```

### Step 3: Test Locally
```bash
npm run dev
# Visit http://localhost:5173
```

### Step 4: Test Checkout
1. Browse to a category (e.g., `/motorcycles`)
2. Click "Add to Cart"
3. Click cart icon → "Proceed to Checkout"
4. Enter name & email
5. Click "Pay Now with Razorpay"
6. Use Razorpay test card: 4111111111111111, any future date, any CVV

### Step 5: Check Admin Dashboard
1. Visit `/admin`
2. Password: `guiderr123` (change in production!)
3. See your test order
4. Click "Mark Delivered" to complete

## 📋 User Journey

### Customer Flow
```
Browse Products
    ↓
Add to Cart (with referral code: ?ref=influencer)
    ↓
Cart Sidebar → Proceed to Checkout
    ↓
Enter Email & Name
    ↓
Razorpay Payment Modal
    ↓
Thank You Page (delivery instructions)
    ↓
Check Email (product comes in 2-4 hours)
```

### Admin Flow
```
Customer makes purchase
    ↓
Admin receives notification
    ↓
Log in to /admin
    ↓
Find order in list
    ↓
Click "Send Email" to deliver product
    ↓
Click "Mark Delivered"
```

## 🔑 Important Passwords & Keys

| Item | Location | Default | Action |
|------|----------|---------|--------|
| Admin Password | `/admin` | `guiderr123` | Change in production |
| Razorpay Key | `.env` | Not set | Add your live key |
| Resend Key (optional) | `.env` | Not set | Add for auto emails |

## 🎯 Referral System

### Share Influencer Links
Send to your influencers:
```
https://yoursite.com/motorcycles?ref=rahul
https://yoursite.com/finance?ref=priya
https://yoursite.com/travel?ref=aditya
```

### Track Commissions
1. Admin Dashboard → View order
2. See "Referred by: influencer_name"
3. Commission calculated (10% of price)
4. Commission amount shown in order details

### Add New Influencers
Edit `src/data/products.ts`:
```ts
influencerLinks: {
  newInfluencer: 'https://link-to-their-product',
  rahul: 'https://...', // existing
}
```

## 📧 Email Setup (Optional)

For automatic email notifications:

1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY=re_your_key_here
   ```

Without Resend, admin manually sends emails to buyers.

## 🛠️ Admin Dashboard Features

**URL:** `/admin`

| Feature | Usage |
|---------|-------|
| Order List | See all payments with status |
| Copy Email | Quickly get buyer email |
| Send Email | Pre-fill email client with order details |
| Mark Delivered | Confirm product sent |
| View Details | See products, prices, referral info |

## 🔒 Security

1. **Admin Password** - Change from `guiderr123` to secure password
2. **API Keys** - Keep in `.env`, never commit to git
3. **Razorpay** - Handles all card security (PCI compliant)
4. **Database** - RLS policies protect data

## 📱 Test Cases

### ✓ Single Product Purchase
1. Add one product to cart
2. Checkout → Pay → Thank You page

### ✓ Multiple Products
1. Add 3 products from different categories
2. Checkout → Sequential Razorpay modals
3. Each product charged separately
4. One combined order

### ✓ Referral Tracking
1. Visit `/motorcycles?ref=rahul`
2. Add product to cart
3. Checkout and pay
4. Admin dashboard shows referral code

### ✓ Mobile Experience
1. Open on phone
2. Browse, add to cart
3. Checkout responsive
4. Razorpay works on mobile

## 🐛 Troubleshooting

### "Razorpay is undefined"
- Check VITE_RAZORPAY_KEY_ID in .env
- Ensure key is set before starting dev server
- Clear browser cache

### Orders not appearing in admin
- Verify Supabase connection
- Check browser console for errors
- Make sure payment was successful

### Can't log into admin
- Default password is `guiderr123`
- Check if you changed it
- Can't recover - change in code if needed

### Emails not sending
- Resend API key not configured (optional feature)
- Emails work via manual admin send anyway
- Set up Resend key for automation

## 🌍 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel
# Select Vite project
# Set VITE_RAZORPAY_KEY_ID environment variable
```

### Deploy to Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
# Set env vars in Dashboard → Build & Deploy → Environment
```

## 📊 Dashboard Metrics

From admin dashboard, you can see:
- Total orders
- Payment status
- Buyer details
- Products purchased
- Referral sources
- Delivery status

Perfect for tracking:
- Sales per product
- Referral performance
- Delivery rates
- Customer email addresses

## 🎓 Next Steps

1. **Get Razorpay Key** - Most important!
2. **Test Payment Flow** - Try a purchase
3. **Customize Admin Password** - Update in code
4. **Setup Email** (optional) - Connect Resend
5. **Deploy to Production** - Your live site

## 📞 Support

For help:
1. Check documentation files (RAZORPAY_SETUP.md, IMPLEMENTATION_SUMMARY.md)
2. Review browser console for errors
3. Check Supabase dashboard
4. Contact: support@guiderr.com

---

**Ready to accept payments!** 🎉

Get your Razorpay key and you're good to go.
