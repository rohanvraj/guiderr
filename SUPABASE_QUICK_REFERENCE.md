# Guiderr Database Setup - Quick Reference

## 🚀 TL;DR - Get Started in 5 Minutes

### 1️⃣ Copy & Paste SQL into Supabase
```
File: supabase/migrations/20260119_guiderr_complete_schema.sql
→ Open Supabase dashboard
→ SQL Editor → New Query
→ Copy entire file
→ Run
```

### 2️⃣ Set Environment Variables
```bash
# .env file in project root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ Update supabase.ts with New Functions
Copy functions from SUPABASE_SETUP_COMPLETE.md → Step 3.2

### 4️⃣ Update CheckoutFlow
Add creator transaction tracking (see Step 3.3 in guide)

### 5️⃣ Test
```typescript
// In browser console:
import { getAllCreators } from './src/utils/supabase';
const creators = await getAllCreators();
console.log(creators); // Should show array
```

---

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **ebooks** | Product catalog | slug, title, price, downloadLink |
| **orders** | Customer orders | razorpay_order_id, buyer_email, creator_code |
| **order_items** | Items per order | order_id, product_id, price |
| **creators** | Influencers | code, name, commission_rate, total_revenue |
| **creator_transactions** | Revenue tracking | creator_id, order_id, commission_amount |
| **referral_tracking** | Referral metrics | creator_id, order_id, referral_code |

---

## 🔌 Key Functions to Add

### Creator Management
```typescript
getCreatorByCode(code: string)
getAllCreators()
createCreator(data)
getCreatorStats(code)
```

### Revenue Tracking
```typescript
getCreatorRevenue(creatorId)
getCreatorDashboard(code)
getRevenueSummary()
createCreatorTransaction(data)
```

### Ebook Management (Replaces JSON)
```typescript
getAllEbooks()
getEbookBySlug(slug)
createEbook(data)
updateEbook(slug, updates)
deleteEbook(slug)
```

---

## 🧪 Quick Tests

### Test 1: Can You Connect?
```typescript
import { supabase } from './src/utils/supabase';
const { data } = await supabase.from('ebooks').select('*');
console.log(data); // Should return array
```

### Test 2: Do Creators Exist?
```typescript
import { getAllCreators } from './src/utils/supabase';
const creators = await getAllCreators();
console.log(creators); // Should show 3 sample creators
```

### Test 3: Can You Query Orders?
```typescript
import { getAllOrders } from './src/utils/supabase';
const orders = await getAllOrders();
console.log(orders); // Should return orders array
```

---

## 📋 SQL Schema at a Glance

```sql
ebooks
├─ id (UUID, PK)
├─ slug (TEXT, UNIQUE) ← Use for product_id
├─ title, author, category
├─ price, downloadLink
├─ cover_image, synopsis, featured
└─ created_at, updated_at

creators
├─ id (UUID, PK)
├─ name, code (UNIQUE)
├─ commission_rate (default 10%)
├─ total_revenue, total_orders
├─ status, email
└─ created_at, updated_at

orders
├─ id (UUID, PK)
├─ razorpay_order_id (UNIQUE)
├─ buyer_name, buyer_email
├─ total_amount
├─ creator_code (FK to creators.code)
├─ payment_status, delivery_status
├─ razorpay_payment_id
└─ created_at, updated_at

order_items
├─ id (UUID, PK)
├─ order_id (FK)
├─ product_id (→ ebooks.slug)
├─ product_title, price
├─ delivery_link_sent
└─ created_at

creator_transactions
├─ id (UUID, PK)
├─ creator_id (FK)
├─ order_id (FK)
├─ order_amount, commission_rate
├─ commission_amount
├─ status
└─ created_at, updated_at
```

---

## 🔐 Security - RLS Policies

| Table | Public | Auth | Admin |
|-------|--------|------|-------|
| ebooks | ✅ SELECT | - | ✅ CRUD |
| orders | - | ✅ SELECT/INSERT | ✅ CRUD |
| creators | ✅ SELECT | - | ✅ CRUD |
| transactions | - | ✅ SELECT/INSERT | ✅ CRUD |

All tables have RLS enabled. Customize policies based on your auth setup.

---

## 💾 Typical Flow

```
1. Customer adds ebook to cart
2. Enters email & name
3. Clicks "Pay Now"
4. Payment processed by Razorpay
5. Order created in DB
   └─ If referral code provided:
      └─ Creator transaction created
      └─ Commission calculated
