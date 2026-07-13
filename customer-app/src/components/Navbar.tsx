import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Sun, Moon, X, Menu, Trash2, ChevronRight, Sparkles, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import type { Product } from '../data/products';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { cartItems, cartCount, cartSubtotal, removeFromCart, updateQuantity, wishlist } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  interface CustNotification {
    id: string;
    text: string;
    time: string;
    read: boolean;
  }
  const [notifications, setNotifications] = useState<CustNotification[]>([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  useEffect(() => {
    const customerStr = localStorage.getItem('customerUser');
    if (!customerStr) return;
    let customer: any = null;
    try {
      customer = JSON.parse(customerStr);
    } catch (e) {}
    if (!customer || !customer.email) return;

    const fetchNotifications = () => {
      fetch(`http://localhost:8000/api/orders?email=${customer.email}`)
        .then(res => res.json())
        .then(orders => {
          if (Array.isArray(orders)) {
            const list: CustNotification[] = [];
            orders.forEach((o: any) => {
              // Add order status notification
              list.push({
                id: `ord-status-${o.id}-${o.status}`,
                text: `Order #${o.id} is currently ${o.status.toUpperCase()}`,
                time: o.deliveryDate ? `Delivered: ${o.deliveryDate}` : 'Status Update',
                read: false
              });

              // Add return notification
              let returnReq: any = null;
              if (o.returnRequest) {
                try {
                  returnReq = typeof o.returnRequest === 'string' ? JSON.parse(o.returnRequest) : o.returnRequest;
                } catch(e) {}
              }
              if (returnReq && returnReq.status) {
                list.push({
                  id: `ret-status-${o.id}-${returnReq.status}`,
                  text: `Return Request for Order #${o.id} is ${returnReq.status.toUpperCase()}`,
                  time: 'Return Alert',
                  read: false
                });
              }

              // Add exchange notification
              let exchangeReq: any = null;
              if (o.exchangeRequest) {
                try {
                  exchangeReq = typeof o.exchangeRequest === 'string' ? JSON.parse(o.exchangeRequest) : o.exchangeRequest;
                } catch(e) {}
              }
              if (exchangeReq && exchangeReq.status) {
                list.push({
                  id: `exc-status-${o.id}-${exchangeReq.status}`,
                  text: `Exchange Request for Order #${o.id} is ${exchangeReq.status.toUpperCase()}`,
                  time: 'Exchange Alert',
                  read: false
                });
              }
            });

            const readIdsStr = localStorage.getItem('customer_read_notify_ids') || '[]';
            let readIds: string[] = [];
            try {
              readIds = JSON.parse(readIdsStr);
            } catch (e) {}

            const finalized = list.map(n => ({
              ...n,
              read: readIds.includes(n.id)
            }));

            const clearedIdsStr = localStorage.getItem('customer_cleared_notify_ids') || '[]';
            let clearedIds: string[] = [];
            try {
              clearedIds = JSON.parse(clearedIdsStr);
            } catch(e) {}
            
            setNotifications(finalized.filter(n => !clearedIds.includes(n.id)));
          }
        })
        .catch(err => console.error(err));
    };

    fetchNotifications();
    const timer = setInterval(fetchNotifications, 6000);
    return () => clearInterval(timer);
  }, []);

  const markAsRead = (id: string) => {
    const readIdsStr = localStorage.getItem('customer_read_notify_ids') || '[]';
    let readIds: string[] = [];
    try { readIds = JSON.parse(readIdsStr); } catch (e) {}
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('customer_read_notify_ids', JSON.stringify(readIds));
    }
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotification = (id: string) => {
    const clearedIdsStr = localStorage.getItem('customer_cleared_notify_ids') || '[]';
    let clearedIds: string[] = [];
    try { clearedIds = JSON.parse(clearedIdsStr); } catch (e) {}
    if (!clearedIds.includes(id)) {
      clearedIds.push(id);
      localStorage.setItem('customer_cleared_notify_ids', JSON.stringify(clearedIds));
    }
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    const clearedIdsStr = localStorage.getItem('customer_cleared_notify_ids') || '[]';
    let clearedIds: string[] = [];
    try { clearedIds = JSON.parse(clearedIdsStr); } catch (e) {}
    notifications.forEach(n => {
      if (!clearedIds.includes(n.id)) clearedIds.push(n.id);
    });
    localStorage.setItem('customer_cleared_notify_ids', JSON.stringify(clearedIds));
    setNotifications([]);
  };
  
  // Real-time Search suggestions
  const suggestions = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products for navbar:', err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => console.error('Failed to fetch categories for navbar:', err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (productName: string) => {
    setSearchQuery(productName);
    setIsSearchOpen(false);
    navigate(`/product/${products.find(p => p.name === productName)?.id || ''}`);
  };

  return (
    <>
      <header className={`navbar-header ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/ecomlogo.png" alt="ZENELAIT Logo" style={{ height: '120px', objectFit: 'contain' }} />
          </Link>

          {/* Nav Links */}
          <nav className={`navbar-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
            {isMobileMenuOpen && (
              <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            )}
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/search?category=New Arrivals" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
            
            {/* Dynamic Mega Menu fetched from Database */}
            {dbCategories.length > 0 ? (
              dbCategories.filter(c => c.parentCategory === 'None' || c.parentCategory === 'none').map(dept => {
                const groups = dbCategories.filter(c => c.parentCategory === dept.id);
                const isActive = activeMegaMenu === dept.id;
                return (
                  <div 
                    className={`nav-item-wrapper ${isActive ? 'active-menu' : ''}`} 
                    key={dept.id}
                    onMouseEnter={() => setActiveMegaMenu(dept.id)}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                  >
                    <Link to={`/products?gender=${dept.name.toLowerCase()}`} className="nav-link" onClick={() => { setIsMobileMenuOpen(false); setActiveMegaMenu(null); }}>
                      {dept.name}
                    </Link>
                    {groups.length > 0 && (
                      <div className="mega-menu-overlay">
                        <div className="container mega-menu-grid">
                          {groups.map(group => {
                            const subs = dbCategories.filter(c => c.parentCategory === group.id);
                            return (
                              <div className="mega-menu-column" key={group.id}>
                                <h4>{group.name}</h4>
                                {subs.map(sub => (
                                  <Link 
                                    key={sub.id} 
                                    to={`/products?gender=${dept.name.toLowerCase()}&subcategory=${sub.slug}`} 
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setActiveMegaMenu(null);
                                    }}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                <Link to="/products?gender=men" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Men</Link>
                <Link to="/products?gender=women" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Women</Link>
                <Link to="/products?gender=kids" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Kids</Link>
              </>
            )}

            <Link to="/search?category=Sale" className="nav-link text-gold" onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            <button className="action-btn" onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>

            <button className="action-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <Link to="/dashboard?tab=wishlist" className="action-btn wishlist-icon-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="action-badge bg-rose">{wishlist.length}</span>}
            </Link>

            <button className="action-btn cart-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Shopping Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="action-badge bg-gold">{cartCount}</span>}
            </button>

            <div className="relative-container" style={{ position: 'relative' }}>
              <button className="action-btn" onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsCartOpen(false); }} aria-label="Notifications">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="action-badge bg-rose" style={{ top: '-4px', right: '-4px' }}>{notifications.filter(n => !n.read).length}</span>
                )}
              </button>

              {isNotifyOpen && (
                <div className="topbar-dropdown glass-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '10px',
                  zIndex: 1002,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'serif' }}>Client Notifications</h4>
                    {notifications.length > 0 && (
                      <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Clear all
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '12px 0' }}>No active notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          background: n.read ? 'transparent' : 'rgba(212,175,55,0.05)',
                          borderLeft: n.read ? 'none' : '3px solid var(--accent-gold)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: n.read ? 'normal' : '600', lineHeight: 1.3 }}>{n.text}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginLeft: '6px' }}>
                            {!n.read && (
                              <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>
                                Read
                              </button>
                            )}
                            <button onClick={() => clearNotification(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-rose)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>
                              Clear
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/dashboard" className="action-btn" aria-label="User Profile">
              <User size={20} />
            </Link>

            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <div className={`drawer-overlay ${isCartOpen ? 'drawer-active' : ''}`} onClick={() => setIsCartOpen(false)}>
        <div className="cart-drawer glass-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="serif-text">Shopping Bag ({cartCount})</h2>
            <button onClick={() => setIsCartOpen(false)} aria-label="Close Cart"><X size={24} /></button>
          </div>

          <div className="drawer-body">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={48} className="text-muted mb-4 animate-float" />
                <p className="text-secondary mb-4">Your premium wardrobe is empty.</p>
                <button onClick={() => { setIsCartOpen(false); navigate('/'); }} className="btn-premium btn-premium-primary">
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="cart-items-list">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="cart-item">
                    <img src={item.product.images[0]} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h4>{item.product.name}</h4>
                      <p className="item-meta">
                        Size: <span>{item.selectedSize}</span> | Color:{' '}
                        <span
                          className="color-swatch-mini"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                      </p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <p className="cart-item-price">₹{item.product.price * item.quantity}</p>
                      <button
                        className="delete-item-btn"
                        onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="drawer-footer">
              <div className="subtotal-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <p className="tax-hint">Taxes and luxury packaging calculated at checkout.</p>
              <button
                className="btn-premium btn-premium-primary w-full"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Search Overlay */}
      <div className={`drawer-overlay ${isSearchOpen ? 'drawer-active' : ''}`} onClick={() => setIsSearchOpen(false)}>
        <div className="search-panel glass-panel" onClick={e => e.stopPropagation()}>
          <div className="container search-container">
            <div className="search-header">
              <h2 className="serif-text">Search the Collection</h2>
              <button onClick={() => setIsSearchOpen(false)} aria-label="Close Search"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by product, category, or brand..."
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit-btn"><ChevronRight size={24} /></button>
            </form>

            <div className="search-results-suggestions">
              {suggestions.length > 0 ? (
                <div className="suggestions-section">
                  <h3>Suggestions</h3>
                  <div className="suggestions-list">
                    {suggestions.map(p => (
                      <div key={p.id} className="suggestion-item" onClick={() => selectSuggestion(p.name)}>
                        <Sparkles size={14} className="text-gold" />
                        <span>{p.name}</span>
                        <span className="suggestion-category">in {p.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery.trim() ? (
                <p className="no-suggestions">No results match your search term.</p>
              ) : (
                <div className="trending-searches">
                  <h3>Trending Searches</h3>
                  <div className="trending-tags">
                    <span onClick={() => { setSearchQuery('Silk Dress'); navigate('/search?q=Silk'); setIsSearchOpen(false); }}>Silk Dress</span>
                    <span onClick={() => { setSearchQuery('Cashmere'); navigate('/search?q=Cashmere'); setIsSearchOpen(false); }}>Cashmere</span>
                    <span onClick={() => { setSearchQuery('Leather Jacket'); navigate('/search?q=Leather'); setIsSearchOpen(false); }}>Leather Jacket</span>
                    <span onClick={() => { setSearchQuery('Gucci'); navigate('/search?q=Gucci'); setIsSearchOpen(false); }}>Gucci Collection</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
