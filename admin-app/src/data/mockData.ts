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
}

export interface AdminCategory {
  id: string;
  name: string;
  parentCategory: string;
  slug: string;
  status: 'active' | 'inactive';
  image: string;
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

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-1',
    name: 'Silk Wrap Evening Gown',
    sku: 'SLK-WR-001',
    barcode: '400192837461',
    category: 'Women',
    brand: 'Gucci',
    price: 890,
    discountPrice: 790,
    costPrice: 220,
    description: '100% pure Mulberry silk wrap evening gown.',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&auto=format&fit=crop&q=60'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#D4AF37', '#111827'],
    material: 'Silk',
    stock: 45,
    weight: 0.4,
    dimensions: '30x20x5 cm',
    status: 'active',
    seoKeywords: 'silk gown, luxury dress, evening wear'
  },
  {
    id: 'prod-2',
    name: 'Cashmere Double-Breasted Overcoat',
    sku: 'CSH-DB-002',
    barcode: '400192837462',
    category: 'Men',
    brand: 'Zara',
    price: 1250,
    discountPrice: 1250,
    costPrice: 350,
    description: 'Double-breasted overcoat tailormade from Mongolian cashmere.',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=150&auto=format&fit=crop&q=60'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#18181B', '#8B7355'],
    material: 'Cashmere',
    stock: 20,
    weight: 1.2,
    dimensions: '40x30x8 cm',
    status: 'active',
    seoKeywords: 'cashmere coat, double breasted overcoat, winter jacket'
  },
  {
    id: 'prod-3',
    name: 'Signature Leather Biker Jacket',
    sku: 'LTH-BK-003',
    barcode: '400192837463',
    category: 'Men',
    brand: 'Gucci',
    price: 650,
    discountPrice: 550,
    costPrice: 180,
    description: 'Supple lambskin leather biker jacket with gold-toned hardware.',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&auto=format&fit=crop&q=60'],
    sizes: ['S', 'M', 'L'],
    colors: ['#111827'],
    material: 'Leather',
    stock: 8,
    weight: 1.5,
    dimensions: '38x28x6 cm',
    status: 'active',
    seoKeywords: 'leather jacket, lambskin biker, gucci jacket'
  },
  {
    id: 'prod-4',
    name: 'Plissé Pleated Midi Dress',
    sku: 'PLS-PL-004',
    barcode: '400192837464',
    category: 'Women',
    brand: 'H&M',
    price: 340,
    discountPrice: 340,
    costPrice: 70,
    description: 'High neckline plissé midi dress featuring a tie waist.',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&auto=format&fit=crop&q=60'],
    sizes: ['XS', 'S', 'M'],
    colors: ['#EC4899'],
    material: 'Chiffon',
    stock: 0,
    weight: 0.3,
    dimensions: '28x18x4 cm',
    status: 'active',
    seoKeywords: 'pleated dress, midi dress, pink gown'
  }
];

export const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Men', parentCategory: 'None', slug: 'men', status: 'active', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=100&q=80' },
  { id: 'cat-2', name: 'Women', parentCategory: 'None', slug: 'women', status: 'active', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=100&q=80' },
  { id: 'cat-3', name: 'Kids', parentCategory: 'None', slug: 'kids', status: 'active', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100&q=80' }
];

export const INITIAL_ORDERS: AdminOrder[] = [
  { id: 'ord-101', date: '2026-07-08', customerName: 'Aria Montgomery', email: 'superadmin@gmail.com', total: 1360, status: 'completed', paymentStatus: 'paid', deliveryMethod: 'Signature Delivery', trackingNumber: 'TRK-984210', itemsCount: 2 },
  { id: 'ord-102', date: '2026-07-09', customerName: 'Julian Vance', email: 'julian@taste.com', total: 890, status: 'shipped', paymentStatus: 'paid', deliveryMethod: 'Priority White-Glove', trackingNumber: 'TRK-859214', itemsCount: 1 },
  { id: 'ord-103', date: '2026-07-09', customerName: 'Scarlett Johansson', email: 'scarlett@ent.com', total: 490, status: 'pending', paymentStatus: 'unpaid', deliveryMethod: 'Signature Delivery', itemsCount: 1 }
];

export const INITIAL_CUSTOMERS: AdminCustomer[] = [
  { id: 'cust-1', name: 'Aria Montgomery', email: 'superadmin@gmail.com', points: 2450, ordersCount: 4, address: '742 Evergreen Terrace, Springfield, OR', status: 'active' },
  { id: 'cust-2', name: 'Julian Vance', email: 'julian@taste.com', points: 890, ordersCount: 1, address: '98 Avenue des Champs-Élysées, Paris, FR', status: 'active' },
  { id: 'cust-3', name: 'Scarlett Johansson', email: 'scarlett@ent.com', points: 1500, ordersCount: 2, address: '12 Rodeo Drive, Beverly Hills, CA', status: 'active' }
];

export const BRANDS = ['Gucci', 'Zara', 'H&M', 'Nike', 'Adidas', 'Prada', 'Balenciaga'];
export const CATEGORY_NAMES = ['Men', 'Women', 'Kids', 'Accessories', 'Footwear'];
