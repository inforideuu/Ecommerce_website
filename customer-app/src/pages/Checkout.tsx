import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, Landmark, Wallet, QrCode, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Checkout.css';

interface CustomerUser {
  name: string;
  email: string;
}

export const Checkout: React.FC = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();

  // Step state: 0 (Auth), 1 (Shipping), 2 (Delivery), 3 (Payment), 4 (Review), 5 (Confirmation)
  const [step, setStep] = useState(0);
  
  // Auth state
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Shipping Form
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    addressType: 'home',
    saveAddress: true
  });

  // Delivery Method state
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'banking' | 'wallet'>('card');
  
  const [upiId, setUpiId] = useState('');
  const [cardForm, setCardForm] = useState({ nameOnCard: '', cardNumber: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  const [placedOrderId, setPlacedOrderId] = useState('');

  // Promo Coupon codes states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Check login state on mount
  useEffect(() => {
    const savedAddrs = localStorage.getItem('customer_addresses');
    if (savedAddrs) {
      try {
        setSavedAddresses(JSON.parse(savedAddrs));
      } catch (e) {}
    }

    const savedUser = localStorage.getItem('customerUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCustomer(parsed);
      setShippingForm(prev => ({
        ...prev,
        firstName: parsed.name.split(' ')[0] || '',
        lastName: parsed.name.split(' ').slice(1).join(' ') || '',
        email: parsed.email
      }));
      setStep(1); // skip Auth
    } else {
      setStep(0); // show Auth
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) return;
    
    // Simulate login / register
    const name = authForm.email.split('@')[0];
    const loggedUser = { name, email: authForm.email };
    
    localStorage.setItem('customerUser', JSON.stringify(loggedUser));
    setCustomer(loggedUser);
    setShippingForm(prev => ({
      ...prev,
      firstName: name.split(' ')[0] || '',
      lastName: name.split(' ').slice(1).join(' ') || '',
      email: authForm.email
    }));
    setStep(1); // Proceed to Shipping
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // Go to Delivery
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Go to Payment
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4); // Go to Review Order
  };

  const [taxRateSetting, setTaxRateSetting] = useState(18); // Default to 18%

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && (data.tax_rate || data.taxRate)) {
          const rateStr = data.tax_rate || data.taxRate;
          const parsedTax = parseFloat(rateStr.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsedTax)) {
            setTaxRateSetting(parsedTax);
          }
        }
      })
      .catch(err => console.error('Error fetching tax settings:', err));
  }, []);

  const deliveryFee = deliveryMethod === 'express' ? 3500 : 0;
  const gstAmount = Math.round((cartSubtotal - couponDiscount) * (taxRateSetting / 100));
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + gstAmount + deliveryFee);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    fetch(`${API_BASE_URL}/api/admin/coupons`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const match = data.find((c: any) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
          if (!match) {
            setCouponError('Invalid campaign code.');
            setAppliedCoupon(null);
            setCouponDiscount(0);
            return;
          }
          if (match.status !== 'active') {
            setCouponError('This campaign has expired.');
            setAppliedCoupon(null);
            setCouponDiscount(0);
            return;
          }
          if (cartSubtotal < match.minPurchase) {
            setCouponError(`Min purchase of ₹${match.minPurchase} required.`);
            setAppliedCoupon(null);
            setCouponDiscount(0);
            return;
          }
          if (match.requiredSupercoins > 0) {
            fetch(`${API_BASE_URL}/api/admin/customers`)
              .then(res => res.json())
              .then(customers => {
                let currentCoins = 0;
                if (Array.isArray(customers)) {
                  const matchCustomer = customers.find((c: any) => c.email.toLowerCase() === shippingForm.email.toLowerCase());
                  if (matchCustomer) {
                    currentCoins = matchCustomer.points || 0;
                    localStorage.setItem('customer_supercoins', currentCoins.toString());
                  } else {
                    const currentCoinsStr = localStorage.getItem('customer_supercoins') || '0';
                    currentCoins = parseInt(currentCoinsStr, 10);
                  }
                }
                
                if (currentCoins < match.requiredSupercoins) {
                  setCouponError(`Insufficient Super Coins. You need ${match.requiredSupercoins} Super Coins to apply this coupon. (You have ${currentCoins})`);
                  setAppliedCoupon(null);
                  setCouponDiscount(0);
                  return;
                }
                
                let discountVal = 0;
                if (match.type === 'percentage') {
                  discountVal = Math.round(cartSubtotal * (match.value / 100));
                } else {
                  discountVal = match.value;
                }
                setAppliedCoupon(match);
                setCouponDiscount(discountVal);
              })
              .catch(err => {
                console.error(err);
                const currentCoinsStr = localStorage.getItem('customer_supercoins') || '0';
                const currentCoins = parseInt(currentCoinsStr, 10);
                if (currentCoins < match.requiredSupercoins) {
                  setCouponError(`Insufficient Super Coins. You need ${match.requiredSupercoins} Super Coins to apply this coupon.`);
                  setAppliedCoupon(null);
                  setCouponDiscount(0);
                  return;
                }
                let discountVal = 0;
                if (match.type === 'percentage') {
                  discountVal = Math.round(cartSubtotal * (match.value / 100));
                } else {
                  discountVal = match.value;
                }
                setAppliedCoupon(match);
                setCouponDiscount(discountVal);
              });
          } else {
            let discountVal = 0;
            if (match.type === 'percentage') {
              discountVal = Math.round(cartSubtotal * (match.value / 100));
            } else {
              discountVal = match.value;
            }
            setAppliedCoupon(match);
            setCouponDiscount(discountVal);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setCouponError('Failed to validate promo code.');
      });
  };

  const handlePlaceOrder = () => {
    const orderId = 'ZEN-' + (Math.floor(Math.random() * 900000) + 100000);
    const orderData = {
      id: orderId,
      customerName: `${shippingForm.firstName} ${shippingForm.lastName}`,
      email: shippingForm.email,
      total: grandTotal,
      itemsCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      deliveryMethod: deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      status: 'pending',
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
        size: item.selectedSize
      }))
    };

    fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // If a Super Coin coupon was used, deduct coins now upon order placement
          if (appliedCoupon && appliedCoupon.requiredSupercoins > 0) {
            const cost = appliedCoupon.requiredSupercoins;
            const currentCoinsStr = localStorage.getItem('customer_supercoins') || '0';
            const currentCoins = parseInt(currentCoinsStr, 10);
            const nextCoins = Math.max(0, currentCoins - cost);
            
            // Save to localStorage
            localStorage.setItem('customer_supercoins', nextCoins.toString());

            // Save to backend database
            fetch(`${API_BASE_URL}/api/admin/customers`)
              .then(res => res.json())
              .then(custs => {
                if (Array.isArray(custs)) {
                  const match = custs.find((c: any) => c.email.toLowerCase() === shippingForm.email.toLowerCase());
                  if (match) {
                    fetch(`${API_BASE_URL}/api/admin/customers/${match.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        points: nextCoins,
                        ordersCount: match.ordersCount,
                        status: match.status
                      })
                    }).catch(err => console.error(err));
                  }
                }
              });
          }

          if (shippingForm.saveAddress) {
            const savedStr = localStorage.getItem('customer_addresses') || '[]';
            let currentAddrs = [];
            try {
              currentAddrs = JSON.parse(savedStr);
            } catch(e) {}
            
            const fullAddressDetails = `${shippingForm.address}, ${shippingForm.city}, ${shippingForm.state}, ${shippingForm.postalCode}, ${shippingForm.country}`;
            const exists = currentAddrs.some((a: any) => a.details.toLowerCase() === fullAddressDetails.toLowerCase());
            
            if (!exists) {
              const newAddrObj = {
                id: Date.now().toString(),
                type: shippingForm.addressType.toUpperCase(),
                name: `${shippingForm.firstName} ${shippingForm.lastName}`,
                phone: shippingForm.phone,
                street: shippingForm.address,
                city: shippingForm.city,
                state: shippingForm.state,
                pincode: shippingForm.postalCode,
                country: shippingForm.country,
                details: fullAddressDetails
              };
              currentAddrs.push(newAddrObj);
              localStorage.setItem('customer_addresses', JSON.stringify(currentAddrs));
            }
          }

          setPlacedOrderId(orderId);
          setStep(5);
          clearCart();
        } else {
          alert('Failed to place order: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Error submitting order:', err);
        // Fallback mock check
        setPlacedOrderId(orderId);
        setStep(5);
        clearCart();
      });
  };

  if (cartItems.length === 0 && step < 5) {
    return (
      <div className="container text-center py-8">
        <h2 className="serif-text">Your Cart is Empty</h2>
        <p className="text-secondary mb-4">Please add items to your cart before checking out.</p>
        <Link to="/search" className="btn-premium btn-premium-primary">Shop Our Collections</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-container container">
      {/* Checkout steps indicator */}
      {step < 5 && (
        <div className="checkout-steps-indicator" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto 40px auto', overflowX: 'auto', padding: '10px 0' }}>
          <div className={`step-node ${step >= 0 ? 'node-active' : ''}`} onClick={() => customer && setStep(0)}>
            <span className="node-num">1</span>
            <span>Identity</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step-node ${step >= 1 ? 'node-active' : ''}`} onClick={() => customer && step > 1 && setStep(1)}>
            <span className="node-num">2</span>
            <span>Shipping</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step-node ${step >= 2 ? 'node-active' : ''}`} onClick={() => customer && step > 2 && setStep(2)}>
            <span className="node-num">3</span>
            <span>Delivery</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step-node ${step >= 3 ? 'node-active' : ''}`} onClick={() => customer && step > 3 && setStep(3)}>
            <span className="node-num">4</span>
            <span>Payment</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step-node ${step >= 4 ? 'node-active' : ''}`} onClick={() => customer && step > 4 && setStep(4)}>
            <span className="node-num">5</span>
            <span>Review</span>
          </div>
        </div>
      )}

      {/* Step 0: Auth Gateway */}
      {step === 0 && (
        <div className="checkout-layout" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="checkout-main-column glass-panel" style={{ width: '100%' }}>
            <h2 className="serif-text text-center">Client Checkout</h2>
            <p className="text-secondary text-center mb-4">Enter email address and password to continue to shipping address.</p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="superadmin@gmail.com"
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-premium btn-premium-primary w-full mt-2">
                Continue to Shipping
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 1: Shipping Address */}
      {step === 1 && (
        <div className="checkout-layout">
          <form onSubmit={handleShippingSubmit} className="checkout-main-column glass-panel">
            <h2 className="serif-text">Shipping Address</h2>
            
            {savedAddresses.length > 0 && (
              <div className="saved-addresses-selector" style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '0.9rem' }}>Use Saved Address</h4>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      className="glass-panel"
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'left',
                        minWidth: '200px',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem'
                      }}
                      onClick={() => {
                        const nameParts = (addr.name || '').split(' ');
                        const fName = nameParts[0] || '';
                        const lName = nameParts.slice(1).join(' ') || '';
                        
                        let streetAddr = addr.details || '';
                        let cityVal = '';
                        let stateVal = '';
                        let postVal = '';
                        let countryVal = 'India';
                        
                        const parts = (addr.details || '').split(',').map((s: string) => s.trim());
                        if (parts.length >= 4) {
                          countryVal = parts.pop() || 'India';
                          postVal = parts.pop() || '';
                          stateVal = parts.pop() || '';
                          cityVal = parts.pop() || '';
                          streetAddr = parts.join(', ');
                        }
                        
                        setShippingForm(prev => ({
                          ...prev,
                          firstName: fName,
                          lastName: lName,
                          phone: addr.phone || '',
                          address: addr.street || streetAddr,
                          city: addr.city || cityVal,
                          state: addr.state || stateVal,
                          postalCode: addr.pincode || postVal,
                          country: addr.country || countryVal,
                          addressType: (addr.type || 'home').toLowerCase()
                        }));
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontSize: '0.75rem' }}>{addr.type}</strong>
                      <span style={{ display: 'block', fontWeight: 'bold' }}>{addr.name}</span>
                      <span style={{ display: 'block', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.street ? `${addr.street}, ${addr.city}, ${addr.state}, ${addr.pincode}, ${addr.country}` : addr.details}</span>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>{addr.phone}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="form-grid-2">
              <div className="input-group">
                <label>First Name *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.firstName}
                  onChange={e => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.lastName}
                  onChange={e => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  value={shippingForm.email}
                  onChange={e => setShippingForm({ ...shippingForm, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={shippingForm.phone}
                  onChange={e => setShippingForm({ ...shippingForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Address Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Block B, Gold Crest"
                value={shippingForm.address}
                onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Near City Mall"
                value={shippingForm.landmark}
                onChange={e => setShippingForm({ ...shippingForm, landmark: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.city}
                  onChange={e => setShippingForm({ ...shippingForm, city: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>State *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.state}
                  onChange={e => setShippingForm({ ...shippingForm, state: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.postalCode}
                  onChange={e => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Country *</label>
                <input
                  type="text"
                  required
                  value={shippingForm.country}
                  onChange={e => setShippingForm({ ...shippingForm, country: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Address Type</label>
              <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="addressType"
                    value="home"
                    checked={shippingForm.addressType === 'home'}
                    onChange={() => setShippingForm({ ...shippingForm, addressType: 'home' })}
                  />
                  Home
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="addressType"
                    value="office"
                    checked={shippingForm.addressType === 'office'}
                    onChange={() => setShippingForm({ ...shippingForm, addressType: 'office' })}
                  />
                  Office
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="addressType"
                    value="other"
                    checked={shippingForm.addressType === 'other'}
                    onChange={() => setShippingForm({ ...shippingForm, addressType: 'other' })}
                  />
                  Other
                </label>
              </div>
            </div>



            <button type="submit" className="btn-premium btn-premium-primary w-full mt-4">
              Continue to Delivery Options
            </button>
          </form>

          {/* Right Summary Column */}
          {renderSummaryColumn()}
        </div>
      )}

      {/* Step 2: Delivery Option */}
      {step === 2 && (
        <div className="checkout-layout">
          <form onSubmit={handleDeliverySubmit} className="checkout-main-column glass-panel">
            <h2 className="serif-text">Select Delivery Option</h2>
            <p className="text-secondary mb-4">Choose the shipping speed that matches your presence needs.</p>

            <div className="delivery-methods-row" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label className={`delivery-option-card ${deliveryMethod === 'standard' ? 'option-active' : ''}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  checked={deliveryMethod === 'standard'}
                  onChange={() => setDeliveryMethod('standard')}
                  style={{ width: '18px', height: '18px' }}
                />
                <div className="delivery-meta" style={{ flex: 1 }}>
                  <span className="delivery-title" style={{ display: 'block', fontWeight: 'bold' }}>Standard Signature Delivery</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivered within 3 to 5 business days. Signed by expert handlers.</span>
                </div>
                <span className="delivery-price text-gold" style={{ fontWeight: 'bold' }}>Complimentary</span>
              </label>

              <label className={`delivery-option-card ${deliveryMethod === 'express' ? 'option-active' : ''}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="delivery"
                  value="express"
                  checked={deliveryMethod === 'express'}
                  onChange={() => setDeliveryMethod('express')}
                  style={{ width: '18px', height: '18px' }}
                />
                <div className="delivery-meta" style={{ flex: 1 }}>
                  <span className="delivery-title" style={{ display: 'block', fontWeight: 'bold' }}>Express White-Glove Delivery</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium next-day delivery in customized weather-resistant dust wrappers.</span>
                </div>
                <span className="delivery-price" style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>₹3,500</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button type="button" className="btn-premium btn-premium-secondary" onClick={() => setStep(1)}>
                Back to Address
              </button>
              <button type="submit" className="btn-premium btn-premium-primary flex-1">
                Continue to Payment Method
              </button>
            </div>
          </form>

          {/* Right Summary Column */}
          {renderSummaryColumn()}
        </div>
      )}

      {/* Step 3: Payment Method */}
      {step === 3 && (
        <div className="checkout-layout">
          <form onSubmit={handlePaymentSubmit} className="checkout-main-column glass-panel">
            <h2 className="serif-text">Select Payment Method</h2>
            
            <div className="payment-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div className={`gateway-card ${paymentMethod === 'card' ? 'gateway-active' : ''}`} onClick={() => setPaymentMethod('card')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', gap: '8px' }}>
                <CreditCard size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Credit / Debit</span>
              </div>

              <div className={`gateway-card ${paymentMethod === 'upi' ? 'gateway-active' : ''}`} onClick={() => setPaymentMethod('upi')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', gap: '8px' }}>
                <QrCode size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>UPI Payment</span>
              </div>

              <div className={`gateway-card ${paymentMethod === 'cod' ? 'gateway-active' : ''}`} onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', gap: '8px' }}>
                <Truck size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cash on Delivery</span>
              </div>

              <div className={`gateway-card ${paymentMethod === 'banking' ? 'gateway-active' : ''}`} onClick={() => setPaymentMethod('banking')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', gap: '8px' }}>
                <Landmark size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Net Banking</span>
              </div>

              <div className={`gateway-card ${paymentMethod === 'wallet' ? 'gateway-active' : ''}`} onClick={() => setPaymentMethod('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', gap: '8px' }}>
                <Wallet size={20} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Wallets</span>
              </div>
            </div>

            {/* Payment Fields conditional rendering */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardForm.nameOnCard}
                    onChange={e => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardForm.cardNumber}
                    onChange={e => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                  />
                </div>
                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      value={cardForm.cvv}
                      onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=zenelait@upi%26pn=Zenelait%20Apparel" alt="UPI QR Code" style={{ display: 'block' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scan QR code using GPay, PhonePe, or BHIM apps, or enter UPI ID below.</p>
                <div className="input-group" style={{ width: '100%', textAlign: 'left' }}>
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. name@okhdfcbank"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="payment-security-notice" style={{ padding: '16px', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} className="text-gold" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>Cash on Delivery (COD) Selected</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You will settle the payment in cash or local card swipe once the dispatch team hands over the package.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'banking' && (
              <div className="input-group">
                <label>Select Netbanking Institution</label>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="input-group">
                <label>Select Digital Wallet</label>
                <select value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)}>
                  <option>Paytm Wallet</option>
                  <option>PhonePe Wallet</option>
                  <option>Amazon Pay Wallet</option>
                  <option>MobiKwik</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button type="button" className="btn-premium btn-premium-secondary" onClick={() => setStep(2)}>
                Back to Delivery
              </button>
              <button type="submit" className="btn-premium btn-premium-primary flex-1">
                Continue to Review Order
              </button>
            </div>
          </form>

          {/* Right Summary Column */}
          {renderSummaryColumn()}
        </div>
      )}

      {/* Step 4: Review Order Summary */}
      {step === 4 && (
        <div className="checkout-layout">
          <div className="checkout-main-column glass-panel">
            <h2 className="serif-text">Review and Confirm Order</h2>
            <p className="text-secondary mb-4">Please review shipping addresses, delivery options, and payment modes before executing booking.</p>

            <div className="review-order-sections" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Shipping review */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Shipping Destination</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Recipient:</strong> {shippingForm.firstName} {shippingForm.lastName}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {shippingForm.address}, {shippingForm.city}, {shippingForm.postalCode}, {shippingForm.country}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Phone:</strong> {shippingForm.phone}</p>
              </div>

              {/* Delivery review */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Fulfillment Method</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {deliveryMethod === 'express' ? 'Express White-Glove Delivery (Next Day)' : 'Standard Signature Delivery (3-5 business days)'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Cost: {deliveryMethod === 'express' ? '₹3,500' : 'Complimentary'}
                </p>
              </div>

              {/* Payment review */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Payment Method</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  {paymentMethod === 'card' && 'Credit / Debit Card'}
                  {paymentMethod === 'upi' && `UPI Payment (${upiId || 'QR Code Scan'})`}
                  {paymentMethod === 'cod' && 'Cash on Delivery (COD)'}
                  {paymentMethod === 'banking' && `Netbanking (${selectedBank})`}
                  {paymentMethod === 'wallet' && `Digital Wallet (${selectedWallet})`}
                </p>
              </div>

              {/* Items preview list */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Order Collection ({cartItems.length} items)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={item.product.images[0]} alt={item.product.name} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 2px 0', fontSize: '0.85rem' }}>{item.product.name}</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} | Size: {item.selectedSize}</p>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button type="button" className="btn-premium btn-premium-secondary" onClick={() => setStep(3)}>
                Back to Payment
              </button>
              <button type="button" className="btn-premium btn-premium-primary flex-1" onClick={handlePlaceOrder}>
                Place Order (₹{grandTotal})
              </button>
            </div>
          </div>

          {/* Right Summary Column */}
          {renderSummaryColumn()}
        </div>
      )}

      {/* Step 5: Success / Confirmation */}
      {step === 5 && (
        <div className="checkout-success-container text-center glass-panel" style={{ maxWidth: '650px', margin: '40px auto' }}>
          <CheckCircle2 size={64} className="text-gold mb-4 animate-float" />
          <h1 className="serif-text">Order Confirmed</h1>
          <p className="success-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Your booking is authorized. Order ID: <strong>{placedOrderId}</strong></p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            We've logged this order under <strong>{shippingForm.email}</strong>. Our packaging specialists are hand-wrapping your garments in custom silk folders.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '350px', margin: '0 auto' }}>
            <Link to="/dashboard?tab=orders" className="btn-premium btn-premium-primary">
              Track Order Status
            </Link>
            <Link to="/" className="btn-premium btn-premium-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to render right summary panel
  function renderSummaryColumn() {
    return (
      <div className="checkout-summary-column">
        <div className="summary-card glass-panel">
          <h3 className="serif-text">Order Summary</h3>
          <div className="bag-items-preview">
            {cartItems.map((item, idx) => (
              <div key={idx} className="preview-item">
                <img src={item.product.images[0]} alt={item.product.name} />
                <div className="preview-details">
                  <h4>{item.product.name}</h4>
                  <p>Qty: {item.quantity} | Size: {item.selectedSize}</p>
                  <p className="preview-price">₹{item.product.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-rows pt-4 border-top" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-success)' }}>
                <span>Campaign Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST Tax ({taxRateSetting}%)</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping Fee</span>
              <span>{deliveryFee === 0 ? 'Complimentary' : `₹${deliveryFee}`}</span>
            </div>
            <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontWeight: 'bold' }}>
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {/* Promo Code Input Box */}
          <div className="promo-input-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Promo Campaign Code</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                style={{ flex: 1, padding: '8px', fontSize: '0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="btn-premium btn-premium-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--status-success)' }}>✓ Applied: {appliedCoupon.code} (-₹{couponDiscount})</p>
            )}
            {couponError && (
              <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--status-error)' }}>✕ {couponError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
};
export default Checkout;