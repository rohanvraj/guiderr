# Guiderr Database Setup - Complete Guide

## 🚀 Overview

This guide walks you through setting up the complete Guiderr database backend with Supabase, including ebooks, orders, creators/influencers, and revenue tracking.

**What You'll Set Up:**
- ✅ Supabase SQL schema (6 tables with relationships)
- ✅ Environment variables (.env and Netlify)
- ✅ Frontend integration (replace JSON storage with Supabase)
- ✅ Revenue tracking queries
- ✅ Creator management features

**Time Required:** 20-30 minutes

---

## 📋 Prerequisites

Before you start, ensure you have:
- [ ] Supabase project created (free tier is fine)
- [ ] Supabase URL and Anon Key ready
- [ ] Your Guiderr project open
- [ ] Git access (for committing changes)

**Get Your Supabase Credentials:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon (public)` → `VITE_SUPABASE_ANON_KEY`

---

## ✅ Step 1: Run the SQL Migration in Supabase

### 1.1 Access Supabase SQL Editor

```
1. Login to Supabase dashboard
2. Select your project
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
```

### 1.2 Copy and Paste the Migration

**File to copy from:**
```
supabase/migrations/20260119_guiderr_complete_schema.sql
```

**What this SQL creates:**
- `ebooks` - All ebook metadata
- `orders` - Customer orders with creator references
- `order_items` - Individual items in each order
- `creators` - Influencer/creator profiles with commission tracking
- `creator_transactions` - Revenue split per order
- `referral_tracking` - Detailed referral metrics

### 1.3 Execute the Query

```sql
-- Copy entire contents of 20260119_guiderr_complete_schema.sql
-- Paste into Supabase SQL Editor
-- Click "Run" button
-- Wait for "Success" confirmation
```

**Expected Result:**
```
✓ Created table "ebooks"
✓ Created table "creators"
✓ Created table "orders"
✓ Created table "order_items"
✓ Created table "creator_transactions"
✓ Created table "referral_tracking"
✓ Created indexes
✓ Enabled RLS (Row Level Security)
✓ Created policies
✓ Inserted sample data
```

---

## 🔐 Step 2: Set Up Environment Variables

### 2.1 Local Development (.env)

Create/update `.env` file in project root:

```bash
# Supabase Connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_here
VITE_ADMIN_PASSWORD=your-secure-password

# App URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

**⚠️ Important:**
- Never commit `.env` to git (should be in `.gitignore`)
- Use different keys for development vs production
- Keep Anon Key safe (it's public-facing, but scoped with RLS)

### 2.2 Netlify Environment Variables

For production deployment:

```
1. Go to Netlify dashboard
2. Select your Guiderr site
3. Go to Site Settings → Build & Deploy → Environment
4. Click "Edit variables"
5. Add:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_RAZORPAY_KEY_ID=rzp_live_key
   VITE_ADMIN_PASSWORD=password
```

**Then trigger a rebuild:**
```
1. Go to Deploys
2. Click "Trigger deploy"
3. Select "Deploy site"
4. Wait for build to complete
```

### 2.3 Verify Variables Are Loaded

In your Guiderr app, check that imports work:

```typescript
// This should NOT be undefined
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

---

## 🔄 Step 3: Update Frontend to Use Supabase

### 3.1 Existing Files Already Using Supabase

Good news! Your frontend already has Supabase integration:

- ✅ `src/utils/supabase.ts` - Client initialization
- ✅ `src/components/CheckoutFlow.tsx` - Uses `createOrder()`, `addOrderItems()`
- ✅ `src/pages/AdminDashboard.tsx` - Uses `getAllOrders()`, etc.
- ✅ `src/pages/ThankYouPage.tsx` - Uses `getOrderByRazorpayId()`, `getOrderItems()`

### 3.2 Add Creator/Influencer Functions

Add these new functions to `src/utils/supabase.ts`:

```typescript
// ============================================================================
// CREATOR MANAGEMENT
// ============================================================================

export async function getCreatorByCode(code: string) {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) throw error;
  return data as Creator | null;
}

export async function getAllCreators() {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('total_revenue', { ascending: false });

  if (error) throw error;
  return data as Creator[];
}

export async function createCreator(creatorData: {
  name: string;
  code: string;
  email?: string;
  commission_rate?: number;
}) {
  const { data, error } = await supabase
    .from('creators')
    .insert([creatorData])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Creator;
}

