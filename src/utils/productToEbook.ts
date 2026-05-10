import { Product } from './supabase';
import { Ebook } from '../types/ebook';

export function toEbook(p: Product): Ebook {
  return {
    id: p.id,
    title: p.name,
    author: p.author || 'Guiderr',
    price: p.price_in_rupees,
    cover: p.cover_image_url || '/covers/placeholder.svg',
    coverImage: p.cover_image_url,
    pdf: '',
    category: p.category || '',
    synopsis: p.description || p.name,
  };
}
