import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Ticket, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

export const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal, cartTax, cartTotal } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [dbCoupons, setDbCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/coupons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCoupons(data);
      })
      .catch(err => console.error('Failed to load coupons in Cart:', err));
  }, []);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = promoCode.trim();
    if (!enteredCode) return;

    const matchedCoupon = dbCoupons.find(
      c => c.code.toLowerCase() === enteredCode.toLowerCase() && c.status === 'active'
    );

    if (!matchedCoupon) {
      alert('Invalid or expired promo code.');
      return;
    }

    if (cartSubtotal < (matchedCoupon.minPurchase || 0)) {
      alert(`This coupon requires a minimum purchase of ₹${matchedCoupon.minPurchase}.`);
      return;
    }

    if (matchedCoupon.requiredSupercoins > 0) {
      const redeemedStr = localStorage.getItem('customer_redeemed_coupons') || '[]';
      let redeemedList: string[] = [];
      try {
        redeemedList = JSON.parse(redeemedStr);
      } catch (e) {}

      const isRedeemed = redeemedList.some(
        code => code.toLowerCase() === matchedCoupon.code.toLowerCase()
      );
      if (!isRedeemed) {
        alert(`This is a Super Coin coupon! You must redeem it for ${matchedCoupon.requiredSupercoins} Coins in your Rewards dashboard before applying it.`);
        return;
      }
    }

    setDiscountType(matchedCoupon.type as 'percentage' | 'fixed');
    setDiscountValue(matchedCoupon.value);
    setPromoApplied(true);
    alert(`Promo Code ${matchedCoupon.code} applied: ${matchedCoupon.type === 'percentage' ? `${matchedCoupon.value}%` : `₹${matchedCoupon.value}`} discount!`);
  };

  const shippingCost = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 35;
  const discountAmount = discountType === 'percentage' 
    ? Math.round(cartSubtotal * (discountValue / 100))
    : discountValue;
  const finalTotal = cartTotal + shippingCost - discountAmount;

  return (
    <div className="cart-page-container container">
      <h1 className="serif-text cart-title">Your Shopping Bag</h1>
      <p className="cart-subtitle">Review your luxury collection before final checkout.</p>

      {cartItems.length === 0 ? (
        <div className="empty-cart-page text-center glass-panel">
          <Sparkles size={48} className="text-gold mb-4 animate-float" />
          <h2 className="serif-text mb-2">Your Bag is Empty</h2>
          <p className="text-secondary mb-4">Explore our collections to add signature designer garments.</p>
          <Link to="/search" className="btn-premium btn-premium-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Items List */}
          <div className="cart-items-column">
            {cartItems.map((item, idx) => (
              <div key={idx} className="cart-page-item glass-panel">
                <img src={item.product.images[0]} alt={item.product.name} className="cart-page-item-img" />
                
                <div className="cart-page-item-info">
                  <span className="item-brand">{item.product.brand}</span>
                  <h3 className="serif-text"><Link to={`/product/${item.product.id}`}>{item.product.name}</Link></h3>
                  
                  <div className="item-specifications">
                    <p>Size: <span>{item.selectedSize}</span></p>
                    <p>Color: <span className="color-swatch-sm" style={{ backgroundColor: item.selectedColor }} /></p>
                  </div>

                  <div className="qty-spinner-mini">
                    <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="cart-page-item-pricing">
                  <p className="item-total-price">₹{item.product.price * item.quantity}</p>
                  <p className="item-unit-price">₹{item.product.price} each</p>
                  
                  <button
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} /> <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Panel */}
          <div className="cart-summary-column">
            <div className="summary-card glass-panel">
              <h3 className="serif-text">Order Summary</h3>
              
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Bag Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>₹{cartTax}</span>
                </div>

                <div className="summary-row">
                  <span>Signature Packaging & Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-gold">Complimentary</span> : `₹${shippingCost}`}</span>
                </div>

                {promoApplied && (
                  <div className="summary-row promo-row text-gold">
                    <span>Private Discount ({discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="summary-row total-row">
                  <span>Total Due</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Promo Code box */}
              <form onSubmit={applyPromo} className="promo-form">
                <Ticket size={16} className="text-muted" />
                <input
                  type="text"
                  placeholder="Enter Promo Code (e.g. LuxeVIP)"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button type="submit" disabled={promoApplied}>
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </form>

              <button
                className="btn-premium btn-premium-primary w-full mt-4"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>

            <div className="checkout-trust-badge">
              <ShieldCheck size={20} className="text-gold" />
              <span>Checkout is completely encrypted and secure.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