// ============================================================================
// CREATOR REVENUE TRACKING
// ============================================================================

export async function getCreatorRevenue(creatorId: string) {
  const { data, error } = await supabase
    .from('creator_transactions')
    .select('*')
    .eq('creator_id', creatorId);

  if (error) throw error;
  return data;
}

export async function getCreatorStats(creatorCode: string) {
  const creator = await getCreatorByCode(creatorCode);
  if (!creator) throw new Error('Creator not found');

  const { data: transactions, error } = await supabase
    .from('creator_transactions')
    .select('*')
    .eq('creator_id', creator.id);

  if (error) throw error;

  const totalCommission = transactions
    .reduce((sum, t) => sum + (t.commission_amount || 0), 0);

  return {
    creator,
    totalOrders: transactions.length,
    totalCommission,
    transactions,
  };
}

export async function createCreatorTransaction(transactionData: {
  creator_id: string;
  order_id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('creator_transactions')
    .insert([transactionData])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ============================================================================
// EBOOK MANAGEMENT (Replace JSON with Database)
// ============================================================================

export async function getAllEbooks() {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  return data as Ebook[];
}

export async function getEbookBySlug(slug: string) {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as Ebook | null;
}

export async function createEbook(ebookData: Ebook) {
  const { data, error } = await supabase
    .from('ebooks')
    .insert([ebookData])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Ebook;
}

export async function updateEbook(slug: string, updates: Partial<Ebook>) {
  const { data, error } = await supabase
    .from('ebooks')
    .update(updates)
    .eq('slug', slug)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Ebook;
}

export async function deleteEbook(slug: string) {
  const { error } = await supabase
    .from('ebooks')
    .delete()
    .eq('slug', slug);

  if (error) throw error;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Creator {
  id: string;
  name: string;
  code: string;
  email?: string;
  commission_rate: number;
  total_revenue: number;
  total_orders: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Ebook {
  id: string;
  slug: string;
  title: string;
  author: string;
  category?: string;
  price: number;
  downloadLink: string;
  cover_image?: string;
  synopsis?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorTransaction {
  id: string;
  creator_id: string;
  order_id: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### 3.3 Update CheckoutFlow to Track Creator

Modify `src/components/CheckoutFlow.tsx` payment handler:

```typescript
const handler: (response: any) => void = async (response) => {
  try {
    if (!response || !response.razorpay_payment_id) {
      console.error('Invalid payment response from Razorpay:', response);
      setError('Payment failed: no payment confirmation received.');
      return;
    }

    // Update order payment
    await updateOrderPayment(orderResponse.id, {
      razorpay_payment_id: response.razorpay_payment_id,
      payment_status: 'completed',
    });

    // 🆕 Create creator transaction if referral exists
    if (referralCode) {
      const creator = await getCreatorByCode(referralCode);
      if (creator) {
        const commissionAmount = Math.round(totalAmount * (creator.commission_rate / 100) * 100) / 100;
        
        await createCreatorTransaction({
          creator_id: creator.id,
          order_id: orderResponse.id,
          order_amount: totalAmount,
          commission_rate: creator.commission_rate,
          commission_amount: commissionAmount,
          status: 'pending',
        });
      }
    }

    clearCart();
    navigate(`/thank-you?order_id=${razorpayOrderId}`);
  } catch (err) {
    console.error('Failed to update payment:', err);
    setError('Payment recorded but failed to update. Please contact support.');
  }
};
```

---

## 📊 Step 4: Revenue Tracking Queries

### 4.1 Query: Total Revenue Per Creator

```typescript
export async function getCreatorDashboard(creatorCode: string) {
  // Get creator details
  const creator = await getCreatorByCode(creatorCode);
  if (!creator) throw new Error('Creator not found');

  // Get all transactions for this creator
  const { data: transactions, error } = await supabase
    .from('creator_transactions')
    .select('*, orders(*)')
    .eq('creator_id', creator.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const stats = {
    creator,
    totalOrders: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + t.commission_amount, 0),
    avgOrderValue: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.order_amount, 0) / transactions.length
      : 0,
    transactions,
  };

  return stats;
}
```

### 4.2 Query: All Orders with Creator Info

```typescript
export async function getOrdersWithCreators() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      creators(name, code, commission_rate),
      order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### 4.3 Query: Revenue Summary Dashboard

```typescript
export async function getRevenueSummary() {
  // All completed transactions
  const { data: transactions, error } = await supabase
    .from('creator_transactions')
    .select('*, creators(name, code)')
    .eq('status', 'completed');

  if (error) throw error;

  // Group by creator
  const summary = transactions.reduce((acc, trans) => {
    const code = trans.creators.code;
    if (!acc[code]) {
      acc[code] = {
        name: trans.creators.name,
        totalCommission: 0,
        orderCount: 0,
        transactions: [],
      };
    }
    acc[code].totalCommission += trans.commission_amount;
    acc[code].orderCount += 1;
    acc[code].transactions.push(trans);
    return acc;
  }, {});

  return summary;
}
```

### 4.4 Query: Top Performing Creators

```typescript
export async function getTopCreators(limit = 10) {
  const { data, error } = await supabase
    .from('creators')
    .select('*, creator_transactions(*)')
    .order('total_revenue', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

---

## 🔌 Step 5: Update Admin Dashboard for Creator Management

### 5.1 Add Creator Panel to AdminDashboard

Update `src/pages/AdminDashboard.tsx`:

```typescript
import { getAllCreators, createCreator, getRevenueSummary } from '../utils/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'ebooks' | 'creators'>('orders');
  const [creators, setCreators] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({});

  useEffect(() => {
    if (activeTab === 'creators') {
      fetchCreatorsData();
    }
  }, [activeTab]);

  const fetchCreatorsData = async () => {
    try {
      const [creatorsData, revenue] = await Promise.all([
        getAllCreators(),
        getRevenueSummary(),
      ]);
      setCreators(creatorsData);
      setRevenueSummary(revenue);
    } catch (err) {
      console.error('Failed to fetch creators:', err);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 ${activeTab === 'orders' ? 'bg-slate-900' : 'bg-slate-600'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('ebooks')}
          className={`px-4 py-2 ${activeTab === 'ebooks' ? 'bg-slate-900' : 'bg-slate-600'}`}
        >
          Ebooks
        </button>
        <button 
          onClick={() => setActiveTab('creators')}
          className={`px-4 py-2 ${activeTab === 'creators' ? 'bg-slate-900' : 'bg-slate-600'}`}
        >
          Creators
        </button>
      </div>

      {activeTab === 'orders' && <OrdersPanel />}
      {activeTab === 'ebooks' && <EbookManager />}
      {activeTab === 'creators' && (
        <CreatorDashboard creators={creators} revenueSummary={revenueSummary} />
      )}
    </div>
  );
}
```

### 5.2 Create CreatorDashboard Component

Create `src/components/admin/CreatorDashboard.tsx`:

```typescript
import { useState } from 'react';
import { createCreator } from '../../utils/supabase';

export default function CreatorDashboard({ creators, revenueSummary }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    commission_rate: 10,
  });

  const handleAddCreator = async () => {
    try {
      await createCreator(formData);
      setFormData({ name: '', code: '', email: '', commission_rate: 10 });
      setShowForm(false);
      // Refresh creators list
    } catch (err) {
      console.error('Failed to create creator:', err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          {showForm ? 'Cancel' : 'Add Creator'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-slate-50 rounded-lg mb-6">
          <input
            type="text"
            placeholder="Creator Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border mb-3"
          />
          <input
            type="text"
            placeholder="Unique Code (e.g., sarah)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border mb-3"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border mb-3"
          />
          <input
            type="number"
            placeholder="Commission Rate (%)"
            value={formData.commission_rate}
            onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
            className="w-full px-3 py-2 border mb-3"
          />
          <button
            onClick={handleAddCreator}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg"
          >
            Create Creator
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {creators.map((creator) => (
          <div key={creator.id} className="p-4 bg-white border rounded-lg">
            <h3 className="font-bold">{creator.name}</h3>
            <p className="text-sm text-slate-600">@{creator.code}</p>
            <p className="text-sm mt-2">Commission: {creator.commission_rate}%</p>
            <p className="text-lg font-bold text-green-600 mt-3">
              ₹{creator.total_revenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500">{creator.total_orders} orders</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Revenue Summary</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left">Creator</th>
              <th className="p-3 text-right">Orders</th>
              <th className="p-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(revenueSummary).map(([code, data]) => (
              <tr key={code} className="border-t">
                <td className="p-3">{data.name} (@{code})</td>
                <td className="p-3 text-right">{data.orderCount}</td>
                <td className="p-3 text-right font-bold">
                  ₹{data.totalCommission.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🔄 Step 6: Migrate from JSON to Supabase

### 6.1 Bulk Import Ebooks

If you want to import existing ebooks from `ebooks.json`:

```typescript
import ebooksData from '../data/ebooks.json';
import { createEbook } from '../utils/supabase';

export async function migrateEbooksToSupabase() {
  for (const ebook of ebooksData.ebooks) {
    try {
      await createEbook({
        slug: ebook.id, // Use existing ID as slug
        title: ebook.title,
        author: ebook.author,
        price: ebook.price,
        downloadLink: ebook.downloadLink,
        featured: true,
      });
      console.log(`✓ Migrated: ${ebook.title}`);
    } catch (err) {
      console.error(`✗ Failed to migrate ${ebook.title}:`, err);
    }
  }
}
```

Run in browser console:
```typescript
import { migrateEbooksToSupabase } from './utils/migration';
await migrateEbooksToSupabase();
```

### 6.2 Update Products Component

Replace JSON imports with Supabase:

```typescript
// Before:
import ebooksData from '../data/ebooks.json';
const ebooks = ebooksData.ebooks;

// After:
import { getAllEbooks } from '../utils/supabase';

useEffect(() => {
  const fetchEbooks = async () => {
    const ebooks = await getAllEbooks();
    setEbooks(ebooks);
  };
  fetchEbooks();
}, []);
```

---

## ✅ Step 7: Verify Everything Works

### 7.1 Test Supabase Connection

In your app console, run:

```typescript
// Test 1: Can you read ebooks?
import { getAllEbooks } from './src/utils/supabase';
const ebooks = await getAllEbooks();
console.log('Ebooks:', ebooks); // Should show array of ebooks

// Test 2: Can you read creators?
import { getAllCreators } from './src/utils/supabase';
const creators = await getAllCreators();
console.log('Creators:', creators); // Should show array of creators

// Test 3: Can you fetch by code?
import { getCreatorByCode } from './src/utils/supabase';
const creator = await getCreatorByCode('sarah');
console.log('Creator:', creator); // Should show Sarah's data
```

### 7.2 Test Full Checkout Flow

```
1. Add an ebook to cart
2. Click "Buy Now"
3. Complete payment with test card
4. Go to Supabase dashboard → orders table
5. Verify:
   ✓ New order appears
   ✓ order_items populated
   ✓ creator_code stored (if using referral)
   ✓ creator_transactions created (if applicable)
```

### 7.3 Check Admin Dashboard

```
1. Login to admin (/admin)
2. Click "Creators" tab
3. Verify you can:
   ✓ See all creators
   ✓ Add new creator
   ✓ View revenue per creator
   ✓ See revenue summary table
```

---

## 🐛 Troubleshooting

### Issue: "VITE_SUPABASE_URL is undefined"
**Solution:** Check `.env` file exists and has correct keys. Restart dev server (`npm run dev`).

### Issue: "Permission denied" on queries
**Solution:** Check RLS policies in Supabase:
1. Go to Authentication → Policies
2. Verify policies allow your operations
3. Or temporarily disable RLS for development (not recommended for production)

### Issue: "Creator not found" errors
**Solution:** Make sure creators exist in Supabase. Check:
1. Supabase → Table Editor → creators
2. Sample data was inserted during migration
3. Or manually add creators via Supabase UI

### Issue: Orders not saving to Supabase
**Solution:** Check:
1. Is Supabase URL correct? (`import.meta.env.VITE_SUPABASE_URL`)
2. Are environment variables loaded? Check Network tab in DevTools
3. Are RLS policies enabled? Might need to adjust policies

---

## 📚 Database Schema Reference

### ebooks table
```
id (UUID, Primary Key)
slug (TEXT, Unique) - Use as product_id reference
title (TEXT)
author (TEXT)
category (TEXT) - e.g., "motorcycles", "business"
price (DECIMAL) - In base currency units
downloadLink (TEXT) - Google Drive, S3, etc.
cover_image (TEXT) - URL to cover image
synopsis (TEXT) - Description
featured (BOOLEAN) - Show on homepage
created_at, updated_at (TIMESTAMP)
```

### orders table
```
id (UUID, Primary Key)
razorpay_order_id (TEXT, Unique) - From Razorpay
buyer_name (TEXT)
buyer_email (TEXT)
total_amount (DECIMAL) - In paise (multiply by 100)
creator_code (TEXT, Foreign Key to creators.code)
payment_status (TEXT) - "pending", "completed", "failed"
delivery_status (TEXT) - "pending", "delivered"
razorpay_payment_id (TEXT) - From Razorpay
notes (TEXT) - Optional notes
created_at, updated_at (TIMESTAMP)
```

### order_items table
```
id (UUID, Primary Key)
order_id (UUID, Foreign Key to orders.id)
product_id (TEXT) - Matches ebooks.slug
product_title (TEXT)
price (DECIMAL)
delivery_link_sent (BOOLEAN)
created_at (TIMESTAMP)
```

### creators table
```
id (UUID, Primary Key)
name (TEXT) - Creator's display name
code (TEXT, Unique) - Influencer code (e.g., "sarah", "mike")
email (TEXT) - Contact email
commission_rate (DECIMAL) - Default 10%
total_revenue (DECIMAL) - Auto-updated from transactions
total_orders (INTEGER) - Number of orders referred
status (TEXT) - "active", "inactive", "suspended"
created_at, updated_at (TIMESTAMP)
```

### creator_transactions table
```
id (UUID, Primary Key)
creator_id (UUID, Foreign Key to creators.id)
order_id (UUID, Foreign Key to orders.id)
order_amount (DECIMAL) - Full order amount
commission_rate (DECIMAL) - Applied rate
commission_amount (DECIMAL) - Calculated commission
status (TEXT) - "pending", "completed", "rejected"
notes (TEXT) - Any notes
created_at, updated_at (TIMESTAMP)
```

---

## 🚀 Next Steps

### Phase 1: Foundation (Now)
- ✅ Run SQL migration
- ✅ Set environment variables
- ✅ Update supabase.ts with new functions
- ✅ Test connections

### Phase 2: Integration (This Week)
- [ ] Update CheckoutFlow for creator tracking
- [ ] Create CreatorDashboard component
- [ ] Add creators to AdminDashboard
- [ ] Test full checkout → order → creator transaction flow

### Phase 3: Optimization (Next Week)
- [ ] Add revenue analytics/charts
- [ ] Create creator payout reports
- [ ] Add automated commission calculations
- [ ] Set up email notifications for new orders

### Phase 4: Scale (Future)
- [ ] Creator self-signup form
- [ ] Creator dashboard (view own stats)
- [ ] Automated payout system
- [ ] Advanced analytics and reporting

---

## 💡 Pro Tips

### 1. Use Supabase Realtime for Live Updates
```typescript
supabase
  .channel('orders:all')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
    console.log('Order updated:', payload);
  })
  .subscribe();
```

### 2. Batch Creator Commission Updates
Instead of updating on each order, batch update daily:
```typescript
export async function dailyCommissionUpdate() {
  // Update creator.total_revenue from creator_transactions
  // Mark pending as completed
  // Generate payout reports
}
```

### 3. Add Audit Logging
```typescript
// Log all revenue-related changes
const { error } = await supabase
  .from('audit_log')
  .insert([{
    action: 'commission_calculated',
    creator_id: creator.id,
    amount: commissionAmount,
    timestamp: new Date().toISOString(),
  }]);
```

### 4. Security: Restrict Creator Access
```typescript
// Only show creator their own transactions
CREATE POLICY "creator_view_own_transactions" ON creator_transactions
  FOR SELECT USING (
    auth.jwt() ->> 'creator_code' = creators.code
  );
```

---

## 📞 Support

**Issues?**

1. Check Supabase logs: Project → Logs → Recent
2. Review browser console for errors
3. Verify environment variables are set
4. Check RLS policies in Supabase UI
5. Test SQL queries directly in Supabase SQL editor

---

## ✅ Checklist: All Set?

- [ ] SQL migration executed successfully
- [ ] Supabase tables created (visible in Table Editor)
- [ ] Environment variables set in .env and Netlify
- [ ] supabase.ts updated with new functions
- [ ] CheckoutFlow updated for creator tracking
- [ ] AdminDashboard has creators tab
- [ ] CreatorDashboard component created
- [ ] Test payment completed successfully
- [ ] Order appears in Supabase with creator info
- [ ] Creator revenue calculated correctly
- [ ] Production deployment ready

---

**Status:** 🟢 READY TO DEPLOY

Your complete backend with creator/influencer tracking is now set up!

---

**Last Updated:** January 19, 2026
**Version:** 1.0
**Status:** Production Ready ✅
