import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import './QuickViewModal.css';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  // Set default swatches once loaded
  if (!selectedColor && product.colors.length > 0) setSelectedColor(product.colors[0]);
  if (!selectedSize && product.sizes.length > 0) setSelectedSize(product.sizes[0]);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity, selectedColor, selectedSize);
    alert(`${product.name} added to cart!`);
    onClose();
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal glass-panel" onClick={e => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <div className="quickview-grid">
          <div className="quickview-gallery">
            <img src={product.images[0]} alt={product.name} className="quickview-main-img" />
          </div>

          <div className="quickview-details">
            <span className="quickview-brand">{product.brand}</span>
            <h2 className="serif-text">{product.name}</h2>
            
            <div className="quickview-rating-row">
              <div className="quickview-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none'}
                    color="var(--accent-gold)"
                  />
                ))}
                <span>{product.rating}</span>
              </div>
              <span className="quickview-reviews-count">({product.reviewsCount} reviews)</span>
            </div>

            <div className="quickview-price-box">
              <span className="quickview-price">₹{product.price}</span>
              {product.discount > 0 && (
                <>
                  <span className="quickview-original">₹{product.originalPrice}</span>
                  <span className="quickview-discount">{product.discount}% OFF</span>
                </>
              )}
            </div>

            <p className="quickview-desc">{product.description}</p>

            {/* Color Select */}
            <div className="selection-group">
              <h4>Color</h4>
              <div className="color-swatches-row">
                {product.colors.map(col => (
                  <button
                    key={col}
                    className={`color-swatch-large ${selectedColor === col ? 'swatch-active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => setSelectedColor(col)}
                  />
                ))}
              </div>
            </div>

            {/* Size Select */}
            <div className="selection-group">
              <h4>Size</h4>
              <div className="sizes-row">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    className={`size-btn ${selectedSize === sz ? 'size-active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="selection-group">
              <h4>Quantity</h4>
              <div className="quantity-row">
                <div className="qty-spinner">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="quickview-actions">
              <button
                className="btn-premium btn-premium-primary flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag size={18} /> {product.inStock ? 'Add to Bag' : 'Sold Out'}
              </button>
              
              <button
                className={`wishlist-btn-large ${isWishlisted ? 'wishlist-active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <Heart size={20} fill={isWishlisted ? 'var(--accent-rose)' : 'none'} />
              </button>
            </div>

            <div className="more-details-link">
              <a href={`/product/${product.id}`} className="flex-center gap-4">
                View Full Details <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
