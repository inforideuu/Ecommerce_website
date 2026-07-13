import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { BRANDS, CATEGORIES } from '../data/products';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import './Search.css';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch products & brands
  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(err => console.error('Failed to fetch products:', err));

    fetch('http://localhost:8000/api/admin/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbBrands(data);
        }
      })
      .catch(err => console.error('Failed to fetch brands:', err));
  }, []);

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Search query
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    // Categories filter (Special handle for 'New Arrivals' and 'Sale')
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        return selectedCategories.some(cat => {
          if (cat === 'New Arrivals') return p.tag === 'New' || p.trending;
          if (cat === 'Sale') return p.discount > 0 || p.tag === 'Sale';
          return p.category.toLowerCase() === cat.toLowerCase();
        });
      });
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    result = result.filter(p => p.price <= priceRange);

    // Sizes filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    // Colors filter (using hex match)
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors.some(c => selectedColors.includes(c)));
    }

    // Fabric filter
    if (selectedFabric) {
      result = result.filter(p => p.fabric.toLowerCase() === selectedFabric.toLowerCase());
    }

    // Occasion filter
    if (selectedOccasion) {
      result = result.filter(p => p.occasion.toLowerCase() === selectedOccasion.toLowerCase());
    }

    // Sorting
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'discount') {
      result.sort((a, b) => b.discount - a.discount);
    }

    setFilteredProducts(result);
  }, [
    products,
    queryParam,
    selectedCategories,
    selectedBrands,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedFabric,
    selectedOccasion,
    sortOption
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange(1500);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabric('');
    setSelectedOccasion('');
    setSearchParams({});
  };

  // Distinct properties in data for select inputs
  const fabrics = Array.from(new Set(products.map(p => p.fabric).filter(Boolean)));
  const occasions = Array.from(new Set(products.map(p => p.occasion).filter(Boolean)));
  // Color palette set
  const allColors = Array.from(new Set(products.flatMap(p => p.colors || []).filter(Boolean)));
  const activeBrandsList = dbBrands.length > 0 ? dbBrands.map(b => b.name) : BRANDS;

  return (
    <div className="search-page-container container">
      {/* Search Result Title */}
      <div className="search-page-header">
        <div>
          <h1 className="serif-text">
            {queryParam ? `Search Results for "${queryParam}"` : 'Explore Our Collections'}
          </h1>
          <p className="results-count">{filteredProducts.length} Premium items found</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-filter-toggle glass-panel" onClick={() => setIsSidebarOpen(true)}>
            <SlidersHorizontal size={18} /> Filters
          </button>
          
          <div className="sort-wrapper glass-panel">
            <ArrowUpDown size={16} />
            <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="discount">Sale: Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="search-body-layout">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar glass-panel ${isSidebarOpen ? 'sidebar-active' : ''}`}>
          <div className="sidebar-header">
            <h3>Refine Collection</h3>
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close filters">
              <X size={20} />
            </button>
          </div>

          <div className="sidebar-scrollable-body">
            {/* Categories */}
            <div className="filter-section">
              <h4>Category</h4>
              <div className="filter-checkboxes">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="filter-section">
              <h4>Brands</h4>
              <div className="filter-checkboxes">
                {activeBrandsList.map(br => (
                  <label key={br} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(br)}
                      onChange={() => toggleBrand(br)}
                    />
                    <span>{br}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="filter-section">
              <h4>Max Price: <span className="text-gold">₹{priceRange}</span></h4>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="price-slider"
              />
              <div className="price-labels">
                <span>₹50</span>
                <span>₹1500</span>
              </div>
            </div>

            {/* Sizes */}
            <div className="filter-section">
              <h4>Sizes</h4>
              <div className="sizes-grid-filter">
                {['XS', 'S', 'M', 'L', 'XL', '8', '9', '10', '11', '12', '4Y', '6Y', '8Y', '10Y'].map(sz => (
                  <button
                    key={sz}
                    className={`size-filter-btn ${selectedSizes.includes(sz) ? 'filter-active' : ''}`}
                    onClick={() => toggleSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="filter-section">
              <h4>Color Swatches</h4>
              <div className="colors-grid-filter">
                {allColors.map(col => (
                  <button
                    key={col}
                    className={`color-filter-btn ${selectedColors.includes(col) ? 'color-filter-active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => toggleColor(col)}
                    aria-label={`Filter color ${col}`}
                  />
                ))}
              </div>
            </div>

            {/* Fabrics */}
            <div className="filter-section">
              <h4>Fabric</h4>
              <select
                value={selectedFabric}
                onChange={e => setSelectedFabric(e.target.value)}
                className="select-filter"
              >
                <option value="">All Fabrics</option>
                {fabrics.map(fab => (
                  <option key={fab} value={fab}>{fab}</option>
                ))}
              </select>
            </div>

            {/* Occasion */}
            <div className="filter-section">
              <h4>Occasion</h4>
              <select
                value={selectedOccasion}
                onChange={e => setSelectedOccasion(e.target.value)}
                className="select-filter"
              >
                <option value="">All Occasions</option>
                {occasions.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <button onClick={clearAllFilters} className="btn-premium btn-premium-secondary w-full mt-4">
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="search-results-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-results-box text-center">
              <h3 className="serif-text mb-2">No Matching Garments</h3>
              <p className="text-secondary mb-4">Refine your tags or filters to explore alternative luxury lines.</p>
              <button onClick={clearAllFilters} className="btn-premium btn-premium-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid-layout">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
