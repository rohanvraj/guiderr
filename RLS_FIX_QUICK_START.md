# RLS Authentication Fix - Quick Reference

## TL;DR - What Was Wrong

❌ **Before**: Admin login stored `localStorage.adminSession = true` but no Supabase JWT
❌ **Result**: RLS policies rejected product saves with PGRST301 error
✅ **Now**: Admin login calls `authenticateAdmin()` to create proper Supabase JWT session

---

## 3 Key Changes

### 1️⃣ supabase.ts - Added Auth Functions
```typescript
export async function authenticateAdmin(adminToken: string) {
  // Creates JWT session for RLS policies to verify
}
```

### 2️⃣ AdminDashboard.tsx - Call Auth Function
```typescript
const authResult = await authenticateAdmin(adminPassword);
if (authResult.success) {
  localStorage.setItem('adminToken', adminPassword);
  setIsAuthenticated(true);
}
```

### 3️⃣ EbookManager.tsx - Validate + Log Errors
```typescript
const adminToken = localStorage.getItem('adminToken');
if (!adminToken) {
  setMessage('Admin session expired. Please log in again.');
  return;
}

// When error occurs, logs detailed info:
if (error?.code === 'PGRST301') {
  console.log('❌ RLS violation - need authenticated session');
}
```

---

## Test It

```bash
# 1. Verify build
npm run build

# 2. Start dev server
npm run dev

# 3. Go to /admin
# 4. Enter password
# 5. Check console for: ✅ Admin authenticated successfully
# 6. Try to add a product
# 7. Should work OR show detailed error message
```

---

## If Still Getting PGRST301

### Check #1: RLS Policy
Supabase Dashboard → Authentication → RLS
- **Should be**: `auth.role() = 'authenticated'`
- **NOT**: `auth.uid() = '...'`

### Check #2: Supabase Auth
Supabase Dashboard → Authentication → Providers
- **At least one provider** must be enabled (Email is minimum)

### Check #3: localStorage
DevTools → Application → Local Storage
- After login, should have: `adminToken` = your password

### Check #4: Error Code
Console should show specific error code:
- `PGRST301` = RLS violation (policy issue)
- Other codes = Different problem

---

## How Auth Works Now

```
Admin enters password
    ↓
AdminDashboard validates against VITE_ADMIN_PASSWORD
    ↓
Calls authenticateAdmin(password)
    ↓
Supabase.auth.signInWithPassword() creates JWT
    ↓
JWT stored in Supabase session
    ↓
localStorage.adminToken = password (backup)
    ↓
EbookManager can now INSERT to products table
    ↓
RLS policy checks JWT, allows authenticated user, INSERT succeeds ✅
```

---

## Files Changed

- ✅ `src/utils/supabase.ts` - Added `authenticateAdmin()`
- ✅ `src/pages/AdminDashboard.tsx` - Call `authenticateAdmin()` on login
- ✅ `src/components/admin/EbookManager.tsx` - Validate admin token + enhanced error logging

---

## Full Diagnostic Guide

See: `RLS_AUTHENTICATION_DIAGNOSTIC.md` for comprehensive troubleshooting

---

## Support

Error messages now tell you exactly what's wrong:
- "Admin session expired" → Need to login again
- "RLS policy rejected" → Check Supabase RLS configuration
- "Database policy error" → Check table policies exist

Check console for full error details with error codes.
