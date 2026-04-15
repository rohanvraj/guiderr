import { Ebook, Category, EbooksData } from '../types/ebook';

// Canonical category definitions used across the app (Header nav, Hero tiles, routing).
// These are NOT mock ebooks — they define the storefront structure.
const categories: Category[] = [
  { id: 'finance',      name: 'Personal Finance', description: 'Build wealth, optimise credit, and achieve financial freedom' },
  { id: 'travel',       name: 'Travel',       description: 'Explore the world with confidence and insider knowledge' },
  { id: 'gadget-tech',  name: 'Tech',         description: 'Reviews and guides on the latest gadgets and technology' },
  { id: 'automotive',   name: 'Automotive',   description: 'Motorcycles, cars, and everything that moves — buying, riding, and maintenance guides' },
  { id: 'motorcycles',  name: 'Motorcycles',  description: 'Master the art of riding, maintenance, and safety' },
  { id: 'lifestyle',    name: 'Lifestyle',    description: 'Smarter choices for how you live, eat, dress, and spend your time' },
  { id: 'business',     name: 'Business',     description: "Entrepreneur's playbook for building and growing your business" },
];

// For admin: load ebooks data from localStorage (Superadmin dashboard uses this)
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
  return { categories, ebooks: [] };
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

export function getAllEbooks(): Ebook[] {
  return loadEbooksData().ebooks;
}

// For admin: update ebooks data
export async function updateEbooksData(newData: EbooksData): Promise<void> {
  localStorage.setItem('ebooks_data', JSON.stringify(newData));
  window.dispatchEvent(new CustomEvent('ebooksDataUpdated'));
}

