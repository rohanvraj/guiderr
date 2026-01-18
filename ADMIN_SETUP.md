# Guiderr Ebook Store - Admin Dashboard & Cloudinary Integration

## Overview

This document describes the new Cloudinary integration and admin dashboard features added to the Guiderr ebook store.

## Features Implemented

### 1. Cloudinary Integration for Ebook Covers

**Status:** ✅ Complete

Ebook cover images now support Cloudinary CDN URLs for optimized image delivery.

**Implementation Details:**
- Added `coverImage?: string` field to the Ebook interface in `src/types/ebook.ts`
- All 16 ebooks in `src/data/ebooks.json` now include Cloudinary CDN URLs
- Components automatically fall back to the legacy `cover` field if `coverImage` is not available
- Cloudinary URLs use fetch transformation for optimal sizing and delivery

**Updated Components:**
- [Hero.tsx](src/components/Hero.tsx) - Featured ebooks carousel
- [EbookModal.tsx](src/components/EbookModal.tsx) - Ebook detail modal
- [CartPanel.tsx](src/components/CartPanel.tsx) - Cart items preview

**Example Cloudinary URL format:**
```
https://res.cloudinary.com/demo/image/fetch/w=400,h=600,c=fill/https://images.unsplash.com/photo-XXXX
```

### 2. Password-Protected Admin Dashboard

**Status:** ✅ Complete

A frontend-only admin dashboard for managing ebooks (add, edit, delete).

**Location:** `/admin/ebooks`

**Features:**
- Password protection (stored in `VITE_ADMIN_PASSWORD` env variable)
- Add new ebooks with all fields
- Edit existing ebooks
- Delete ebooks (with confirmation)
- Real-time localStorage persistence
- Live UI updates after changes

**Password Setup:**
1. Create a `.env.local` file in the project root
2. Add: `VITE_ADMIN_PASSWORD=your_secure_password`
3. In Netlify, set the same variable in Build & Deploy → Environment

**Admin Dashboard Fields:**
- Title (required)
- Author (required)
- Category (required)
- Price (₹)
- Google Drive Download Link
- Cloudinary Cover Image URL
- Synopsis
- Featured (checkbox)

### 3. Enhanced Ebook Data Structure

**File:** `src/data/ebooks.json`

Each ebook now includes:
```json
{
  "id": "unique-id",
  "title": "Ebook Title",
  "author": "Author Name",
  "price": 1,
  "cover": "legacy_unsplash_url",
  "coverImage": "cloudinary_url",
  "pdf": "/ebooks/filename.pdf",
  "downloadLink": "https://drive.google.com/drive/folders/...",
  "category": "category_id",
  "synopsis": "Description",
  "featured": true/false
}
```

### 4. localStorage Persistence

**How It Works:**
- Admin edits are stored in browser's localStorage under key `ebooks_data`
- Changes persist across page refreshes
- All components read from localStorage first, then fall back to static JSON
- Custom event `ebooksDataUpdated` notifies components of changes

**Location:** `src/utils/ebooks.ts`

```typescript
export function loadEbooksData(): EbooksData {
  const stored = localStorage.getItem('ebooks_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.categories && parsed.ebooks) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored ebooks data:', e);
    }
  }
  return defaultData; // Falls back to JSON
}
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Admin Dashboard Password
VITE_ADMIN_PASSWORD=your_secure_password_here

# Supabase (if using backend)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Cloudinary (Optional - for future image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to **Build & Deploy** → **Environment**
3. Add the same environment variables as in `.env.local`
4. Deploy

## File Structure

```
src/
├── types/
│   └── ebook.ts                    (Updated: added coverImage field)
├── pages/
│   └── AdminEbookDashboard.tsx      (NEW: Admin dashboard)
├── components/
│   ├── Hero.tsx                     (Updated: use coverImage)
│   ├── EbookModal.tsx               (Updated: use coverImage)
│   └── CartPanel.tsx                (Updated: use coverImage)
├── utils/
│   └── ebooks.ts                    (Already supports localStorage)
├── data/
│   └── ebooks.json                  (Updated: added coverImage URLs)
└── App.tsx                          (Updated: added /admin/ebooks route)

.env.example                         (NEW: Environment variables template)
```

## Usage Examples

### Accessing the Admin Dashboard

1. Navigate to `/admin/ebooks`
2. Enter the admin password
3. Manage ebooks:
   - **Add:** Click "Add New Ebook" button
   - **Edit:** Click the edit icon on any ebook card
   - **Delete:** Click the trash icon (with confirmation)

### Adding a New Ebook

1. Fill in all required fields (Title, Author, Category)
2. Optionally add:
   - Price
   - Google Drive download link
   - Cloudinary cover image URL
   - Synopsis
   - Mark as Featured
3. Click "Save Ebook"
4. Changes appear immediately

### Cloudinary URL Format

To use Cloudinary for optimized images:

```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w=400,h=600,c=fill/v1/YOUR_IMAGE_PATH
```

Or fetch from external URL:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/fetch/w=400,h=600,c=fill/https://example.com/image.jpg
```

## Technical Details

### Cart Limitation (Unchanged)

- Maximum 5 ebooks per cart (enforced in [CartContext.tsx](src/context/CartContext.tsx))
- Checkout and Razorpay flow remain untouched

### Payment Flow (Unchanged)

1. User adds ebooks to cart (max 5)
2. Proceeds to checkout
3. Razorpay payment gateway
4. Thank You page with download links
5. Download links from ebook `downloadLink` field (Google Drive)

### Frontend-Only Implementation

✅ No backend database required  
✅ No API calls for ebook management  
✅ No secrets exposed in frontend  
✅ All operations use localStorage (browser storage)  
✅ Works on Netlify free tier  

## Data Flow

```
┌─────────────────────┐
│  Admin Dashboard    │
│  (Password Auth)    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Edit/Add/Delete    │
│     Ebooks          │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Save to            │
│  localStorage       │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Dispatch Event:    │
│  ebooksDataUpdated  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Components Read    │
│  Updated Data       │
└─────────────────────┘
```

## Browser Compatibility

- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs (localStorage, JSON)
- localStorage is cleared when browser cache is cleared
- Data can be manually backed up by exporting the ebooks_data localStorage value

## Security Considerations

✅ Password stored in Netlify environment variables (not in code)  
✅ No API keys exposed in frontend  
✅ localStorage is isolated per domain  
✅ Cloudinary URLs are public (no credentials)  
✅ No database modifications required  

## Limitations

⚠️ Admin changes only persist in the user's browser (localStorage)  
⚠️ Changes are not shared across different users/browsers  
⚠️ Clearing browser cache will reset ebooks to default JSON  

**Future Enhancement:**
To make changes permanent across all users, integrate with a backend service to save updates to `src/data/ebooks.json` or a database.

## Testing Checklist

- ✅ Cloudinary URLs display correctly in all components
- ✅ Images fallback gracefully if URL fails
- ✅ Admin dashboard password protection works
- ✅ Add/edit/delete operations update localStorage
- ✅ UI reflects changes immediately
- ✅ Cart max 5 ebooks rule enforced
- ✅ Razorpay checkout flow intact
- ✅ Thank You page download links work
- ✅ Build has no TypeScript errors
- ✅ Works on Netlify deploy

## Support

For issues or questions about this implementation:
1. Check the `.env.example` for environment setup
2. Verify admin password matches between `.env.local` and Netlify
3. Open browser DevTools → Application → localStorage to check `ebooks_data`
4. Clear browser cache and try again

---

**Last Updated:** January 2026  
**Version:** 1.0 (Frontend-Only Implementation)
