# Guiderr Ebook Marketplace - Setup Guide

## Overview
Guiderr is a complete ebook marketplace with JSON-driven content management, Razorpay integration, and a superadmin dashboard.

## Key Features Implemented

### 1. Landing Page
- **Hero Title**: "Guiderr: Learn, Explore, Achieve"
- **5 Categories**: Motorcycles, Finance, Travel, Children, Parenting
- **Featured Ebooks Carousel**: Auto-scrolling carousel with 5-6 featured ebooks
- **Island-style Navbar**: Rounded, always visible navbar with category links

### 2. Category Pages
- **Vertical Aspect Ratio Thumbnails**: 3 per row, clean library feel
- **Ebook Modal**: Click any ebook to see details (cover, title, author, price, synopsis)
- **Add to Cart**: Only "Add to Cart" button (Buy Now removed)

### 3. Cart & Checkout
- **Dynamic Cart**: Updates total price from JSON price fields
- **Checkout Modal**: 
  - X button to close
  - Never blocked by cart window (z-index: 60 vs 50)
  - Razorpay integration for single order (total cart amount)
  - Supports both single-item and multi-item purchases

### 4. JSON-Driven Ebook Management
- **Location**: `/src/data/ebooks.json`
- **Structure**:
  ```json
  {
    "categories": [...],
    "ebooks": [
      {
        "id": "unique-id",
        "title": "Book Title",
        "author": "Author Name",
        "price": 199,
        "cover": "/covers/cover.jpg",
        "pdf": "/ebooks/file.pdf",
        "category": "motorcycles",
        "synopsis": "Short synopsis here.",
        "featured": true
      }
    ]
  }
  ```

### 5. Superadmin Dashboard
- **URL**: `/superadmin`
- **Login**: 
  - Username: `admin`
  - Password: `guiderr123`
- **Category Management**:
  - Create new categories
  - Rename existing categories
  - Delete categories (also removes ebooks in that category)
- **Ebook Management**:
  - Add new ebooks (title, author, price, cover, PDF, category, synopsis)
  - Edit existing ebooks
  - Delete ebooks
- **Data Persistence**: Uses localStorage (updates reflected immediately)

### 6. File Structure
```
public/
  ├── ebooks/          # Upload PDF files here
  └── covers/          # Upload cover images here

src/
  ├── data/
  │   └── ebooks.json  # Main data file
  ├── types/
  │   └── ebook.ts     # TypeScript types
  ├── utils/
  │   └── ebooks.ts    # Ebook data utilities
  └── pages/
      └── SuperadminDashboard.tsx
```

## Adding New Ebooks

### Method 1: Via Superadmin Dashboard (Recommended)
1. Go to `/superadmin`
2. Login with credentials
3. Click "Ebooks" tab
4. Click "Add Ebook"
5. Fill in all fields:
   - Title, Author, Price (required)
   - Category (required)
   - Cover URL: `/covers/filename.jpg`
   - PDF URL: `/ebooks/filename.pdf`
   - Synopsis
6. Click "Add Ebook"

### Method 2: Direct JSON Edit
1. Edit `/src/data/ebooks.json`
2. Add ebook object to `ebooks` array
3. Follow the schema above

## Uploading Files

1. **Cover Images**: 
   - Upload to `/public/covers/`
   - Use format: `/covers/filename.jpg` in JSON

2. **PDF Files**:
   - Upload to `/public/ebooks/`
   - Use format: `/ebooks/filename.pdf` in JSON

## Routes

- `/` - Landing page
- `/:category` - Category page (e.g., `/motorcycles`)
- `/thank-you` - Thank you page after purchase
- `/admin` - Order management dashboard
- `/superadmin` - Category & ebook management dashboard

## Notes

- All data is stored in localStorage for the superadmin dashboard
- In production, you'd want to connect this to a backend API
- The checkout modal has z-index 60 to ensure it's never blocked by the cart (z-index 50)
- Featured ebooks are determined by the `featured: true` property in JSON

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```


