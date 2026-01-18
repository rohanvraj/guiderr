export interface Ebook {
  id: string;
  title: string;
  author: string;
  price: number;
  cover?: string;
  coverImage?: string; // Cloudinary public URL
  pdf: string;
  category: string;
  synopsis: string;
  featured?: boolean;
  downloadLink?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface EbooksData {
  categories: Category[];
  ebooks: Ebook[];
}














