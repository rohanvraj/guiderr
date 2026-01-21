# RLS Authentication & Diagnostic Guide

## Problem Summary
❌ Getting "RLS violation" errors when trying to save products from EbookManager.tsx even though:
- RLS policies allow authenticated users full access
- Admin password authentication is working
- Products can be read from the database

## Root Cause
The issue is that **RLS policies check for authenticated Supabase users**, but the admin login was only storing a session in `localStorage` without creating an actual Supabase auth session.

**The flow was:**
1. Admin enters password ✅
2. localStorage.setItem('adminSession', 'true') ✅
3. But NO Supabase JWT token was created ❌
4. EbookManager tries to insert into products table
5. Supabase RLS policy checks: "Is this user authenticated?" ❌
6. RLS rejects the operation: PGRST301 error

## Solution Implemented

### 1. Updated AdminDashboard.tsx
- **Before**: Only stored a boolean in localStorage
- **After**: Now calls `authenticateAdmin()` which attempts to establish a Supabase session
- The admin token is also stored in localStorage for fallback RLS checks

**Code change**:
```typescript
// OLD
localStorage.setItem('adminSession', 'true');

// NEW  
await authenticateAdmin(adminPassword);
localStorage.setItem('adminToken', adminPassword);
```

### 2. Added Authentication Functions to supabase.ts
New functions to handle admin authentication:

```typescript
export async function authenticateAdmin(adminToken: string) {
  // Attempts Supabase auth with magic link
  // Falls back gracefully if Supabase Auth not configured
}

export async function getCurrentUser() {
  // Returns currently authenticated user
}

export async function isUserAuthenticated() {
  // Checks if valid session exists
}
```

### 3. Enhanced EbookManager.tsx
- **Checks** for `adminToken` in localStorage before save/delete
- **Logs** detailed error information including error codes
- **Shows** user-friendly error messages that distinguish between:
  - RLS policy violations (PGRST301)
  - General database errors
  - Session expiration

## Diagnostic Checklist

### ✅ Step 1: Check Supabase Project Settings
1. Go to Supabase Dashboard → Project Settings → API
2. Verify you have both:
   - `VITE_SUPABASE_URL` - your project URL
   - `VITE_SUPABASE_ANON_KEY` - the anon/public key
3. ✅ These should be in your `.env.local` file

### ✅ Step 2: Verify RLS Policies
In Supabase Dashboard, go to **Authentication → RLS (Row Level Security)**

**Expected policy for products table**:
```sql
-- Allow authenticated users (anyone with a valid JWT) to do everything
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything" ON products
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

**Check this policy exists:**
1. Click on `products` table → Click the lock icon → Click "Policies"
2. You should see a policy allowing authenticated access
3. If not, create one with the SQL above

### ✅ Step 3: Test the Flow
1. Open your app and navigate to `/admin`
2. Enter your admin password (check `.env.local` for `VITE_ADMIN_PASSWORD`)
3. You should see console message: `✅ Admin authenticated successfully`
4. Try to add a new product
5. If error occurs, check the console for detailed error logs

### ✅ Step 4: Read Console Error Messages

**Error Format**:
```
❌ Failed to insert product: {error object}
   Error code: PGRST301  (← This is the key)
   Error message: ...
   Details: ...
