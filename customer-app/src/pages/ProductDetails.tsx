import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Mail, Share2, Ruler } from 'lucide-react';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import './ProductDetails.css';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`https://ecommerce-website-hvuy.onrender.com/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        
        // Fetch reviews
        fetch(`https://ecommerce-website-hvuy.onrender.com/api/products/${id}/reviews`)
          .then(res => res.json())
          .then(revs => { if (Array.isArray(revs)) setReviewsList(revs); })
          .catch(err => console.error(err));

        return fetch(`https://ecommerce-website-hvuy.onrender.com/api/products?category=${data.category}`);
      })
      .then(res => res ? res.json() : [])
      .then(allCategoryProducts => {
        if (Array.isArray(allCategoryProducts)) {
          setRelatedProducts(allCategoryProducts.filter((p: any) => p.id !== id).slice(0, 4));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container product-not-found text-center">
        <h2 className="serif-text">Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-not-found text-center">
        <h2 className="serif-text">Product Not Found</h2>
        <p className="text-secondary mb-4">The luxury piece you are looking for does not exist or has been archived.</p>
        <Link to="/" className="btn-premium btn-premium-primary">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity, selectedColor, selectedSize);
    alert(`${product.name} added to your bag!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard!');
  };

  const isWishlisted = isInWishlist(product.id);

  // Zoom effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  // Related products loaded dynamically via state hook

  return (
    <div className="product-details-page container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to={`/search?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
      </div>

      <div className="details-grid">
        {/* Gallery */}
        <div className="details-gallery">
          <div
            className="main-image-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
              className="details-main-img"
              style={zoomStyle}
            />
          </div>

          <div className="thumbnail-carousel">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                className={`thumb-btn ${activeImageIdx === idx ? 'thumb-active' : ''}`}
                onClick={() => setActiveImageIdx(idx)}
              >
                <img src={img} alt={`thumb ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="details-info-container">
          <span className="info-brand">{product.brand}</span>
          <h1 className="serif-text info-title">{product.name}</h1>

          <div className="info-rating-row">
            <div className="stars-box">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none'}
                  color="var(--accent-gold)"
                />
              ))}
              <span>{product.rating}</span>
            </div>
            <span className="reviews-count-text">({product.reviewsCount} verified clients)</span>
          </div>

          <div className="info-price-box">
            <span className="info-price">₹{product.price}</span>
            {product.discount > 0 && (
              <>
                <span className="info-original-price">₹{product.originalPrice}</span>
                <span className="info-discount-badge">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p className="info-description">{product.description}</p>

          {/* Selection Panels */}
          <div className="info-selections">
            {/* Colors */}
            <div className="selection-item">
              <div className="selection-header-row">
                <h4>Select Color</h4>
                <span className="selected-value-label">Current: <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{selectedColor}</span></span>
              </div>
              <div className="colors-swatch-list">
                {product.colors.map(col => (
                  <button
                    key={col}
                    className={`color-swatch-lg ${selectedColor === col ? 'swatch-active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => setSelectedColor(col)}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="selection-item">
              <div className="selection-header-row">
                <h4>Select Size</h4>
                <button className="size-guide-btn" onClick={() => setIsSizeGuideOpen(true)}>
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              <div className="sizes-btn-list">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    className={`size-tag-btn ${selectedSize === sz ? 'size-tag-active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="selection-item">
              <h4>Quantity</h4>
              <div className="quantity-spinner-box">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="actions-button-row">
            <button
              className="btn-premium btn-premium-primary flex-1 py-4"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag size={20} /> {product.inStock ? 'Add to Shopping Bag' : 'Out of Stock'}
            </button>

            <button
              className={`wishlist-toggle-btn ${isWishlisted ? 'wishlisted' : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-label="Add to Wishlist"
            >
              <Heart size={20} fill={isWishlisted ? 'var(--accent-rose)' : 'none'} />
            </button>
          </div>

          {/* Sharing */}
          <div className="extra-action-links">
            <button onClick={handleShare} className="icon-link-btn"><Share2 size={16} /> Share Garment</button>
            <button className="icon-link-btn"><Mail size={16} /> Ask Concierge</button>
          </div>

          {/* Guarantees */}
          <div className="guarantees-stack">
            <div className="guarantee-row">
              <Truck size={18} className="text-gold" />
              <div>
                <h5>Complimentary Signature Shipping</h5>
                <p>Delivered inside custom garment box within 3-5 business days.</p>
              </div>
            </div>
            <div className="guarantee-row">
              <RotateCcw size={18} className="text-gold" />
              <div>
                <h5>Hassle-Free Doorstep Exchanges</h5>
                <p>30 days complimentary pick up from your address.</p>
              </div>
            </div>
            <div className="guarantee-row">
              <ShieldCheck size={18} className="text-gold" />
              <div>
                <h5>Crafted Authentication</h5>
                <p>Accompanied by an individual digital authenticity certificate.</p>
              </div>
            </div>
          </div>

          {/* Product Details Accordeon */}
          <div className="product-specifications">
            <h3>Garment Specifications</h3>
            <ul>
              {product.details.map((det, idx) => (
                <li key={idx}>{det}</li>
              ))}
              <li>Material: <span>{product.material}</span></li>
              <li>Occasion mapping: <span>{product.occasion}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Client Reviews Section */}
      <section className="client-reviews-section" style={{ marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '40px', marginBottom: '40px' }}>
        <h2 className="serif-text text-center" style={{ marginBottom: '24px' }}>Client Reviews</h2>
        
        {reviewsList.length === 0 ? (
          <p className="text-secondary text-center">No reviews have been logged for this luxury piece yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {reviewsList.map((rev, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1rem' }}>{rev.customerName}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: 'var(--accent-gold)' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'var(--accent-gold)' : 'none'}
                        color="var(--accent-gold)"
                        style={{ display: 'inline-block', marginRight: '2px' }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ Verified Purchase
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{rev.reviewText}</p>
                
                {rev.photos && rev.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {rev.photos.map((pUrl: string, pIdx: number) => (
                      <img key={pIdx} src={pUrl} alt="Review attachment" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    ))}
                  </div>
                )}
                
                {rev.video && (
                  <div style={{ marginTop: '10px' }}>
                    <video src={rev.video} controls style={{ maxWidth: '100%', height: '150px', borderRadius: '6px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2 className="serif-text section-title text-center">Frequently Bought Together</h2>
          <div className="products-grid-layout">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={() => { }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className="sizeguide-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="sizeguide-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header">
              <h3 className="serif-text">zenelait Size Guide</h3>
              <button onClick={() => setIsSizeGuideOpen(false)}>Close</button>
            </div>
            <table className="sizeguide-table">
              <thead>
                <tr>
                  <th>International Size</th>
                  <th>Chest (in)</th>
                  <th>Waist (in)</th>
                  <th>Hips (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>32-34</td><td>26-28</td><td>34-36</td></tr>
                <tr><td>S</td><td>34-36</td><td>28-30</td><td>36-38</td></tr>
                <tr><td>M</td><td>38-40</td><td>32-34</td><td>40-42</td></tr>
                <tr><td>L</td><td>42-44</td><td>36-38</td><td>44-46</td></tr>
                <tr><td>XL</td><td>46-48</td><td>40-42</td><td>48-50</td></tr>
              </tbody>
            </table>
            <p className="size-guide-hint">All measurements are in inches. If you are between sizes, we recommend selecting the larger size for a relaxed premium drape.</p>
          </div>
        </div>
      )}
    </div>
  );
};
