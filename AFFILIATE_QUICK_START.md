# 🎯 Affiliate System - Quick Start Guide

## System Overview
Complete affiliate/partner management system with automatic tracking, analytics, and payout calculations.

---

## 🔗 URLs You Can Access Now

### Admin Access
- **Partner Management**: `https://yourdomain.com/admin/partners`
- **Analytics Dashboard**: `https://yourdomain.com/admin` → "Partners & Analytics" tab

### Partner Referral Links Format
```
https://yourdomain.com/?ref=[partner_code]
```
Example: `https://yourdomain.com/?ref=rahul20`

---

## ⚡ Quick Actions

### Add a New Partner (30 seconds)
1. Go to `/admin/partners`
2. Click "Add New Partner"
3. Enter: Name, Code, UPI ID, Commission %
4. Click "Add Partner"
5. ✅ Done! Share their referral link

### Check Weekly Payouts (1 minute)
1. Go to `/admin`
2. Click "Partners & Analytics" tab
3. See commission amounts + UPI IDs
4. Send payments on Sunday
5. ✅ Done!

### See Referral Performance (real-time)
1. Go to `/admin` → "Partners & Analytics"
2. View:
   - Total sales from referrals
   - Revenue generated
   - Commission owed per partner
3. ✅ Done!

---

## 💰 How Commissions Work

### Calculation
```
Commission = (Order Total × Partner's Rate) / 100
```

### Example
- Order Total: ₹2,000
- Partner Rate: 50%
- Commission: ₹1,000

### Payment Status
Only **completed** orders count toward commission (pending/failed orders excluded).

---

## 👤 Partner Workflow

### Step 1: You Add Partner
Create partner in `/admin/partners` with their details

### Step 2: Share Link
Give partner their referral URL: `?ref=[their_code]`

### Step 3: Customer Clicks
Customer visits your site with the referral link

### Step 4: Auto-Tracking
System stores referral code in their browser session

### Step 5: Customer Buys
Order is created with the partner's referral code

### Step 6: You Pay
Every Sunday, check analytics and send UPI payments

---

## 🎨 What Users See

### Nothing Changes for Customers!
- Normal shopping experience
- Referral tracking is invisible
- No pop-ups or notices
- Works seamlessly in background

### Referral Code Persists
- Stored in browser session
- Lasts until browser closes
- Survives page navigation
- Applied to all orders in session

---

## 📊 Analytics Features

### Summary Cards
- 📈 Total Referral Sales
- 💵 Total Revenue
- 🎯 Total Commission Owed

### Partner Breakdown Table
Each row shows:
- Partner name & code
- UPI ID for payments
- Sales count
- Revenue generated
- Commission rate & amount

### Special Indicators
- ⚠️ Unregistered codes (in orders but not in partners table)
- Total row with aggregated amounts
- Color-coded commission rates

---

## 🔍 Troubleshooting

### "Partner not showing in analytics"
- Make sure they have completed orders
- Check if orders have `payment_status = 'completed'`
- Verify referral code matches exactly

### "Seeing unregistered partner code"
- Someone used a referral code that doesn't exist in partners table
- Go to `/admin/partners` and add that partner
- Next refresh will show them properly

### "Commission calculation seems wrong"
- Verify partner's commission rate in partners table
- Check that you're looking at completed orders only
- Remember: amounts are in paise (divide by 100 for rupees)

---

## 🛡️ Security Notes

- Partner management requires admin password
- Same password as main `/admin` dashboard
- Stored securely in localStorage after login
- Use `VITE_ADMIN_PASSWORD` environment variable

---

## 📱 Mobile Support

All pages are fully responsive:
- ✅ Partner management on mobile
- ✅ Analytics dashboard on tablet
- ✅ Tables scroll horizontally on small screens

---

## 🚀 Next Steps (Optional Enhancements)

### Phase 2 Ideas
1. Email notifications to partners on sales
2. Partner-facing dashboard (no login required)
3. Payment history tracking (mark as paid)
4. Export analytics to CSV
5. Referral link generator tool
6. Performance graphs and charts

### Current Status
✅ All requested features implemented  
✅ Production-ready  
✅ Free tier compliant  
✅ No breaking changes  

---

## 💡 Pro Tips

### For Better Tracking
- Use unique, memorable codes (name + numbers)
- Keep a spreadsheet of partner codes and contact info
- Test each partner's link before sharing

### For Easier Payouts
- Set a recurring Sunday reminder
- Use UPI payment apps with notes feature
- Keep screenshots of payment confirmations

### For Scaling
- Start with 50% commission for all partners
- Adjust individual rates based on performance
- Consider tiered commissions in future

---

## 📞 Support

If you need to:
- Modify commission rates → Edit in `/admin/partners`
- Delete inactive partners → Click Delete button
- View historical data → Check Admin Dashboard
- Add new fields → Modify TypeScript interfaces in `src/types/partner.ts`

---

## ✅ System Health Check

Run these checks to verify everything works:

```bash
# 1. Test URL tracking
# Visit: /?ref=test123
# Check console for: "Referral code captured: test123"

# 2. Test partner CRUD
# Go to: /admin/partners
# Add, view, and delete a test partner

# 3. Test analytics
# Go to: /admin → Partners & Analytics tab
# Verify data displays correctly
```

---

## 🎉 You're All Set!

The affiliate system is ready to use. Start adding partners and tracking those referrals! 🚀

**Quick Links:**
- Partner Management: `/admin/partners`
- Analytics: `/admin` (Partners tab)
- Documentation: `AFFILIATE_SYSTEM_COMPLETE.md`
