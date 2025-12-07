export interface Ebook {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  pdf: string;
  category: string;
  synopsis: string;
  featured?: boolean;
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