6. Thank you page shows downloads
7. Admin can see order + creator revenue
```

---

## 🛠️ Common Tasks

### Add a New Creator
```typescript
import { createCreator } from './src/utils/supabase';

await createCreator({
  name: 'New Influencer',
  code: 'newinfluencer',
  email: 'new@example.com',
  commission_rate: 15,
});
```

### Get Creator's Total Revenue
```typescript
import { getCreatorStats } from './src/utils/supabase';

const stats = await getCreatorStats('sarah');
console.log(stats.totalCommission); // ₹10,500
console.log(stats.totalOrders); // 42
```

### List All Orders with Creator Info
```typescript
import { getOrdersWithCreators } from './src/utils/supabase';

const orders = await getOrdersWithCreators();
// Each order includes creator details
```

### Calculate Revenue per Creator (Dashboard)
```typescript
import { getRevenueSummary } from './src/utils/supabase';

const summary = await getRevenueSummary();
// Returns: { creator_code: { name, totalCommission, orderCount, ... } }
```

---

## 📂 Files to Update

| File | Changes |
|------|---------|
| `.env` | Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY |
| `src/utils/supabase.ts` | Add creator functions (Step 3.2) |
| `src/components/CheckoutFlow.tsx` | Track creator (Step 3.3) |
| `src/pages/AdminDashboard.tsx` | Add creators tab |
| `src/components/admin/CreatorDashboard.tsx` | New component |

---

## ⚠️ Important Notes

### During Setup
- [ ] SQL migration ran successfully
- [ ] All tables created (check Supabase UI)
- [ ] Sample data inserted (3 creators)
- [ ] RLS policies applied

### Before Production
- [ ] Test full checkout flow
- [ ] Verify order creation in Supabase
- [ ] Check creator transaction tracking
- [ ] Test admin dashboard
- [ ] Verify revenue calculations

### Database Limits
- Free tier: 500 MB storage
- 2 simultaneous connections
- No auto-backup (manual backups available)
- Perfect for MVP

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "VITE_SUPABASE_URL undefined" | Check .env file, restart dev server |
| "Permission denied" errors | Disable RLS temporarily or adjust policies |
| "Creator not found" | Manually add creators via Supabase UI |
| Orders not saving | Check network tab, verify URL/key correct |
| Migration failed | Check SQL syntax, try running in Supabase UI directly |

---

## 📊 Queries Reference

```typescript
// Get creator's revenue
SELECT SUM(commission_amount) FROM creator_transactions 
WHERE creator_id = 'uuid' AND status = 'completed';

// Top 5 creators by revenue
SELECT name, SUM(ct.commission_amount) as total_revenue
FROM creators c
JOIN creator_transactions ct ON c.id = ct.creator_id
GROUP BY c.id
ORDER BY total_revenue DESC
LIMIT 5;

// Orders today
SELECT COUNT(*), SUM(total_amount)
FROM orders
WHERE DATE(created_at) = TODAY();

// Creator performance
SELECT 
  c.name,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_volume,
  SUM(ct.commission_amount) as commission
FROM creators c
LEFT JOIN orders o ON c.code = o.creator_code
LEFT JOIN creator_transactions ct ON c.id = ct.creator_id
GROUP BY c.id;
```

---

## ✅ Verification Checklist

```
Setup:
□ SQL migration executed
□ Tables created in Supabase
□ Sample data visible
□ Environment variables set
□ supabase.ts functions added

Integration:
□ Ebooks load from Supabase
□ Orders save to Supabase
□ Creator tracking works
□ Commission calculated
□ Revenue summary displays

Testing:
□ Test payment completes
□ Order in database
□ Creator transaction created
□ Admin dashboard works
□ Revenue numbers correct

Production Ready:
□ No console errors
□ All tests pass
□ Database working
□ Policies configured
□ Ready to deploy
```

---

## 📞 Need Help?

1. **SQL Migration Failed?**
   → Try running in Supabase UI directly
   → Check for syntax errors

2. **Can't Connect to Supabase?**
   → Verify VITE_SUPABASE_URL is correct
   → Check VITE_SUPABASE_ANON_KEY
   → Restart dev server

3. **Queries Not Working?**
   → Check RLS policies
   → Test directly in Supabase SQL editor
   → Check auth token permissions

4. **Revenue Not Calculating?**
   → Verify creator exists
   → Check commission_rate > 0
   → Verify order and creator_transaction created

---

**Status:** 🟢 Ready to Deploy  
**Version:** 1.0  
**Date:** January 19, 2026
