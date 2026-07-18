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

export const PRODUCTS: Product[] = [
  {
    id: 'luxe-1',
    name: 'Silk Wrap Evening Gown',
    category: 'Women',
    price: 890,
    originalPrice: 1200,
    discount: 25,
    rating: 4.9,
    reviewsCount: 124,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#D4AF37', '#111827', '#EC4899'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Elevate your evening aesthetic with our signature silk wrap evening gown. Crafted from 100% pure Mulberry silk, it drapes beautifully to form a graceful silhouette that moves with effortless poise.',
    details: [
      '100% premium Mulberry silk',
      'Concealed zip fastening at back',
      'Hand-crafted drape detailing',
      'Dry clean only',
      'Made in Italy'
    ],
    inStock: true,
    trending: true,
    featured: true,
    bestSeller: false,
    tag: 'Limited Edition',
    fabric: 'Silk',
    occasion: 'Evening',
    brand: 'Gucci',
    material: '100% Mulberry Silk'
  },
  {
    id: 'luxe-2',
    name: 'Cashmere Double-Breasted Overcoat',
    category: 'Men',
    price: 1250,
    originalPrice: 1250,
    discount: 0,
    rating: 4.8,
    reviewsCount: 88,
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#18181B', '#8B7355', '#4A5568'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'An investment piece for the refined wardrobe. This double-breasted overcoat is tailormade from ultra-soft Mongolian cashmere, providing unmatched insulation and a highly premium drape.',
    details: [
      '100% Mongolian Cashmere shell',
      'Viscose lining for smooth layering',
      'Structured padded shoulders',
      'Four-button double-breasted closure',
      'Internal passport and phone pockets'
    ],
    inStock: true,
    trending: true,
    featured: true,
    bestSeller: true,
    tag: 'Timeless',
    fabric: 'Cashmere',
    occasion: 'Formal',
    brand: 'Zara',
    material: '100% Cashmere'
  },
  {
    id: 'luxe-3',
    name: 'Signature Leather Biker Jacket',
    category: 'Men',
    price: 650,
    originalPrice: 850,
    discount: 23,
    rating: 4.7,
    reviewsCount: 204,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#111827', '#4B5563'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A rebellious classic reimagined with luxury finishes. Made from supple lambskin leather that breaks in beautifully over time, completed with signature hand-polished gold-toned hardware.',
    details: [
      '100% top-grain lambskin leather',
      'Asymmetric zip front closure',
      'Quilted lining for comfort',
      'Zippered cuffs and pockets',
      'Ages uniquely with wear'
    ],
    inStock: true,
    trending: false,
    featured: false,
    bestSeller: true,
    tag: 'Best Seller',
    fabric: 'Leather',
    occasion: 'Casual',
    brand: 'Gucci',
    material: '100% Lambskin Leather'
  },
  {
    id: 'luxe-4',
    name: 'Plissé Pleated Midi Dress',
    category: 'Women',
    price: 340,
    originalPrice: 340,
    discount: 0,
    rating: 4.6,
    reviewsCount: 92,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#EC4899', '#ffffff', '#111827'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Defined by intricate micro-pleating and a fluid, lightweight movement, this plissé midi dress features a sophisticated high neckline and a flattering tie waist.',
    details: [
      'High-grade micro-pleated polyester chiffon',
      'Removable fabric belt',
      'Slip lining included',
      'Machine wash gentle cycle',
      'Wrinkle-resistant travel essential'
    ],
    inStock: true,
    trending: true,
    featured: false,
    bestSeller: false,
    tag: 'Trending',
    fabric: 'Chiffon',
    occasion: 'Cocktail',
    brand: 'H&M',
    material: 'Polyester Chiffon'
  },
  {
    id: 'luxe-5',
    name: 'Minimalist Tech Knit Sneakers',
    category: 'Men',
    price: 280,
    originalPrice: 350,
    discount: 20,
    rating: 4.8,
    reviewsCount: 156,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#ffffff', '#18181B', '#3B82F6'],
    sizes: ['8', '9', '10', '11', '12'],
    description: 'Combining high-performance tech knit fabric with modern architectural outsoles, these sneakers deliver maximum luxury comfort and a striking urban aesthetic.',
    details: [
      'Seamless engineered knit upper',
      'Ultra-lightweight shock absorbing sole',
      'Ortholite memory foam insole',
      'Slip-on design with decorative laces',
      'Eco-friendly recycled materials'
    ],
    inStock: true,
    trending: false,
    featured: true,
    bestSeller: false,
    tag: 'Eco-Luxe',
    fabric: 'Knit',
    occasion: 'Sports',
    brand: 'Nike',
    material: 'Engineered Knit'
  },
  {
    id: 'luxe-6',
    name: 'Asymmetric Tailored Blazer',
    category: 'Women',
    price: 490,
    originalPrice: 490,
    discount: 0,
    rating: 4.9,
    reviewsCount: 73,
    images: [
      'https://images.unsplash.com/photo-1548624149-f7b2e6ce30ee?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#ffffff', '#111827'],
    sizes: ['S', 'M', 'L'],
    description: 'Sharply tailored with an avant-garde asymmetric front closure, this structured blazer brings a high-fashion edge to modern business casual wardrobes.',
    details: [
      'Premium wool blend construction',
      'Satin-faced peak lapel detail',
      'Structured power shoulders',
      'Single button offset fastening',
      'Tailored close fit'
    ],
    inStock: true,
    trending: true,
    featured: true,
    bestSeller: false,
    tag: 'Editor Choice',
    fabric: 'Wool',
    occasion: 'Formal',
    brand: 'Gucci',
    material: 'Premium Wool Blend'
  },
  {
    id: 'luxe-7',
    name: 'Kids Gold Dust Linen Jumpsuit',
    category: 'Kids',
    price: 110,
    originalPrice: 150,
    discount: 26,
    rating: 4.5,
    reviewsCount: 39,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#D4AF37', '#ffffff'],
    sizes: ['4Y', '6Y', '8Y', '10Y'],
    description: 'A playful yet premium linen jumpsuit complete with subtle gold thread details. Breathable and gentle on delicate skin, perfect for summer celebrations.',
    details: [
      '80% French flax linen, 20% organic cotton',
      'Elasticated waist for absolute comfort',
      'Adjustable button shoulder straps',
      'Easy front patch pockets',
      'Hypoallergenic material'
    ],
    inStock: true,
    trending: false,
    featured: false,
    bestSeller: false,
    tag: 'Sale',
    fabric: 'Linen',
    occasion: 'Casual',
    brand: 'H&M',
    material: 'French Flax Linen Blend'
  },
  {
    id: 'luxe-8',
    name: 'Luxury Velvet Varsity Jacket',
    category: 'Kids',
    price: 190,
    originalPrice: 190,
    discount: 0,
    rating: 4.8,
    reviewsCount: 22,
    images: [
      'https://images.unsplash.com/photo-1622398928616-47629befafd0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop&q=80'
    ],
    colors: ['#111827', '#EC4899'],
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    description: 'Combining retro varsity design with high-end royal velvet fabric. Featuring exquisite gold embroidery details that add a splash of premium charm.',
    details: [
      'Ultra soft luxury velvet body',
      'Ribbed collar, cuffs, and hem',
      'Glossy press-stud buttons',
      'Embroidered brand logo',
      'Lightly padded interior'
    ],
    inStock: false,
    trending: false,
    featured: false,
    bestSeller: true,
    tag: 'Out of Stock',
    fabric: 'Velvet',
    occasion: 'Casual',
    brand: 'Adidas',
    material: 'Royal Velvet'
  }
];

export const BRANDS = ['Gucci', 'Zara', 'H&M', 'Nike', 'Adidas', 'Prada', 'Balenciaga'];
export const CATEGORIES = ['New Arrivals', 'Men', 'Women', 'Kids', 'Sale'];
