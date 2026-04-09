import { Ebook, Category, EbooksData } from '../types/ebook';

// Canonical category definitions used across the app (Header nav, Hero tiles, routing).
// These are NOT mock ebooks — they define the storefront structure.
const categories: Category[] = [
  { id: 'motorcycles', name: 'Motorcycles', description: 'Master the art of riding, maintenance, and safety' },
  { id: 'finance', name: 'Finance', description: 'Build wealth, invest smartly, and achieve financial freedom' },
  { id: 'travel', name: 'Travel', description: 'Explore the world with confidence and insider knowledge' },
  { id: 'pets', name: 'Pets', description: 'Everything you need to care for, train, and bond with your pets' },
  { id: 'beauty-wellness', name: 'Beauty & Wellness', description: 'Curated guides on skincare, fitness, nutrition, and holistic wellness' },
  { id: 'art', name: 'Art', description: 'Unleash creativity with guides on painting, drawing, and design' },
  { id: 'business', name: 'Business', description: "Entrepreneur's playbook for building and growing your business" },
  { id: 'gadget-tech', name: 'Gadget & Tech', description: 'Reviews, guides, and tips on the latest gadgets and technology' },
  { id: 'home-living', name: 'Home & Living', description: 'Transform your space with guides on furniture, décor, and home accessories' },
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

