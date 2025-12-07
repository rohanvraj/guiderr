# Razorpay Integration Setup Guide

## Overview

Guiderr now uses Razorpay for payment processing with manual digital product delivery. This ensures GST-free compliance while maintaining a professional payment experience.

## Features

- ✅ Razorpay Checkout integration (UPI, Cards, Wallets)
- ✅ Client-side cart with localStorage persistence
- ✅ Sequential payment processing for multiple items
- ✅ Referral tracking with commission metadata
- ✅ Manual order management dashboard
- ✅ Email notification system (optional)
- ✅ Brand-consistent Thank You page
- ✅ Mobile-first checkout experience

## Prerequisites

1. **Razorpay Account**
   - Create an account at https://razorpay.com
   - Choose "Individual / Sole Proprietor" account type
   - Complete KYC verification
   - Get your API Key ID from Razorpay Dashboard → Settings → API Keys

2. **Supabase Database**
   - Already configured with orders, order_items, and referral_tracking tables
   - RLS policies enabled for security

3. **Optional: Email Notifications**
   - Resend account (https://resend.com) for email delivery
   - Admin email configuration

## Setup Steps

### 1. Configure Razorpay Key

Update `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID_HERE
```

Replace `YOUR_KEY_ID_HERE` with your actual Razorpay Live Key ID from dashboard.

### 2. Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id

# Optional (for email notifications)
ADMIN_EMAIL=admin@guiderr.com
RESEND_API_KEY=your-resend-api-key
```

### 3. Razorpay Webhook Configuration (Optional)

For automatic payment confirmation via webhooks:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/razorpay-webhook`
3. Select events: `payment.authorized`, `payment.failed`
4. Use your Webhook Secret in backend verification

**Note:** Current implementation uses client-side payment confirmation. Webhooks are optional but recommended for production.

## Usage

### For Customers

1. Browse categories and products
2. Click "Add to Cart" or "Buy Now"
3. Multiple products can be added to cart
4. Click "Proceed to Checkout"
5. Enter name and email
6. Complete Razorpay payment (UPI/Card/Wallet)
7. Receive order confirmation on Thank You page
8. Product delivered via email within 2-4 hours

### For Admin

**Access Admin Dashboard:**
- URL: `/admin`
- Default password: `guiderr123` (⚠️ Change in production)

**Admin Actions:**
1. View all orders with payment status
2. See purchased products and referral information
3. Copy buyer email
4. Send delivery email directly
5. Mark orders as delivered

**Manual Delivery Workflow:**
1. Admin receives order notification
2. Log in to admin dashboard
3. Find the order
4. Click "Send Email" (opens email client pre-filled)
5. Attach digital product
6. Click "Mark Delivered" after sending

## Database Schema

### orders table
```sql
- id (uuid): Unique order ID
- razorpay_order_id (text): Razorpay order reference
- buyer_email (text): Customer email
- buyer_name (text): Customer name
- total_amount (integer): Amount in paise
- referral_code (text): Influencer code if applicable
- payment_status: 'pending' | 'completed' | 'failed'
- delivery_status: 'pending' | 'delivered'
- razorpay_payment_id (text): Razorpay payment ID
```

### order_items table
```sql
- id (uuid): Unique item ID
- order_id (uuid): Foreign key to orders
- product_id (text): Product identifier
- product_title (text): Product name
- price (integer): Price in paise
- delivery_link_sent (boolean): Delivery status
```

### referral_tracking table
```sql
- id (uuid): Unique tracking ID
- order_id (uuid): Foreign key to orders
- referral_code (text): Influencer code
- commission_amount (integer): Commission in paise
- status: 'pending' | 'approved' | 'paid'
```

## Referral System

### How It Works

1. Influencer shares link with `?ref=INFLUENCER_CODE`
   - Example: `https://guiderr.com/motorcycles?ref=rahul`

2. Referral code persists through cart and checkout
   - Stored in CartItem metadata

3. On payment:
   - Referral code added to order as metadata
   - Commission calculated (10% of product price)
   - Tracked in referral_tracking table

4. Admin dashboard shows referral source for each order

### Adding New Influencers

Update `/src/data/products.ts`:

```ts
influencerLinks: {
  newInfluencer: 'https://imojo.in/product-id-newInfluencer',
  // ... other influencers
}
```

Then share: `https://guiderr.com/category?ref=newInfluencer`

## Payment Flow

```
User → Add to Cart → Proceed to Checkout
  ↓
Enter Email/Name
  ↓
Razorpay Checkout Modal
  ↓
Payment Success → Create Order in Supabase
  ↓
Store Order Items & Referral Data
  ↓
Thank You Page with Email Delivery Instructions
  ↓
Admin Notified → Manual Delivery via Email
  ↓
Admin Marks as Delivered
```

## Security Considerations

1. **API Keys:**
   - Keep Razorpay Key ID in environment variables
   - Never commit to version control
   - Use different keys for test/live environments

2. **Admin Dashboard:**
   - Change default password in production
   - Implement proper authentication (future)
   - Use HTTPS only

3. **Data Protection:**
   - RLS policies restrict direct database access
   - Email addresses only visible to admin
   - Payment IDs securely stored

4. **Payment Security:**
   - Razorpay handles all PCI compliance
   - Card details never touch your server
   - Razorpay script loaded from official CDN

## Customization

### Change Admin Password

Edit `/src/pages/AdminDashboard.tsx`:

```ts
const ADMIN_PASSWORD = 'your-new-password';
```

### Customize Commission Rate

Edit `/src/utils/razorpay.ts`:

```ts
export function getCommissionAmount(price: number, referralCode?: string): number {
  if (!referralCode) return 0;
  return Math.round(price * 0.15); // 15% commission
}
```

### Add Email Notifications

1. Sign up at https://resend.com
2. Get API key from Resend Dashboard
3. Set `RESEND_API_KEY` environment variable
4. Edge Function will automatically send notifications

## Troubleshooting

### Razorpay Script Not Loading
- Check browser console for CSP errors
- Verify VITE_RAZORPAY_KEY_ID is set correctly
- Clear browser cache

### Orders Not Appearing in Admin Dashboard
- Check Supabase RLS policies
- Verify orders table has correct entries
- Check browser dev tools for errors

### Email Notifications Not Sending
- Verify RESEND_API_KEY is set
- Check Edge Function logs in Supabase
- Confirm admin email is correct

### Payment Fails Silently
- Check Razorpay script loaded (Network tab)
- Verify Order ID is unique
- Check browser console for JavaScript errors

## Future Enhancements

1. **Automatic Delivery:**
   - Generate unique download links
   - Email with automatic link/password
   - Reduce manual admin work

2. **Subscription Model:**
   - Monthly membership for digital products
   - One-time purchases + recurring access
   - User login portal

3. **Advanced Analytics:**
   - Sales dashboard
   - Referral commission tracking
   - Product performance metrics

4. **GST Compliance Upgrade:**
   - HSN code classification
   - GST invoice generation
   - B2B/B2C differentiation

## Support

For issues:
1. Check this documentation
2. Review browser console for errors
3. Check Supabase dashboard for data
4. Contact: support@guiderr.com

## License

Part of Guiderr digital products platform.
