import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  SlidersHorizontal, ChevronRight, Star, 
  RotateCcw, Sliders, X 
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import './ProductsListing.css';
import { API_BASE_URL } from '../config';

export const ProductsListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gender = searchParams.get('gender') || 'men';
  const subcategory = searchParams.get('subcategory') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Drawer status for Mobile filters
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbBrands(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch Products based on URL query
  useEffect(() => {
    setLoading(true);
    const url = `${API_BASE_URL}/api/products?gender=${gender}&subcategory=${subcategory}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch PLP products:', err);
        setLoading(false);
      });
  }, [gender, subcategory]);

  // Extract unique brands, sizes, colors, and materials from the fetched dataset for dynamic filters
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const uniqueMaterials = ['Silk', 'Cotton', 'Linen', 'Wool', 'Cashmere', 'Polyester'];
  const uniqueFits = ['Slim Fit', 'Regular Fit', 'Casual Fit', 'Oversized'];
  
  // Reset all filters
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setPriceRange(15000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedFits([]);
    setMinRating(0);
    setMinDiscount(0);
    setOnlyInStock(false);
    setSortBy('newest');
  };

  // Toggle filter arrays
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]);
  };

  const handleFitToggle = (fit: string) => {
    setSelectedFits(prev => prev.includes(fit) ? prev.filter(f => f !== fit) : [...prev, fit]);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    // Brand Filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
    
    // Price Range Filter
    if (p.price > priceRange) return false;
    
    // Size Filter
    if (selectedSizes.length > 0 && !p.sizes.some(s => selectedSizes.includes(s))) return false;
    
    // Color Filter
    if (selectedColors.length > 0 && !p.colors.some(c => selectedColors.includes(c))) return false;

    // Material Filter
    if (selectedMaterials.length > 0) {
      const desc = (p.description || '').toLowerCase();
      if (!selectedMaterials.some(m => desc.includes(m.toLowerCase()))) return false;
    }

    // Fit Filter
    if (selectedFits.length > 0) {
      const desc = (p.description || '').toLowerCase();
      if (!selectedFits.some(f => desc.includes(f.toLowerCase()))) return false;
    }

    // Rating Filter
    if (p.rating < minRating) return false;

    // Discount Filter
    if (p.discount < minDiscount) return false;

    // Stock Filter
    if (onlyInStock && !p.inStock) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return b.discount - a.discount;
    if (sortBy === 'popularity') return (b.rating * b.price) - (a.rating * a.price); // Mock popularity formula
    return b.id.localeCompare(a.id); // Newest / Default
  });

  return (
    <div className="plp-page">
      <div className="container">
        
        {/* 1. Breadcrumbs */}
        <div className="plp-breadcrumbs">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/products?gender=${gender}`} className="capitalize">{gender}</Link>
          {subcategory && (
            <>
              <ChevronRight size={12} />
              <span className="capitalize active-crumb">{subcategory.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>

        {/* 2. Page Title Header */}
        <div className="plp-header-row">
          <div>
            <h1 className="serif-text capitalize">
              {gender}'s {subcategory ? subcategory.replace(/-/g, ' ') : 'Collection'}
            </h1>
            <p className="plp-count">
              {loading ? 'Discovering garments...' : `${filteredProducts.length} items found`}
            </p>
          </div>

          <div className="plp-controls-right">
            <button className="mobile-filter-trigger btn-secondary" onClick={() => setIsMobileFiltersOpen(true)}>
              <SlidersHorizontal size={14} /> Filter
            </button>

            <div className="plp-sort-wrapper">
              <span className="sort-label">Sort By:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="newest">Newest Arrivals</option>
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Main Split Grid */}
        <div className="plp-layout-grid">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className={`plp-filters-sidebar ${isMobileFiltersOpen ? 'mobile-sidebar-active' : ''}`}>
            <div className="sidebar-header-row">
              <h3>Filters</h3>
              <button className="reset-all-btn" onClick={handleResetFilters}>
                <RotateCcw size={12} /> Reset All
              </button>
              {isMobileFiltersOpen && (
                <button className="close-mobile-filters-btn" onClick={() => setIsMobileFiltersOpen(false)}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Section: Availability */}
            <div className="filter-section">
              <h4>Availability</h4>
              <label className="checkbox-label-row">
                <input 
                  type="checkbox" 
                  checked={onlyInStock} 
                  onChange={e => setOnlyInStock(e.target.checked)} 
                />
                <span>Exclude Out of Stock</span>
              </label>
            </div>

            {/* Filter Section: Price Range */}
            <div className="filter-section">
              <h4>Max Price (₹{priceRange})</h4>
              <input 
                type="range" 
                min={500} 
                max={15000} 
                step={500} 
                value={priceRange} 
                onChange={e => setPriceRange(Number(e.target.value))} 
                className="price-slider-bar"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>₹500</span>
                <span>₹15,000</span>
              </div>
            </div>

            {/* Filter Section: Brand */}
            {uniqueBrands.length > 0 && (
              <div className="filter-section">
                <h4>Brand</h4>
                <div className="filter-options-stack">
                  {uniqueBrands.map(b => (
                    <label key={b} className="checkbox-label-row">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(b)} 
                        onChange={() => handleBrandToggle(b)} 
                      />
                      <span>
                        {b}
                        {dbBrands.find((br: any) => br.name === b)?.featured && (
                          <span style={{ color: 'var(--accent-gold)', marginLeft: '4px' }} title="Featured House">★</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Section: Sizes */}
            <div className="filter-section">
              <h4>Size</h4>
              <div className="filter-sizes-grid">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                  <button 
                    key={sz} 
                    className={`size-filter-chip ${selectedSizes.includes(sz) ? 'active' : ''}`}
                    onClick={() => handleSizeToggle(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section: Colors */}
            <div className="filter-section">
              <h4>Color Palette</h4>
              <div className="filter-colors-grid">
                {['#ffffff', '#000000', '#ff0000', '#0000ff', '#008000', '#ffff00', '#ffd700', '#808080', '#e5e7eb'].map(col => (
                  <button 
                    key={col} 
                    className={`color-filter-swatch ${selectedColors.includes(col) ? 'active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => handleColorToggle(col)}
                    aria-label={`Filter color ${col}`}
                  />
                ))}
              </div>
            </div>

            {/* Filter Section: Material */}
            <div className="filter-section">
              <h4>Material</h4>
              <div className="filter-options-stack">
                {uniqueMaterials.map(m => (
                  <label key={m} className="checkbox-label-row">
                    <input 
                      type="checkbox" 
                      checked={selectedMaterials.includes(m)} 
                      onChange={() => handleMaterialToggle(m)} 
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Fit */}
            <div className="filter-section">
              <h4>Silhouette Fit</h4>
              <div className="filter-options-stack">
                {uniqueFits.map(f => (
                  <label key={f} className="checkbox-label-row">
                    <input 
                      type="checkbox" 
                      checked={selectedFits.includes(f)} 
                      onChange={() => handleFitToggle(f)} 
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Minimum Rating */}
            <div className="filter-section">
              <h4>Minimum Rating</h4>
              <div className="filter-options-stack">
                {[4, 3, 2].map(stars => (
                  <button 
                    key={stars} 
                    className={`rating-filter-row ${minRating === stars ? 'active' : ''}`}
                    onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  >
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < stars ? 'var(--accent-gold)' : 'none'} color={i < stars ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                      ))}
                    </div>
                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section: Minimum Discount */}
            <div className="filter-section" style={{ borderBottom: 'none' }}>
              <h4>Offers & Discounts</h4>
              <div className="filter-options-stack">
                {[10, 20, 30, 50].map(disc => (
                  <label key={disc} className="checkbox-label-row">
                    <input 
                      type="radio" 
                      name="discount" 
                      checked={minDiscount === disc} 
                      onChange={() => setMinDiscount(disc)} 
                    />
                    <span>{disc}% and above</span>
                  </label>
                ))}
                {minDiscount > 0 && (
                  <button onClick={() => setMinDiscount(0)} className="reset-all-btn" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>
                    Clear Discount Filter
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT GRID: PRODUCTS */}
          <main className="plp-products-grid-column">
            {loading ? (
              // Loading Skeleton Blocks
              <div className="plp-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="plp-skeleton-card">
                    <div className="skeleton-image-box" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line long" />
                    <div className="skeleton-line medium" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              // Actual Product Cards
              <div className="plp-grid">
                {filteredProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onQuickView={setSelectedQuickView} 
                  />
                ))}
              </div>
            ) : (
              // Empty State Illustration
              <div className="plp-empty-state glass-card">
                <Sliders size={48} style={{ color: 'var(--accent-gold)', marginBottom: '16px' }} />
                <h3>No Matching Garments Found</h3>
                <p>Try refining your filters or resetting size options to browse the collection.</p>
                <button className="btn-primary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {selectedQuickView && (
        <QuickViewModal 
          product={selectedQuickView} 
          onClose={() => setSelectedQuickView(null)} 
        />
      )}
    </div>
  );
};
export default ProductsListing;