```

**Common Error Codes:**

| Code | Meaning | Solution |
|------|---------|----------|
| `PGRST301` | RLS policy violation | User not authenticated / RLS policy doesn't allow operation |
| `PGRST204` | No rows returned | Query returned empty set (usually OK) |
| `42P01` | Table doesn't exist | Products table not created |
| `22P02` | Invalid data type | Wrong data type passed (e.g., string for number) |

### ✅ Step 5: Check Admin Session Storage
Open DevTools → Application → Local Storage → Check for:
- `adminSession` = "true"
- `adminToken` = your admin password

If either is missing, login again.

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Admin enters password on /admin page                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ AdminDashboard.handleAdminLogin()                           │
│ - Validates password against VITE_ADMIN_PASSWORD            │
│ - Calls authenticateAdmin(password)                         │
│ - Stores adminToken in localStorage                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ authenticateAdmin() in supabase.ts                          │
│ - Attempts: supabase.auth.signInWithPassword()              │
│ - Returns: {success: true, fallback: true/false}            │
│ - Purpose: Create JWT token for RLS checks                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ EbookManager component mounts                               │
│ - Checks localStorage.getItem('adminToken')                 │
│ - If missing → shows "Admin session expired" error          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ User tries to save product                                  │
│ - handleSave() is called                                    │
│ - Checks adminToken again                                   │
│ - Calls: supabase.from('products').insert(...)              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Supabase evaluates RLS policy                               │
│ - Policy checks: auth.role() = 'authenticated'              │
│ - JWT from Supabase session must be valid                   │
│ - If valid → INSERT succeeds ✅                              │
│ - If invalid → Returns PGRST301 ❌                          │
└─────────────────────────────────────────────────────────────┘
```

## If You Still Get RLS Errors

### Option A: Check if Supabase Auth is Configured
The `authenticateAdmin()` function gracefully falls back if Supabase Auth is not set up. If your project doesn't have Auth configured:

1. Go to Supabase Dashboard
2. Check Authentication → Providers
3. At minimum, you need **Email** provider enabled

### Option B: Use Service Role Key (Admin Operations Only)
If you want to bypass auth for admin operations, create a separate admin client:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY // ← Admin key (keep secret!)
);
```

⚠️ **WARNING**: Service role keys should NEVER be exposed in frontend code. Only use anon key + auth in frontend.

### Option C: Add Custom RLS Policy with Token
You can modify the RLS policy to accept a custom token:

```sql
CREATE POLICY "Admin token or authenticated users" ON products
FOR ALL
USING (
  auth.role() = 'authenticated' 
  OR current_setting('app.admin_token', true) = 'your-admin-token'
)
WITH CHECK (
  auth.role() = 'authenticated' 
  OR current_setting('app.admin_token', true) = 'your-admin-token'
);
```

Then in the client:
```typescript
await supabase.rpc('set_admin_context', { token: adminToken });
```

## Testing

### Test 1: Read Operations (Should Already Work)
```typescript
// Should return products
const { data } = await supabase
  .from('products')
  .select('*');
```

### Test 2: Write Operations (May Fail Without Auth)
```typescript
// Should fail with RLS error if not authenticated
const { error } = await supabase
  .from('products')
  .insert([{ name: 'Test', price_in_rupees: 100, delivery_link: 'http://...' }]);

// If error.code === 'PGRST301' → Auth issue
if (error?.code === 'PGRST301') {
  console.log('❌ RLS violation - user not authenticated');
}
```

## Summary of Changes

| File | Changes |
|------|---------|
| `src/utils/supabase.ts` | Added `authenticateAdmin()`, `getCurrentUser()`, `isUserAuthenticated()` |
| `src/pages/AdminDashboard.tsx` | Updated `handleAdminLogin()` to call `authenticateAdmin()` |
| `src/components/admin/EbookManager.tsx` | Added admin token checks in `handleSave()` and `handleDelete()` + enhanced error logging |

## Next Steps

1. ✅ Check your RLS policies match the expected format
2. ✅ Test the admin login flow
3. ✅ Check console for detailed error messages
4. ✅ Verify `adminToken` is saved in localStorage after login
5. ✅ Try creating a product and review the error details

If you still see PGRST301 errors after these steps, it means:
- The RLS policy needs to be adjusted
- OR the authentication flow needs to be updated
- OR Supabase Auth isn't configured for your project

---

**Debug Command**: Open DevTools Console and run:
```javascript
// Check if admin is authenticated
console.log('Admin Token:', localStorage.getItem('adminToken'));
console.log('Admin Session:', localStorage.getItem('adminSession'));

// Check Supabase user
import { supabase } from './src/utils/supabase.ts';
const user = await supabase.auth.getUser();
console.log('Current User:', user);
```
