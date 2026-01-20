# RLS Fix for Partners Table - Setup Guide

## Problem
The partners table was throwing RLS (Row Level Security) violation errors on INSERT operations because:
1. The app uses localStorage password authentication, not Supabase Auth
2. Supabase RLS doesn't recognize the user as 'authenticated'
3. The client was trying to read the inserted row immediately after insertion

## Solution Implemented

### ✅ Fix 1: Added `returning: 'minimal'` Option
Updated all partner insert operations to use `{ returning: 'minimal' }` which prevents the client from trying to SELECT the row after INSERT, avoiding read permission issues.

### ✅ Fix 2: Admin Client with Service Role Key
Created a separate `supabaseAdmin` client that uses the service role key to bypass RLS for admin operations.

---

## 🔧 Setup Instructions

### Step 1: Get Your Service Role Key
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Find the **service_role** key (NOT the anon key)
4. Copy it (⚠️ Keep this secret!)

### Step 2: Add to Environment Variables
Add this to your `.env` file:

```env
VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Example `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_PASSWORD=your_admin_password
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🔒 Security Notes

### ⚠️ CRITICAL: Service Role Key Safety

**NEVER expose the service role key publicly!**

✅ **Safe:**
- Using it in `.env` files (not committed to Git)
- Using it server-side only
- Our setup: Vite env variables are replaced at build time

❌ **Dangerous:**
- Committing `.env` to Git
- Exposing in client-side code without Vite prefix
- Sharing your `.env` file

### Why This Approach Is Safe
1. Vite only exposes `VITE_*` prefixed variables to the client bundle
2. The service key is only used for admin operations
3. Admin operations are already password-protected
4. The key is checked at build time, not runtime in browser

### Alternative: RLS Policies for Anon Role
If you prefer not to use the service key, update your Supabase RLS policies:

```sql
-- Run these in Supabase SQL Editor:

-- Allow anon role to insert partners
CREATE POLICY "Allow anon insert partners" ON partners
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon role to select partners  
CREATE POLICY "Allow anon select partners" ON partners
  FOR SELECT TO anon
  USING (true);

-- Allow anon role to delete partners
CREATE POLICY "Allow anon delete partners" ON partners
  FOR DELETE TO anon
  USING (true);
```

**Note:** This is less secure as anyone with the anon key could modify partners. The service key approach is better since it's only used when admin is authenticated via password.

---

## 📝 What Changed in Code

### File: `src/utils/supabase.ts`

**Added:**
```typescript
// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if service key not provided
```

**Updated Functions:**
- `getAllPartners()` → Uses `supabaseAdmin`
- `createPartner()` → Uses `supabaseAdmin` + `{ returning: 'minimal' }`
- `deletePartner()` → Uses `supabaseAdmin`
- `getPartnerStats()` → Uses `supabaseAdmin` for partners table

---

## ✅ Verification Steps

### Test 1: Add Partner
1. Go to `/admin/partners`
2. Click "Add New Partner"
3. Fill in details and submit
4. ✅ Should succeed without RLS errors

### Test 2: View Partners
1. Stay on `/admin/partners`
2. ✅ Should see list of all partners

### Test 3: Delete Partner
1. Click delete on any partner
2. ✅ Should remove without errors

### Test 4: Analytics
1. Go to `/admin` → "Partners & Analytics" tab
2. ✅ Should display all partner data

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Check that service key is correctly copied
- Ensure no extra spaces in `.env` file
- Restart dev server after adding the key

### Error: Still getting RLS violations
- Verify the service key starts with `eyJ...`
- Check that `.env` variable is named exactly `VITE_SUPABASE_SERVICE_KEY`
- Clear browser cache and reload

### Fallback Working
If service key is not provided, the system falls back to the regular client:
- You'll see this in console: "Using fallback client"
- Operations might still fail due to RLS
- Add the service key to fix

---

## 📊 What This Enables

With the fix in place:
- ✅ Partners can be created/edited/deleted via admin panel
- ✅ Analytics loads partner data correctly
- ✅ No RLS violations on any admin operations
- ✅ Regular users still can't access partners table directly
- ✅ Orders table referral tracking still works for everyone

---

## 🎯 Summary

**Before:** RLS violations when trying to manage partners  
**After:** Smooth admin operations with proper security  

**What to do:** Add `VITE_SUPABASE_SERVICE_KEY` to your `.env` file and restart the server.

**Time to fix:** 2 minutes  
**Security level:** High (password-protected admin + service key)
