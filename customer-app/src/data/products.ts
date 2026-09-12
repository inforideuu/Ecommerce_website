export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  details: string[];
  inStock: boolean;
  trending: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival?: boolean;
  limitedEdition?: boolean;
  tag?: string;
  fabric: string;
  occasion: string;
  brand: string;
  material: string;
  categoryGroup?: string;
  subcategory?: string;
  videoUrl?: string;
}

export const PRODUCTS: Product[] = [];

export const BRANDS = ['Gucci', 'Zara', 'H&M', 'Nike', 'Adidas', 'Prada', 'Balenciaga'];
export const CATEGORIES = ['New Arrivals', 'Suits & Blazers', 'Outerwear', 'Shirts & Polo', 'Footwear', 'Accessories', 'Sale'];
