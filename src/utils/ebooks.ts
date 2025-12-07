import ebooksData from '../data/ebooks.json';
import { Ebook, Category, EbooksData } from '../types/ebook';

const defaultData = ebooksData as EbooksData;

// For admin: load ebooks data (check localStorage first, then fallback to JSON)
export function loadEbooksData(): EbooksData {
  const stored = localStorage.getItem('ebooks_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure it has the right structure
      if (parsed.categories && parsed.ebooks) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored ebooks data:', e);
    }
  }
  return defaultData;
}

// Get current data (always from loadEbooksData to ensure consistency)
function getData(): EbooksData {
  return loadEbooksData();
}

export function getCategories(): Category[] {
  return getData().categories;
}

export function getCategoryById(id: string): Category | undefined {
  return getData().categories.find(cat => cat.id === id);
}

export function getEbooksByCategory(categoryId: string): Ebook[] {
  return getData().ebooks.filter(ebook => ebook.category === categoryId);
}

export function getEbookById(id: string): Ebook | undefined {
  return getData().ebooks.find(ebook => ebook.id === id);
}

export function getFeaturedEbooks(): Ebook[] {
  return getData().ebooks.filter(ebook => ebook.featured);
}

export function getAllEbooks(): Ebook[] {
  return getData().ebooks;
}

// For admin: update ebooks data
export async function updateEbooksData(newData: EbooksData): Promise<void> {
  // In a real app, this would save to a backend/database
  // For now, we'll use localStorage as a temporary solution
  localStorage.setItem('ebooks_data', JSON.stringify(newData));
  // Trigger a custom event to notify other components
  window.dispatchEvent(new CustomEvent('ebooksDataUpdated'));
}

