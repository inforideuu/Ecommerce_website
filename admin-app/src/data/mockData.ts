export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  discountPrice: number;
  costPrice: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string;
  stock: number;
  weight: number;
  dimensions: string;
  status: 'active' | 'draft' | 'archived';
  seoKeywords: string;
  discount?: number;
  occasion?: string;
  videoUrl?: string;
  categoryGroup?: string;
  subcategory?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  parentCategory: string;
  slug: string;
  status: string;
  image: string;
  sortOrder?: number;
  featured?: boolean;
  showOnHomepage?: boolean;
  description?: string;
}

export interface AdminOrder {
  id: string;
  date: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  deliveryMethod: string;
  trackingNumber?: string;
  deliveryDate?: string;
  returnRequest?: any;
  exchangeRequest?: any;
  reviews?: any;
  itemsCount: number;
  items?: any[];
  createdAt?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  points: number;
  ordersCount: number;
  address: string;
  status: 'active' | 'blocked';
}

export const INITIAL_PRODUCTS: AdminProduct[] = [];

export const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Suits & Blazers', parentCategory: 'None', slug: 'suits-blazers', status: 'active', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&q=80' },
  { id: 'cat-2', name: 'Outerwear', parentCategory: 'None', slug: 'outerwear', status: 'active', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=100&q=80' },
  { id: 'cat-3', name: 'Footwear', parentCategory: 'None', slug: 'footwear', status: 'active', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=100&q=80' },
  { id: 'cat-4', name: 'Accessories', parentCategory: 'None', slug: 'accessories', status: 'active', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80' }
];

export const INITIAL_ORDERS: AdminOrder[] = [];

export const INITIAL_CUSTOMERS: AdminCustomer[] = [];

export const BRANDS = ['Gucci', 'Zara', 'H&M', 'Nike', 'Adidas', 'Prada', 'Balenciaga'];
export const CATEGORY_NAMES = ['Suits & Blazers', 'Outerwear', 'Shirts & Polo', 'Footwear', 'Accessories'];
