import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Award, 
  LogOut, 
  Package, 
  LayoutDashboard, 
  MapPin, 
  Tag, 
  Settings, 
  Plus, 
  Camera, 
  Video, 
  Trash2, 
  Download,
  Star,
  RefreshCw,
  HelpCircle,
  Mail,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import './Dashboard.css';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  size?: string;
}

interface ClientOrder {
  id: string;
  date: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  trackingNumber?: string;
  deliveryDate?: string;
  returnRequest?: any;
  exchangeRequest?: any;
  reviews?: any;
  itemsCount: number;
  items: OrderItem[];
}

export const Dashboard: React.FC = () => {
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const defaultTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [clientUser, setClientUser] = useState<any>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<ClientOrder | null>(null);

  // Post-purchase states
  const [activeReturnOrder, setActiveReturnOrder] = useState<ClientOrder | null>(null);
  const [returnForm, setReturnForm] = useState({ reason: 'Wrong Size', description: '', image: '', codBank: { bankName: '', accountNumber: '', ifsc: '', upi: '' }, paymentType: 'upi' });
  const [activeExchangeOrder, setActiveExchangeOrder] = useState<ClientOrder | null>(null);
  const [exchangeForm, setExchangeForm] = useState({ itemId: '', itemName: '', fromSize: '', toSize: '' });
  
  // Refined Review state
  const [reviewOrder, setReviewOrder] = useState<ClientOrder | null>(null);
  const [reviewForm, setReviewForm] = useState({ productId: '', rating: 5, text: '', photos: [] as string[], video: '' });
  
  // Stock alert/notify state
  const [notifyProduct, setNotifyProduct] = useState<any | null>(null);
  
  // Help modal
  const [activeHelpOrder, setActiveHelpOrder] = useState<ClientOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([
    { sender: 'agent', text: 'Welcome to VIP Concierge. How can we assist you with your garment today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');

  // CRM dynamic products list
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<any[]>(() => {
    const saved = localStorage.getItem('customer_addresses');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: 'Home', name: '', phone: '', details: '' });

  // Notifications toggles
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('customer_notifications');
    return saved ? JSON.parse(saved) : { email: true, sms: true, push: false, updates: true, promotions: false };
  });

  // Dynamic Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [superCoins, setSuperCoins] = useState<number>(() => {
    const saved = localStorage.getItem('customer_supercoins');
    return saved ? parseInt(saved) : 0;
  });
  const [supercoinRatio, setSupercoinRatio] = useState<string>('25');
  const [storeName, setStoreName] = useState<string>('zenelait Haute Couture');
  const [supportEmail, setSupportEmail] = useState<string>('concierge@zenelait.com');
  const [redeemedCoupons, setRedeemedCoupons] = useState<string[]>(() => {
    const saved = localStorage.getItem('customer_redeemed_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('customer_support_tickets');
    return saved ? JSON.parse(saved) : [];
  });
  const [isProfileUnlocked, setIsProfileUnlocked] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('+91 98765 43210');

  useEffect(() => {
    if (!activeHelpOrder) return;
    const poll = () => {
      fetch(`http://localhost:8000/api/support-messages?orderId=${activeHelpOrder.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setChatMessages(data.map((m: any) => ({ sender: m.sender as 'user' | 'agent', text: m.text })));
          }
        })
        .catch(err => console.error(err));
    };
    const timer = setInterval(poll, 4000);
    return () => clearInterval(timer);
  }, [activeHelpOrder]);

  useEffect(() => {
    if (!clientUser?.email) return;
    const fetchTickets = () => {
      fetch(`http://localhost:8000/api/support-tickets?email=${clientUser.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSupportTickets(data);
            const hasApproved = data.some(t => t.status === 'Approved & Unlocked');
            if (hasApproved) {
              setIsProfileUnlocked(true);
            }
          }
        })
        .catch(err => console.error(err));
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [clientUser?.email]);



  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    
    const name = nameInput || emailInput.split('@')[0];
    const user = { name, email: emailInput };
    
    localStorage.setItem('customerUser', JSON.stringify(user));
    setClientUser(user);
    setEditName(user.name);
    
    // Fetch orders for this email
    setLoadingOrders(true);
    fetch(`http://localhost:8000/api/orders?email=${emailInput}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingOrders(false);
      });

    fetch(`http://localhost:8000/api/admin/customers`)
      .then(res => res.json())
      .then(custs => {
        const match = custs.find((c: any) => c.email.toLowerCase() === emailInput.toLowerCase());
        if (match) {
          setSuperCoins(match.points || 0);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const saved = localStorage.getItem('customerUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      setClientUser(parsed);
      setEditName(parsed.name);
      
      // Fetch orders from MySQL backend
      setLoadingOrders(true);
      fetch(`http://localhost:8000/api/orders?email=${parsed.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error('Failed to load live client orders:', err);
          setLoadingOrders(false);
        });

      fetch(`http://localhost:8000/api/admin/customers`)
        .then(res => res.json())
        .then(custs => {
          const match = custs.find((c: any) => c.email.toLowerCase() === parsed.email.toLowerCase());
          if (match) {
            setSuperCoins(match.points || 0);
          }
        })
        .catch(err => console.error(err));
    }

    // Fetch dynamic coupons & products
    fetch('http://localhost:8000/api/admin/coupons')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCoupons(data); })
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/admin/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data); })
      .catch(err => console.error(err));

    fetch('http://localhost:8000/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.store_name || data.storeName) setStoreName(data.store_name || data.storeName);
          if (data.contact_email || data.contactEmail) setSupportEmail(data.contact_email || data.contactEmail);
          if (data.supercoin_reward_percentage) {
            setSupercoinRatio(data.supercoin_reward_percentage);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === 'rewards' || activeTab === 'coupons') {
      fetch('http://localhost:8000/api/admin/coupons')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCoupons(data);
        })
        .catch(err => console.error('Failed to update coupons on tab change:', err));
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('customerUser');
    alert('Logged out successfully.');
    navigate('/');
  };

  const displayName = clientUser ? clientUser.name : 'Guest Client';
  const displayEmail = clientUser ? clientUser.email : 'guest@zenelait.com';

  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [loginHovered, setLoginHovered] = useState(false);

  const handleLoginMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxTilt = 12; // Degrees
    const tY = ((x - centerX) / centerX) * maxTilt;
    const tX = -((y - centerY) / centerY) * maxTilt;
    
    setTiltX(tX);
    setTiltY(tY);
  };

  const handleLoginMouseLeave = () => {
    setLoginHovered(false);
    setTiltX(0);
    setTiltY(0);
  };

  const loginCardStyle = {
    transform: loginHovered 
      ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: loginHovered ? 'transform 0.08s ease-out, border-color 0.4s ease, box-shadow 0.4s ease' : 'transform 0.6s cubic-bezier(0.2, 1, 0.2, 1)',
    transformStyle: 'preserve-3d' as const
  };

  // Sidebar Tilt States
  const [sbTiltX, setSbTiltX] = useState(0);
  const [sbTiltY, setSbTiltY] = useState(0);
  const [sbHovered, setSbHovered] = useState(false);

  // Content Panel Tilt States
  const [cpTiltX, setCpTiltX] = useState(0);
  const [cpTiltY, setCpTiltY] = useState(0);
  const [cpHovered, setCpHovered] = useState(false);

  const handleSbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxTilt = 4;
    setSbTiltX(-((y - centerY) / centerY) * maxTilt);
    setSbTiltY(((x - centerX) / centerX) * maxTilt);
  };

  const handleSbMouseLeave = () => {
    setSbHovered(false);
    setSbTiltX(0);
    setSbTiltY(0);
  };

  const handleCpMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxTilt = 2;
    setCpTiltX(-((y - centerY) / centerY) * maxTilt);
    setCpTiltY(((x - centerX) / centerX) * maxTilt);
  };

  const handleCpMouseLeave = () => {
    setCpHovered(false);
    setCpTiltX(0);
    setCpTiltY(0);
  };

  const sbStyle = {
    transform: sbHovered 
      ? `perspective(1000px) rotateX(${sbTiltX}deg) rotateY(${sbTiltY}deg) translateY(-4px)` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
    transition: sbHovered ? 'transform 0.08s ease-out, border-color 0.3s ease, box-shadow 0.3s ease' : 'transform 0.6s cubic-bezier(0.2, 1, 0.2, 1)',
    transformStyle: 'preserve-3d' as const
  };

  const cpStyle = {
    transform: cpHovered 
      ? `perspective(1000px) rotateX(${cpTiltX}deg) rotateY(${cpTiltY}deg) translateY(-4px)` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
    transition: cpHovered ? 'transform 0.08s ease-out, border-color 0.3s ease, box-shadow 0.3s ease' : 'transform 0.6s cubic-bezier(0.2, 1, 0.2, 1)',
    transformStyle: 'preserve-3d' as const
  };

  if (!clientUser) {
    return (
      <div className="login-page-wrapper dashboard-page-container">
        {/* Stunning 3D scene backdrop */}
        <div className="login-3d-scene">
          <div className="login-perspective-grid"></div>
          <div className="login-orb orb-gold"></div>
          <div className="login-orb orb-indigo"></div>
        </div>

        <div className="login-glow-container">
          <div className="login-glow-backdrop"></div>
          <div 
            className="login-3d-card"
            style={loginCardStyle}
            onMouseEnter={() => setLoginHovered(true)}
            onMouseMove={handleLoginMouseMove}
            onMouseLeave={handleLoginMouseLeave}
          >
            <h2 className="serif-text text-center text-gold" style={{ marginBottom: '10px', fontSize: '2.1rem', fontWeight: 300 }}>
              {isRegister ? 'Create Account' : 'Client Sign In'}
            </h2>
            <p className="text-secondary text-center" style={{ fontSize: '0.85rem', marginBottom: '28px', lineHeight: 1.6 }}>
              {isRegister 
                ? 'Join Zenelait Haute Couture Club to track order milestones.' 
                : 'Enter your credentials to access your private boutique order history.'}
            </p>
            
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isRegister && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Aria Montgomery" 
                    value={nameInput} 
                    onChange={e => setNameInput(e.target.value)} 
                    required
                  />
                </div>
              )}
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="email@example.com" 
                  value={emailInput} 
                  onChange={e => setEmailInput(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={passwordInput} 
                  onChange={e => setPasswordInput(e.target.value)} 
                  required
                />
              </div>
              
              <button type="submit" className="btn-premium btn-premium-primary" style={{ width: '100%', marginTop: '10px', padding: '14px' }}>
                {isRegister ? 'Register & Access' : 'Sign In'}
              </button>
            </form>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => setIsRegister(!isRegister)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {isRegister ? 'Already have an account? Sign In' : 'New here? Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }





  // Dynamic statistics calculations
  const totalOrdersCount = orders.length;

  // Add Address Handler
  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.phone || !newAddress.details) return;
    const nextAddresses = [...addresses, {
      id: Date.now().toString(),
      type: newAddress.type,
      name: newAddress.name,
      phone: newAddress.phone,
      details: newAddress.details
    }];
    setAddresses(nextAddresses);
    localStorage.setItem('customer_addresses', JSON.stringify(nextAddresses));
    setNewAddress({ type: 'Home', name: '', phone: '', details: '' });
    setShowAddressForm(false);
  };

  // Delete Address Handler
  const handleDeleteAddress = (id: string) => {
    const nextAddresses = addresses.filter(a => a.id !== id);
    setAddresses(nextAddresses);
    localStorage.setItem('customer_addresses', JSON.stringify(nextAddresses));
  };

  const handleRedeemCoupon = (code: string, cost: number) => {
    if (superCoins < cost) {
      alert('Insufficient Super Coins!');
      return;
    }
    
    // Unlock the coupon without early coins subtraction (subtraction happens upon checkout)
    const nextRedeemed = [...redeemedCoupons, code];
    setRedeemedCoupons(nextRedeemed);
    localStorage.setItem('customer_redeemed_coupons', JSON.stringify(nextRedeemed));
    alert(`Coupon ${code} unlocked successfully! You can apply it during checkout (cost of ${cost} Coins will be deducted upon order placement).`);
  };

  // Submit Product Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewForm.productId) return;
    
    const updatedReviews = {
      ...(reviewOrder.reviews || {}),
      [reviewForm.productId]: {
        rating: reviewForm.rating,
        reviewText: reviewForm.text,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        photos: reviewForm.photos,
        video: reviewForm.video
      }
    };
    
    fetch(`http://localhost:8000/api/admin/orders/${reviewOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: updatedReviews })
    })
      .then(res => res.json())
      .then(() => {
        const saved = localStorage.getItem('customerUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          fetch(`http://localhost:8000/api/orders?email=${parsed.email}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); });
        }
        alert('Thank you! Your luxury product review has been submitted.');
        setReviewOrder(null);
        setReviewForm({ productId: '', rating: 5, text: '', photos: [], video: '' });
      })
      .catch(err => console.error(err));
  };

  const handleDeleteReview = (order: ClientOrder, productId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    const updatedReviews = { ...(order.reviews || {}) };
    delete updatedReviews[productId];
    
    fetch(`http://localhost:8000/api/admin/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: updatedReviews })
    })
      .then(res => res.json())
      .then(() => {
        const saved = localStorage.getItem('customerUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          fetch(`http://localhost:8000/api/orders?email=${parsed.email}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); });
        }
        alert('Review deleted.');
      })
      .catch(err => console.error(err));
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnOrder) return;
    
    const returnReq = {
      status: 'Return Requested',
      reason: returnForm.reason,
      description: returnForm.description,
      imageUrl: returnForm.image || '',
      paymentDetails: activeReturnOrder.paymentStatus === 'unpaid' || activeReturnOrder.deliveryMethod.toLowerCase().includes('cod') ? {
        type: returnForm.paymentType,
        upi: returnForm.codBank.upi,
        bankName: returnForm.codBank.bankName,
        accountNumber: returnForm.codBank.accountNumber,
        ifsc: returnForm.codBank.ifsc
      } : null
    };

    fetch(`http://localhost:8000/api/admin/orders/${activeReturnOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnRequest: returnReq })
    })
      .then(res => res.json())
      .then(() => {
        const saved = localStorage.getItem('customerUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          fetch(`http://localhost:8000/api/orders?email=${parsed.email}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); });
        }
        alert('Return request submitted successfully.');
        setActiveReturnOrder(null);
        setReturnForm({ reason: 'Wrong Size', description: '', image: '', codBank: { bankName: '', accountNumber: '', ifsc: '', upi: '' }, paymentType: 'upi' });
      })
      .catch(err => console.error(err));
  };

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExchangeOrder) return;

    const exchangeReq = {
      status: 'Requested',
      itemId: exchangeForm.itemId,
      itemName: exchangeForm.itemName,
      fromSize: exchangeForm.fromSize,
      toSize: exchangeForm.toSize
    };

    fetch(`http://localhost:8000/api/admin/orders/${activeExchangeOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeRequest: exchangeReq })
    })
      .then(res => res.json())
      .then(() => {
        const saved = localStorage.getItem('customerUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          fetch(`http://localhost:8000/api/orders?email=${parsed.email}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); });
        }
        alert('Exchange request submitted successfully.');
        setActiveExchangeOrder(null);
      })
      .catch(err => console.error(err));
  };

  const handleBuyAgain = (productId: string, size?: string, color?: string) => {
    const matched = allProducts.find(p => p.id === productId);
    if (matched) {
      if (matched.stock > 0 || matched.inStock) {
        addToCart(matched, 1, color || matched.colors[0] || 'Default', size || matched.sizes[0] || 'M');
        alert(`"${matched.name}" has been added to your Shopping Bag!`);
      } else {
        setNotifyProduct(matched);
      }
    } else {
      alert('Product could not be resolved from active collections.');
    }
  };

  const getReturnCountdown = (deliveryDateStr: string | undefined, orderDateStr: string) => {
    const dateToUse = deliveryDateStr || orderDateStr;
    const delivery = new Date(dateToUse);
    const expiry = new Date(delivery);
    expiry.setDate(delivery.getDate() + 7);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    delivery.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const expiryStr = expiry.toLocaleDateString('en-GB', options);
    
    if (diffDays > 1 && diffDays <= 7) {
      return { eligible: true, status: 'eligible', daysLeft: diffDays, text: `${diffDays} Days Left`, expiryDate: expiryStr };
    } else if (diffDays === 1) {
      return { eligible: true, status: 'eligible', daysLeft: 1, text: `1 Day Left`, expiryDate: expiryStr };
    } else if (diffDays === 0) {
      return { eligible: true, status: 'last_day', daysLeft: 0, text: `Today is your last day to return.`, expiryDate: expiryStr };
    } else {
      return { eligible: false, status: 'closed', daysLeft: -1, text: `Return Window Closed`, expiryDate: expiryStr };
    }
  };

  const downloadInvoice = (order: ClientOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const deliveryFee = order.deliveryMethod && order.deliveryMethod.toLowerCase().includes('express') ? 3500 : 0;
    const taxableSubtotal = Math.round((order.total - deliveryFee) / 1.18);
    const gstAmount = Math.round(order.total - deliveryFee - taxableSubtotal);

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || 'Designer Wardrobe Item'} (${item.size || 'M'})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; margin: 40px; line-height: 1.6; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-name { font-size: 24px; font-family: serif; color: #111; letter-spacing: 2px; text-transform: uppercase; }
            .invoice-title { font-size: 28px; font-weight: 300; text-transform: uppercase; }
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .meta-col { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #fafafa; padding: 12px 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #eee; }
            .totals-table { width: 40%; margin-left: auto; margin-right: 0; }
            .totals-table td { padding: 8px 10px; }
            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #111; color: white; border: none; padding: 10px 20px; font-size: 14px; cursor: pointer; border-radius: 4px;">Print / Save PDF</button>
          </div>
          <div class="invoice-header">
            <div>
              <div class="brand-name">${storeName}</div>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Luxury Couture House</p>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">Invoice</div>
              <p style="margin: 5px 0 0 0;">Order ID: <strong>${order.id}</strong></p>
            </div>
          </div>
          <div class="meta-section">
            <div class="meta-col">
              <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; font-size: 12px; color: #888;">Billed To:</h4>
              <strong>${order.customerName}</strong><br/>
              Email: ${order.email}<br/>
              Delivery Method: ${order.deliveryMethod || 'Standard Delivery'}
            </div>
            <div class="meta-col" style="text-align: right;">
              <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; font-size: 12px; color: #888;">Invoice Details:</h4>
              Date: ${order.date}<br/>
              Fulfillment Status: ${order.status.toUpperCase()}<br/>
              Payment Status: ${order.paymentStatus.toUpperCase()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">₹${taxableSubtotal}</td>
            </tr>
            ${deliveryFee > 0 ? `
            <tr>
              <td>Delivery Fee:</td>
              <td style="text-align: right;">₹${deliveryFee}</td>
            </tr>` : ''}
            <tr>
              <td>GST (18%):</td>
              <td style="text-align: right;">₹${gstAmount}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #ddd;">
              <td>Grand Total:</td>
              <td style="text-align: right; color: #D4AF37;">₹${order.total}</td>
            </tr>
          </table>
          <div class="footer">
            Thank you for shopping at <strong>${storeName}</strong>. For any queries, contact our VIP Support Concierge.
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handleHelpChatSubmit = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    
    // Save User message to Database
    fetch('http://localhost:8000/api/support-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sender: 'user', text: userMsg })
    })
      .then(res => res.json())
      .then(() => {
        // Refresh messages list
        fetch(`http://localhost:8000/api/support-messages?orderId=${orderId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setChatMessages(data.map((m: any) => ({ sender: m.sender as 'user' | 'agent', text: m.text })));
          });

        // Trigger premium automated concierge reply after 1 sec
        setTimeout(() => {
          const agentText = `Thank you for contacting VIP Concierge. We have logged your query for Order ${orderId}. A dedicated stylist advisor is reviewing your request.`;
          fetch('http://localhost:8000/api/support-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, sender: 'agent', text: agentText })
          })
            .then(() => {
              fetch(`http://localhost:8000/api/support-messages?orderId=${orderId}`)
                .then(res => res.json())
                .then(data => {
                  if (Array.isArray(data)) setChatMessages(data.map((m: any) => ({ sender: m.sender as 'user' | 'agent', text: m.text })));
                });
            });
        }, 1200);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="dashboard-page-container" style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 120px)', display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '140px 20px 80px 20px' }}>
      {/* Stunning 3D scene backdrop */}
      <div className="login-3d-scene">
        <div className="login-perspective-grid"></div>
        <div className="login-orb orb-gold"></div>
        <div className="login-orb orb-indigo"></div>
      </div>

      <div className="dashboard-layout" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px' }}>
        {/* Navigation Sidebar */}
        <aside 
          className="dashboard-nav-sidebar glass-panel"
          style={sbStyle}
          onMouseEnter={() => setSbHovered(true)}
          onMouseMove={handleSbMouseMove}
          onMouseLeave={handleSbMouseLeave}
        >
          <div className="client-badge-profile">
            <div className="avatar-circle">{displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600 }}>{displayName}</h3>
              <span className="membership-tier text-gold" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Verified Client</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Member Since: July 2026</p>
            </div>
          </div>

          <nav className="dashboard-nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className={`dash-nav-btn ${activeTab === 'dashboard' ? 'tab-active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className={`dash-nav-btn ${activeTab === 'orders' ? 'tab-active' : ''}`} onClick={() => setActiveTab('orders')}>
              <ShoppingBag size={16} /> My Orders
            </button>
            <button className={`dash-nav-btn ${activeTab === 'wishlist' ? 'tab-active' : ''}`} onClick={() => setActiveTab('wishlist')}>
              <Heart size={16} /> Wishlist
            </button>
            <button className={`dash-nav-btn ${activeTab === 'addresses' ? 'tab-active' : ''}`} onClick={() => setActiveTab('addresses')}>
              <MapPin size={16} /> Saved Addresses
            </button>
            <button className={`dash-nav-btn ${activeTab === 'rewards' ? 'tab-active' : ''}`} onClick={() => setActiveTab('rewards')}>
              <Award size={16} /> Super Coins
            </button>
            <button className={`dash-nav-btn ${activeTab === 'coupons' ? 'tab-active' : ''}`} onClick={() => setActiveTab('coupons')}>
              <Tag size={16} /> Coupons
            </button>
            <button className={`dash-nav-btn ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> Account Settings
            </button>
            <button className="dash-nav-btn logout-btn" onClick={handleLogout} style={{ color: 'var(--text-rose)', marginTop: '20px' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Tab View Panel */}
        <main 
          className="dashboard-content-panel glass-panel"
          style={cpStyle}
          onMouseEnter={() => setCpHovered(true)}
          onMouseMove={handleCpMouseMove}
          onMouseLeave={handleCpMouseLeave}
        >
          {/* TOP STATISTICS CARDS */}
          {activeTab !== 'logout' && (
            <div className="stats-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="stat-card glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                <div style={{ padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', color: 'var(--accent-gold)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Orders</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem' }}>{totalOrdersCount}</h3>
                </div>
              </div>

              <div className="stat-card glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                <div style={{ padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', color: 'var(--accent-gold)' }}>
                  <Heart size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Wishlist</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem' }}>{wishlist.length} Items</h3>
                </div>
              </div>

              <div className="stat-card glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                <div style={{ padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', color: 'var(--accent-gold)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Addresses</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem' }}>{addresses.length}</h3>
                </div>
              </div>

              <div className="stat-card glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                <div style={{ padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', color: 'var(--accent-gold)' }}>
                  <Award size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Super Coins</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem' }}>{superCoins} Coins</h3>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="serif-text">Luxury Lounge</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>Private boutique dashboard</span>
              </div>

              {/* LATEST ORDER */}
              <div>
                <h3 className="serif-text" style={{ marginBottom: '16px' }}>Latest Order</h3>
                {orders.length === 0 ? (
                  <p className="text-secondary">No purchase history logged on this client profile.</p>
                ) : (() => {
                  const latest = orders[0];
                  return (
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem' }}>Order ID: <span className="text-gold">{latest.id}</span></h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Placed on {latest.date}</span>
                        </div>
                        <span className={`order-status-badge status-${latest.status.toLowerCase()}`}>{latest.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px' }}>
                        <span>Total amount paid: <strong>₹{latest.total}</strong></span>
                        <span>Payment: <strong>{latest.paymentStatus}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-premium btn-premium-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setTrackingOrder(latest)}>
                          Track Shipment
                        </button>
                        <button className="btn-premium btn-premium-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('orders')}>
                          View Order
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* RECENTLY VIEWED CAROUSEL */}
              {allProducts.length > 0 && (
                <div>
                  <h3 className="serif-text" style={{ marginBottom: '16px' }}>Recently Viewed Items</h3>
                  <div className="products-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {allProducts.slice(0, 4).map(p => (
                      <div key={p.id} className="product-card glass-panel" style={{ padding: '12px', borderRadius: '8px' }}>
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>₹{p.price}</p>
                        <button onClick={() => handleBuyAgain(p.id)} className="btn-premium btn-premium-primary w-full" style={{ padding: '6px', fontSize: '0.75rem' }}>
                          Quick Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDED FOR YOU */}
              {allProducts.length > 0 && (
                <div>
                  <h3 className="serif-text" style={{ marginBottom: '16px' }}>Recommended For You</h3>
                  <div className="products-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {allProducts.slice(4, 8).map(p => (
                      <div key={p.id} className="product-card glass-panel" style={{ padding: '12px', borderRadius: '8px', position: 'relative' }}>
                        <button 
                          onClick={() => toggleWishlist(p)}
                          style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: wishlist.some(w => w.id === p.id) ? 'var(--text-rose)' : '#fff' }}
                        >
                          <Heart size={14} fill={wishlist.some(w => w.id === p.id) ? 'currentColor' : 'none'} />
                        </button>
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{p.brand}</span>
                        <h4 style={{ margin: '2px 0 4px 0', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>₹{p.price}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>15% OFF</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Orders */}
          {activeTab === 'orders' && (() => {
            const filteredOrders = orders.filter(order => {
              const query = ordersSearchQuery.toLowerCase();
              const orderIdMatches = order.id.toLowerCase().includes(query);
              const statusMatches = order.status.toLowerCase().includes(query);
              const items = Array.isArray(order.items) ? order.items : [];
              const itemMatches = items.some((item: any) => item.name && item.name.toLowerCase().includes(query));
              return orderIdMatches || statusMatches || itemMatches;
            });

            return (
              <div className="tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <h2 className="serif-text" style={{ margin: 0 }}>Your Orders</h2>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search orders (ID, status, product name)..."
                    value={ordersSearchQuery}
                    onChange={e => setOrdersSearchQuery(e.target.value)}
                    style={{ maxWidth: '350px', padding: '10px', fontSize: '0.85rem' }}
                  />
                </div>
                
                <div className="orders-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {loadingOrders ? (
                    <p className="text-secondary text-center">Querying secure transactions database...</p>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={40} className="text-muted mb-2 animate-float" />
                      <p className="text-secondary">No purchase history logged on this client profile.</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-secondary text-center">No orders match your search query.</p>
                  ) : (
                    filteredOrders.map(order => {
                    const isDelivered = order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered';
                    const countdown = getReturnCountdown(order.deliveryDate, order.date);

                    return (
                      <div key={order.id} className="order-history-card glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Order Header */}
                        <div className="order-header-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <h4 style={{ margin: 0 }}>Order ID: <span className="text-gold" style={{ fontFamily: 'monospace' }}>{order.id}</span></h4>
                            <span className="order-date" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Placed on {order.date}</span>
                            {isDelivered && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                📦 Delivered on: <strong>{order.deliveryDate || order.date}</strong>
                              </p>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isDelivered && (
                              <span className={`status-badge ${countdown.status === 'eligible' ? 'badge-success animate-pulse' : countdown.status === 'last_day' ? 'badge-warning animate-pulse' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                                {countdown.status === 'eligible' && `Return Available: ${countdown.text}`}
                                {countdown.status === 'last_day' && countdown.text}
                                {countdown.status === 'closed' && 'Return Period Expired'}
                              </span>
                            )}
                            <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {order.items && order.items.map((item, idx) => {
                            return (
                              <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <div>
                                  <span style={{ fontWeight: 500 }}>{item.name || 'Designer Wardrobe Piece'}</span>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    Size: <strong>{item.size || 'M'}</strong> | Qty: <strong>{item.quantity}</strong> | Price: <strong>₹{item.price}</strong>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <strong>₹{item.price * item.quantity}</strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Return Request Tracker */}
                        {order.returnRequest && order.returnRequest.status && (
                          <div className="return-tracker-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-rose)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>⚠️ Return Flow: {order.returnRequest.status}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason: {order.returnRequest.reason}</span>
                            </h4>
                            
                            {/* Return Progress Stepper */}
                            {(() => {
                              const steps = ['Return Requested', 'Return Approved', 'Pickup Scheduled', 'Product Picked Up', 'Quality Inspection', 'Refund Processed', 'Refund Completed'];
                              const currentIdx = steps.indexOf(order.returnRequest.status);
                              return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', padding: '10px 0', gap: '10px' }}>
                                  {steps.map((st, sIdx) => {
                                    const active = sIdx <= currentIdx;
                                    return (
                                      <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', flex: 1 }}>
                                        <div style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '50%',
                                          background: active ? 'var(--text-rose)' : 'var(--bg-secondary)',
                                          border: `2px solid ${active ? 'var(--text-rose)' : 'var(--border-color)'}`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: active ? '#fff' : 'var(--text-muted)',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold',
                                          marginBottom: '6px'
                                        }}>
                                          {active ? '✓' : sIdx + 1}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', textAlign: 'center', color: active ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                          {st.replace('Product ', '').replace('Scheduled', '')}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                            
                            {/* Refund Details */}
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', flexWrap: 'wrap', gap: '8px' }}>
                              <span>Refund Amount: <strong>₹{order.total}</strong></span>
                              <span>Refund Status: <strong style={{ color: order.returnRequest.status === 'Refund Completed' ? 'var(--accent-gold)' : 'var(--text-rose)' }}>{order.returnRequest.status === 'Refund Completed' ? 'Settled & Completed' : 'Processing'}</strong></span>
                              <span>Expected Refund Date: <strong>July 26, 2026</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Exchange Request Tracker */}
                        {order.exchangeRequest && order.exchangeRequest.status && (
                          <div className="exchange-tracker-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#3b82f6', display: 'flex', justifyContent: 'space-between' }}>
                              <span>🔄 Exchange Flow: {order.exchangeRequest.status}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exchange to size: {order.exchangeRequest.toSize}</span>
                            </h4>
                            
                            {/* Exchange Progress Stepper */}
                            {(() => {
                              const steps = ['Requested', 'Approved', 'Pickup', 'Replacement Shipped', 'Delivered'];
                              const currentIdx = steps.indexOf(order.exchangeRequest.status);
                              return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', padding: '10px 0', gap: '10px' }}>
                                  {steps.map((st, sIdx) => {
                                    const active = sIdx <= currentIdx;
                                    return (
                                      <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', flex: 1 }}>
                                        <div style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '50%',
                                          background: active ? '#3b82f6' : 'var(--bg-secondary)',
                                          border: `2px solid ${active ? '#3b82f6' : 'var(--border-color)'}`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: active ? '#fff' : 'var(--text-muted)',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold',
                                          marginBottom: '6px'
                                        }}>
                                          {active ? '✓' : sIdx + 1}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', textAlign: 'center', color: active ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                          {st}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Customer Reviews Section */}
                        {order.reviews && Object.keys(order.reviews).length > 0 && (
                          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>Your Reviews</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {Object.keys(order.reviews).map(prodId => {
                                const rev = order.reviews[prodId];
                                const item = order.items.find(i => i.productId === prodId);
                                return (
                                  <div key={prodId} style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                      <strong>{item?.name || 'Designer Wardrobe Item'}</strong>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                          onClick={() => {
                                            setReviewOrder(order);
                                            setReviewForm({
                                              productId: prodId,
                                              rating: rev.rating,
                                              text: rev.reviewText,
                                              photos: rev.photos || [],
                                              video: rev.video || ''
                                            });
                                          }} 
                                          style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteReview(order, prodId)} 
                                          style={{ background: 'none', border: 'none', color: 'var(--text-rose)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                                      <span style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                                      <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px' }}>✓ Verified Purchase</span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                                    </div>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>{rev.reviewText}</p>
                                    {rev.photos && rev.photos.length > 0 && (
                                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {rev.photos.map((p: string, pIdx: number) => (
                                          <img key={pIdx} src={p} alt="Review attachment" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Post-Delivery Premium Action Cards Grid */}
                        {isDelivered ? (
                          <div>
                            <h4 style={{ fontSize: '0.85rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Manage Luxury Order</h4>
                            <div className="post-delivery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                              <button className="action-card-btn" onClick={() => { setReviewOrder(order); setReviewForm(prev => ({ ...prev, productId: order.items[0]?.productId || '' })); }}>
                                <Star size={16} />
                                <span>Rate Product</span>
                              </button>
                              
                              <button className="action-card-btn" onClick={() => { setReviewOrder(order); setReviewForm(prev => ({ ...prev, productId: order.items[0]?.productId || '' })); }}>
                                <FileText size={16} />
                                <span>Write Review</span>
                              </button>
                              
                              <button className="action-card-btn" onClick={() => { setReviewOrder(order); setReviewForm(prev => ({ ...prev, productId: order.items[0]?.productId || '' })); }}>
                                <Camera size={16} />
                                <span>Upload Photos</span>
                              </button>
                              
                              <button className="action-card-btn" onClick={() => { order.items.forEach(i => handleBuyAgain(i.productId, i.size)); }}>
                                <RefreshCw size={16} />
                                <span>Buy Again</span>
                              </button>
                              
                              <button 
                                className="action-card-btn" 
                                onClick={() => setActiveReturnOrder(order)} 
                                disabled={!countdown.eligible || (order.returnRequest && order.returnRequest.status)}
                                style={{ opacity: (!countdown.eligible || (order.returnRequest && order.returnRequest.status)) ? 0.4 : 1 }}
                              >
                                <AlertCircle size={16} />
                                <span>Return Item</span>
                              </button>
                              
                              <button 
                                className="action-card-btn" 
                                onClick={() => {
                                  setActiveExchangeOrder(order);
                                  setExchangeForm({
                                    itemId: order.items[0]?.productId || '',
                                    itemName: order.items[0]?.name || '',
                                    fromSize: order.items[0]?.size || 'M',
                                    toSize: 'L'
                                  });
                                }} 
                                disabled={!countdown.eligible || (order.exchangeRequest && order.exchangeRequest.status)}
                                style={{ opacity: (!countdown.eligible || (order.exchangeRequest && order.exchangeRequest.status)) ? 0.4 : 1 }}
                              >
                                <RefreshCw size={16} />
                                <span>Exchange Size</span>
                              </button>
                              
                              <button className="action-card-btn" onClick={() => downloadInvoice(order)}>
                                <Download size={16} />
                                <span>Invoice PDF</span>
                              </button>
                              
                              <button className="action-card-btn" onClick={() => {
                                setActiveHelpOrder(order);
                                setChatMessages([]);
                                fetch(`http://localhost:8000/api/support-messages?orderId=${order.id}`)
                                  .then(res => res.json())
                                  .then(data => {
                                    if (Array.isArray(data)) {
                                      if (data.length === 0) {
                                        const welcomeText = `Welcome to VIP Concierge. How can we assist you with Order ${order.id} today?`;
                                        fetch('http://localhost:8000/api/support-messages', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ orderId: order.id, sender: 'agent', text: welcomeText })
                                        })
                                          .then(() => {
                                            setChatMessages([{ sender: 'agent', text: welcomeText }]);
                                          });
                                      } else {
                                        setChatMessages(data.map((m: any) => ({ sender: m.sender as 'user' | 'agent', text: m.text })));
                                      }
                                    }
                                  })
                                  .catch(err => console.error(err));
                              }}>
                                <HelpCircle size={16} />
                                <span>Need Help</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Non-delivered order footer controls */
                          <div className="order-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <span>Total Price: <strong>₹{order.total}</strong></span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn-premium btn-premium-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setTrackingOrder(order)}>
                                Track Package
                              </button>
                              <button className="btn-premium btn-premium-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => downloadInvoice(order)}>
                                <Download size={12} /> Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            );
          })()}

          {/* Tab 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="tab-view">
              <h2 className="serif-text mb-4">Wishlist Collection</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <Heart size={40} className="text-muted mb-2" />
                  <p className="text-secondary">Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="products-grid-layout">
                  {wishlist.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onQuickView={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="serif-text">Saved Addresses</h2>
                <button onClick={() => setShowAddressForm(true)} className="btn-premium btn-premium-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddressSubmit} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 className="serif-text" style={{ fontSize: '1.1rem' }}>New Address Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Address Label</label>
                      <select className="form-control" value={newAddress.type} onChange={e => setNewAddress({ ...newAddress, type: e.target.value })}>
                        <option>Home</option>
                        <option>Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Contact Name</label>
                      <input type="text" className="form-control" placeholder="e.g. Arjun Dev" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Phone Number</label>
                    <input type="text" className="form-control" placeholder="e.g. +91 99999 88888" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Street Address Details</label>
                    <textarea className="form-control" placeholder="Complete address detail, building, suite, city, pincode" value={newAddress.details} onChange={e => setNewAddress({ ...newAddress, details: e.target.value })} required style={{ minHeight: '80px', padding: '10px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn-premium btn-premium-primary" style={{ padding: '8px 16px' }}>Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-premium btn-premium-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong className="text-gold" style={{ fontSize: '0.95rem' }}>{addr.type}</strong>
                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: 'var(--text-rose)', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '0.85rem' }}>{addr.name}</p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{addr.phone}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.5 }}>{addr.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Super Coins */}
          {activeTab === 'rewards' && (
            <div className="tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h2 className="serif-text">💰 Super Coins Lounge</h2>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>Your Super Coin Balance</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Accumulated via verified premium garment purchases.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212, 175, 55, 0.1)', padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <Award size={24} className="text-gold" />
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{superCoins} Coins</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 className="serif-text" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>How to Earn Super Coins</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Earn a premium <strong>{supercoinRatio}% Super Coin value</strong> on every order placed!
                  For instance, when you purchase luxury outfits worth ₹1,000, you will automatically receive <strong>{Math.round(1000 * parseFloat(supercoinRatio || '25') / 100)} Super Coins</strong> upon delivery completion. Use them to unlock exclusive high-discount coupons below!
                </p>
              </div>

              <div>
                <h3 className="serif-text" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Available Super Coin Coupons</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {coupons.filter(c => c.requiredSupercoins > 0).map(coupon => {
                    const isRedeemed = redeemedCoupons.includes(coupon.code);
                    const canRedeem = superCoins >= coupon.requiredSupercoins;

                    return (
                      <div key={coupon.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px dashed var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', opacity: isRedeemed ? 0.7 : 1 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="status-badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{coupon.code}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost: <strong>{coupon.requiredSupercoins} Coins</strong></span>
                          </div>
                          <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.2rem' }}>
                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min Purchase Required: <strong>₹{coupon.minPurchase || 0}</strong></p>
                        </div>
                        
                        {isRedeemed ? (
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            ✓ Redeemed & Unlocked
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRedeemCoupon(coupon.code, coupon.requiredSupercoins)}
                            disabled={!canRedeem}
                            className={`btn-premium ${canRedeem ? 'btn-premium-primary' : 'btn-premium-secondary'}`}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                          >
                            {canRedeem ? `Redeem for ${coupon.requiredSupercoins} Coins` : `Need ${coupon.requiredSupercoins - superCoins} more Coins`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {coupons.filter(c => c.requiredSupercoins > 0).length === 0 && (
                    <p className="text-secondary" style={{ gridColumn: '1/-1' }}>No Super Coin coupons available for redemption currently.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Coupons */}
          {activeTab === 'coupons' && (
            <div className="tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 className="serif-text">Boutique Promo Codes</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Apply these campaigns during checkout for exclusive discounts.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {coupons.map(coupon => (
                  <div key={coupon.id} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px dashed var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <span className="status-badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{coupon.code}</span>
                      <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.2rem' }}>
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min Purchase Required: <strong>₹{coupon.minPurchase}</strong></p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiry: {coupon.endDate}</span>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-secondary">No seasonal promo campaigns running currently.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Account Settings */}
          {activeTab === 'settings' && (
            <div className="tab-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h2 className="serif-text">Account Settings</h2>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Update profile settings, address book details, and digital preferences.</p>
              </div>

              {/* Personal Information Grid */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 className="serif-text" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Personal Information</h3>
                
                {isProfileUnlocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                      </div>
                      <div className="detail-field">
                        <label>Email Address</label>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{displayEmail}</p>
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                        />
                      </div>
                      <div className="detail-field">
                        <label>Preferred Language</label>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>English (UK)</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const nextUser = { ...clientUser, name: editName };
                        setClientUser(nextUser);
                        localStorage.setItem('customerUser', JSON.stringify(nextUser));
                        
                        // Lock the approved ticket in the DB to close editing mode
                        const approvedTicket = supportTickets.find(t => t.status === 'Approved & Unlocked');
                        if (approvedTicket) {
                          fetch('http://localhost:8000/api/support-tickets', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: approvedTicket.id, status: 'Completed & Locked' })
                          })
                            .then(() => {
                              setIsProfileUnlocked(false);
                            })
                            .catch(err => console.error(err));
                        } else {
                          setIsProfileUnlocked(false);
                        }
                        alert('Your profile changes have been verified and saved!');
                      }}
                      className="btn-premium btn-premium-primary"
                      style={{ padding: '10px 20px', alignSelf: 'flex-start', fontSize: '0.85rem' }}
                    >
                      Save Profile Changes
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div className="detail-field">
                        <label>Full Name</label>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{displayName}</p>
                      </div>
                      <div className="detail-field">
                        <label>Email Address</label>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{displayEmail}</p>
                      </div>
                      <div className="detail-field">
                        <label>Phone Number</label>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{editPhone}</p>
                      </div>
                      <div className="detail-field">
                        <label>Preferred Language</label>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>English (UK)</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSupportModal(true)} className="btn-premium btn-premium-primary" style={{ marginTop: '20px', padding: '8px 16px', fontSize: '0.8rem' }}>
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Support Ticket Registry */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 className="serif-text" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Support Ticket Registry</h3>
                {supportTickets.length === 0 ? (
                  <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>No concierge support tickets logged.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {supportTickets.map(ticket => (
                      <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <div>
                          <strong className="text-gold" style={{ fontSize: '0.85rem' }}>{ticket.id}</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ticket.message}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Logged on {ticket.date}</p>
                        </div>
                        <span className="status-badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold' }}>{ticket.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 className="serif-text" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Notification Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} />
                    Email Notifications
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={notifications.sms} onChange={e => setNotifications({ ...notifications, sms: e.target.checked })} />
                    SMS Notifications
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={notifications.push} onChange={e => setNotifications({ ...notifications, push: e.target.checked })} />
                    Push Notifications
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={notifications.updates} onChange={e => setNotifications({ ...notifications, updates: e.target.checked })} />
                    Order Updates
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={notifications.promotions} onChange={e => setNotifications({ ...notifications, promotions: e.target.checked })} />
                    Promotional Offers & Campaigns
                  </label>
                </div>
                <button onClick={() => { localStorage.setItem('customer_notifications', JSON.stringify(notifications)); alert('Notification preferences saved successfully!'); }} className="btn-premium btn-premium-primary" style={{ marginTop: '20px', padding: '8px 16px', fontSize: '0.8rem' }}>
                  Save Preferences
                </button>
              </div>

              {/* Danger Zone */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--text-rose)' }}>
                <h3 className="serif-text" style={{ fontSize: '1.2rem', color: 'var(--text-rose)', marginBottom: '8px' }}>Security & Danger Zone</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Deleting your account will permanently wipe points, purchase milestones, and access credentials.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { const pass = prompt('Enter your new password:'); if (pass && pass.trim()) alert('Password changed successfully!'); }} className="btn-premium btn-premium-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Change Password</button>
                  <button onClick={() => { if(window.confirm('Delete account permanently? This will wipe your saved profile details, addresses, and Super Coins.')) { localStorage.removeItem('customerUser'); localStorage.removeItem('customer_supercoins'); localStorage.removeItem('customer_redeemed_coupons'); localStorage.removeItem('customer_addresses'); localStorage.removeItem('customer_notifications'); alert('Account permanently deleted.'); window.location.reload(); } }} className="btn-premium btn-premium-secondary" style={{ color: 'var(--text-rose)', border: '1px solid var(--text-rose)', padding: '8px 16px', fontSize: '0.8rem' }}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REFINED PRODUCT REVIEW MODAL */}
      {reviewOrder && (
        <div className="sizeguide-overlay" onClick={() => setReviewOrder(null)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '550px', width: '90%', background: 'var(--bg-secondary)', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 className="serif-text">Rate & Review Product</h3>
              <button onClick={() => setReviewOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Select Product to Review</label>
                <select 
                  className="form-control"
                  value={reviewForm.productId}
                  onChange={e => setReviewForm({ ...reviewForm, productId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {reviewOrder.items.map(i => (
                    <option key={i.productId} value={i.productId}>{i.name || 'Designer Item'}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--accent-gold)' }}>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <span key={stars} onClick={() => setReviewForm({ ...reviewForm, rating: stars })}>
                      {stars <= reviewForm.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Your Review Text</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="Share details of the fit, premium weave quality, design aesthetics..." 
                  value={reviewForm.text} 
                  onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} 
                  required 
                  style={{ padding: '10px', fontSize: '0.85rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Upload Media (Up to 5 Photos & 1 Short Video)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const mockUrl = prompt('Enter image URL or press OK for sample proof:', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200');
                      if (mockUrl) {
                        setReviewForm(prev => ({
                          ...prev,
                          photos: [...prev.photos, mockUrl].slice(0, 5)
                        }));
                      }
                    }} 
                    className="btn-premium btn-premium-secondary" 
                    style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={reviewForm.photos.length >= 5}
                  >
                    <Camera size={14} /> Add Image (${reviewForm.photos.length}/5)
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      const mockVideo = prompt('Enter short video URL (optional):', 'https://www.w3schools.com/html/mov_bbb.mp4');
                      if (mockVideo) {
                        setReviewForm(prev => ({ ...prev, video: mockVideo }));
                        alert('Video link attached successfully!');
                      }
                    }} 
                    className="btn-premium btn-premium-secondary" 
                    style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Video size={14} /> {reviewForm.video ? 'Video Attached' : 'Add Short Video'}
                  </button>
                </div>
                {reviewForm.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {reviewForm.photos.map((p, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={p} alt="attached" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <button 
                          type="button" 
                          onClick={() => setReviewForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e11d48', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-premium btn-premium-primary" style={{ padding: '10px 20px' }}>Submit Review</button>
                <button type="button" onClick={() => setReviewOrder(null)} className="btn-premium btn-premium-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN PRODUCT MODAL */}
      {activeReturnOrder && (
        <div className="sizeguide-overlay" onClick={() => setActiveReturnOrder(null)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '550px', width: '90%', background: 'var(--bg-secondary)', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 className="serif-text">Request Return - Order {activeReturnOrder.id}</h3>
              <button onClick={() => setActiveReturnOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Return Reason</label>
                <select 
                  className="form-control"
                  value={returnForm.reason}
                  onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                  required
                >
                  <option>Wrong Size</option>
                  <option>Wrong Color</option>
                  <option>Quality Issue</option>
                  <option>Damaged Product</option>
                  <option>Received Wrong Item</option>
                  <option>Changed My Mind</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Optional Comments</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Provide more context for our inspections team..." 
                  value={returnForm.description} 
                  onChange={e => setReturnForm({ ...returnForm, description: e.target.value })} 
                  style={{ padding: '10px', fontSize: '0.85rem' }} 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Upload Proof Images</label>
                <button 
                  type="button" 
                  onClick={() => {
                    const imgUrl = prompt('Enter proof image URL:', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300');
                    if (imgUrl) setReturnForm({ ...returnForm, image: imgUrl });
                  }} 
                  className="btn-premium btn-premium-secondary" 
                  style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Camera size={14} /> {returnForm.image ? 'Proof Attached' : 'Attach Photo'}
                </button>
                {returnForm.image && <img src={returnForm.image} alt="proof preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginTop: '6px' }} />}
              </div>

              {/* COD Refund details */}
              {(activeReturnOrder.paymentStatus === 'unpaid' || activeReturnOrder.deliveryMethod.toLowerCase().includes('cod')) && (
                <div style={{ background: 'rgba(212,175,55,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>COD Settlement Details</h4>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="paymentType" value="upi" checked={returnForm.paymentType === 'upi'} onChange={() => setReturnForm({ ...returnForm, paymentType: 'upi' })} />
                      UPI Account
                    </label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="paymentType" value="bank" checked={returnForm.paymentType === 'bank'} onChange={() => setReturnForm({ ...returnForm, paymentType: 'bank' })} />
                      Bank Account
                    </label>
                  </div>

                  {returnForm.paymentType === 'upi' ? (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.7rem' }}>UPI ID *</label>
                      <input type="text" className="form-control" placeholder="e.g. mobile@upi" value={returnForm.codBank.upi} onChange={e => setReturnForm({ ...returnForm, codBank: { ...returnForm.codBank, upi: e.target.value } })} required />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem' }}>Bank Name *</label>
                        <input type="text" className="form-control" placeholder="e.g. HDFC Bank" value={returnForm.codBank.bankName} onChange={e => setReturnForm({ ...returnForm, codBank: { ...returnForm.codBank, bankName: e.target.value } })} required />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem' }}>Account Number *</label>
                        <input type="text" className="form-control" placeholder="e.g. 50100293812739" value={returnForm.codBank.accountNumber} onChange={e => setReturnForm({ ...returnForm, codBank: { ...returnForm.codBank, accountNumber: e.target.value } })} required />
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem' }}>IFSC Code *</label>
                        <input type="text" className="form-control" placeholder="e.g. HDFC0000124" value={returnForm.codBank.ifsc} onChange={e => setReturnForm({ ...returnForm, codBank: { ...returnForm.codBank, ifsc: e.target.value } })} required />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-premium btn-premium-primary" style={{ padding: '10px 20px' }}>Submit Return Request</button>
                <button type="button" onClick={() => setActiveReturnOrder(null)} className="btn-premium btn-premium-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCHANGE SIZE MODAL */}
      {activeExchangeOrder && (
        <div className="sizeguide-overlay" onClick={() => setActiveExchangeOrder(null)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '500px', width: '90%', background: 'var(--bg-secondary)', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 className="serif-text">Exchange Size - Order {activeExchangeOrder.id}</h3>
              <button onClick={() => setActiveExchangeOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleExchangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Select Item to Exchange</label>
                <select 
                  className="form-control"
                  value={exchangeForm.itemId}
                  onChange={e => {
                    const item = activeExchangeOrder.items.find(i => i.productId === e.target.value);
                    setExchangeForm({
                      ...exchangeForm,
                      itemId: e.target.value,
                      itemName: item?.name || '',
                      fromSize: item?.size || 'M'
                    });
                  }}
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {activeExchangeOrder.items.map(i => (
                    <option key={i.productId} value={i.productId}>{i.name || 'Designer Item'} ({i.size})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Current Size: <strong>{exchangeForm.fromSize}</strong></span>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Exchange To Size</label>
                <select 
                  className="form-control"
                  value={exchangeForm.toSize}
                  onChange={e => setExchangeForm({ ...exchangeForm, toSize: e.target.value })}
                  required
                >
                  <option value="">-- Select Size --</option>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].filter(sz => sz !== exchangeForm.fromSize).map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-premium btn-premium-primary" style={{ padding: '10px 20px' }}>Submit Exchange Request</button>
                <button type="button" onClick={() => setActiveExchangeOrder(null)} className="btn-premium btn-premium-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK NOTIFICATION MODAL */}
      {notifyProduct && (
        <div className="sizeguide-overlay" onClick={() => setNotifyProduct(null)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '450px', width: '90%', background: 'var(--bg-secondary)', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 className="serif-text text-gold mb-2">Out of Stock</h3>
            <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>The luxury piece <strong>{notifyProduct.name}</strong> is currently unavailable in our archives.</p>
            
            <button 
              onClick={() => {
                alert(`Perfect! We will alert you immediately at ${displayEmail} as soon as this item returns to our collections.`);
                setNotifyProduct(null);
              }} 
              className="btn-premium btn-premium-primary w-full"
              style={{ padding: '12px' }}
            >
              Notify Me When Back in Stock
            </button>
            <button onClick={() => setNotifyProduct(null)} className="btn-premium btn-premium-secondary w-full mt-2" style={{ padding: '10px' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* NEED HELP / SUPPORT MODAL */}
      {activeHelpOrder && (
        <div className="sizeguide-overlay" onClick={() => setActiveHelpOrder(null)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '500px', width: '90%', background: 'var(--bg-secondary)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 className="serif-text">VIP Help Desk: Order {activeHelpOrder.id}</h3>
              <button onClick={() => setActiveHelpOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {/* Live Chat Panel */}
            <div style={{ background: 'rgba(205, 196, 196, 0.3)', padding: '16px', borderRadius: '8px', minHeight: '220px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  maxWidth: '80%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  color: msg.sender === 'user' ? '#000' : 'var(--text-primary)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={(e) => handleHelpChatSubmit(e, activeHelpOrder.id)} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Type your stylist question..." 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                required 
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn-premium btn-premium-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Send</button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', textAlign: 'center' }}>
              <a href={`mailto:${supportEmail}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-gold)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                <Mail size={12} /> Email Stylist
              </a>
              <a href="tel:+91800555COUTURE" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-gold)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px' }}>
                <Phone size={12} /> Call Support
              </a>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME TRACKING MODAL */}
      {trackingOrder && (() => {
        const currentStep = (() => {
          const s = trackingOrder.status.toLowerCase();
          if (s === 'pending') return 0;
          if (s === 'processing') return 1;
          if (s === 'packed') return 2;
          if (s === 'shipped') return 3;
          if (s === 'out_for_delivery' || s === 'out for delivery') return 4;
          if (s === 'delivered' || s === 'completed') return 5;
          return 1;
        })();

        const trackingSteps = [
          { label: 'Order Confirmed', desc: 'Secure payment cleared and order accepted' },
          { label: 'Processing & Quality Check', desc: 'Garment selected from high-fashion vault and quality check completed' },
          { label: 'Packed & Dispatched', desc: 'Garment packed securely inside custom dust bags and boxes' },
          { label: 'In Transit', desc: 'Package shipped with premium express logistics partner' },
          { label: 'Out for Delivery', desc: 'Courier agent carrying package to your doorstep' },
          { label: 'Delivered', desc: 'Delivered and securely hand-verified' }
        ];

        return (
          <div className="sizeguide-overlay" onClick={() => setTrackingOrder(null)}>
            <div className="sizeguide-modal glass-panel" style={{ maxWidth: '600px', width: '90%', background: 'var(--bg-secondary)' }} onClick={e => e.stopPropagation()}>
              <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 className="serif-text">Real-Time Package Tracker</h3>
                <button onClick={() => setTrackingOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Order ID: <strong style={{ color: 'var(--accent-gold)' }}>{trackingOrder.id}</strong></p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logistics Carrier: <strong>{trackingOrder.deliveryMethod || 'Blue Dart Luxury Delivery'}</strong></p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tracking Number: <strong>{trackingOrder.trackingNumber || 'AWT-09281726-IND'}</strong></p>
              </div>

              {/* Stepper Timeline */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                {/* Vertical connecting line */}
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '12px',
                  bottom: '12px',
                  width: '2px',
                  background: 'var(--border-color)',
                  zIndex: 0
                }} />
                
                {/* Highlighted progress line */}
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '12px',
                  height: `${(currentStep / 5) * 90}%`,
                  width: '2px',
                  background: 'var(--accent-gold)',
                  zIndex: 1,
                  transition: 'height 0.4s ease'
                }} />

                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                        border: `2px solid ${isCompleted ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                        color: isCompleted ? '#000' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        boxShadow: isCurrent ? '0 0 12px var(--accent-gold)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: '0.95rem',
                          color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontWeight: isCurrent ? 'bold' : 'normal'
                        }}>
                          {step.label}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)'
                        }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Support Request Modal Overlay */}
      {showSupportModal && (
        <div className="sizeguide-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="sizeguide-modal glass-panel" style={{ maxWidth: '500px', width: '95%', background: 'var(--bg-secondary)', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div className="sizeguide-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 className="serif-text">Concierge Support Assistance</h3>
              <button onClick={() => setShowSupportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Profile changes and verification controls are locked for account security. Please write your request below (e.g. details update, account unlock) and our VIP concierge support team will verify and execute it.
              </p>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Write your request details here..."
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'black', borderRadius: '8px' }}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    if (!supportMessage.trim() || !clientUser) return;
                    fetch('http://localhost:8000/api/support-tickets', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerEmail: clientUser.email,
                        customerName: clientUser.name,
                        message: supportMessage,
                        status: 'Pending Verification',
                        date: new Date().toLocaleDateString()
                      })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setSupportTickets(prev => [...prev, data.ticket]);
                        alert(`Your support ticket ${data.ticket.id} has been logged with concierge service. Status is Pending Verification.`);
                        setSupportMessage('');
                        setShowSupportModal(false);
                      } else {
                        alert('Failed to log support ticket. Please try again.');
                      }
                    })
                    .catch(err => {
                      console.error(err);
                      alert('Error connecting to support services.');
                    });
                  }}
                  className="btn-premium btn-premium-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="btn-premium btn-premium-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
