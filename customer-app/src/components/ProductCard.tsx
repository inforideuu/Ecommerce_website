import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize] = useState(product.sizes[0]);

  const hasDiscount = product.discount > 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, 1, selectedColor, selectedSize);
    alert(`${product.name} added to bag!`);
  };

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxRotation = 12; // Max tilt degrees
    const rY = ((x - centerX) / centerX) * maxRotation;
    const rX = -((y - centerY) / centerY) * maxRotation;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const cardStyle = {
    transform: hovered 
      ? `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)` 
      : 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: hovered ? 'transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease' : 'transform 0.6s cubic-bezier(0.2, 1, 0.2, 1)'
  };

  return (
    <div
      className="product-card"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-image-container">
        {/* Badges */}
        <div className="product-badges">
          {!product.inStock && <span className="badge badge-sale">Sold Out</span>}
          {product.inStock && product.limitedEdition && <span className="badge badge-sale" style={{ background: '#000', color: 'var(--accent-gold)' }}>Limited Edition</span>}
          {product.inStock && product.bestSeller && <span className="badge badge-gold">Best Seller</span>}
          {product.inStock && product.newArrival && <span className="badge badge-new">New</span>}
          {product.inStock && !product.limitedEdition && !product.bestSeller && !product.newArrival && product.tag && (
            <span className={`badge ${product.tag === 'Sale' ? 'badge-sale' : product.tag === 'New' ? 'badge-new' : 'badge-gold'}`}>
              {product.tag}
            </span>
          )}
        </div>

        {/* Hover swap image */}
        <Link to={`/product/${product.id}`} className="product-image-link">
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="product-card-img"
          />
        </Link>

        {/* Quick actions overlay */}
        <div className="product-quick-actions">
          <button
            className="action-circle-btn"
            onClick={() => onQuickView(product)}
            title="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            className={`action-circle-btn ${isWishlisted ? 'wishlist-active' : ''}`}
            onClick={() => toggleWishlist(product)}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={18} fill={isWishlisted ? 'var(--accent-rose)' : 'none'} />
          </button>
        </div>

        {/* Hover Quick Add to Cart button */}
        {product.inStock && (
          <button className="quick-add-btn glass-panel" onClick={handleAddToCart}>
            <ShoppingBag size={16} /> Quick Add
          </button>
        )}
      </div>

      <div className="product-info">
        <div className="product-brand-rating">
          <span className="product-brand">{product.brand}</span>
          <div className="product-rating">
            <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>{product.rating}</span>
          </div>
        </div>

        <h3 className="product-title serif-text">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Colors swatches */}
        <div className="product-swatches" onClick={e => e.preventDefault()}>
          {product.colors.map(col => (
            <button
              key={col}
              className={`color-swatch ${selectedColor === col ? 'swatch-active' : ''}`}
              style={{ backgroundColor: col }}
              onClick={() => setSelectedColor(col)}
              aria-label={`Select color ${col}`}
            />
          ))}
        </div>

        <div className="product-price-row">
          <div className="price-box">
            <span className="current-price">₹{product.price}</span>
            {hasDiscount && (
              <>
                <span className="original-price">₹{product.originalPrice}</span>
                <span className="discount-pct">({product.discount}% OFF)</span>
              </>
            )}
          </div>
          
          <div className="sizes-preview">
            {product.sizes.slice(0, 3).map(sz => (
              <span key={sz} className="size-tag">{sz}</span>
            ))}
            {product.sizes.length > 3 && <span className="size-tag-more">+{product.sizes.length - 3}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
