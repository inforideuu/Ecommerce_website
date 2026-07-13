import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Brands } from './pages/Brands';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Settings } from './pages/Settings';
import { Inventory } from './pages/Inventory';
import { Reviews } from './pages/Reviews';
import { Coupons } from './pages/Coupons';
import { Analytics } from './pages/Analytics';
import { SupportTickets } from './pages/SupportTickets';

// Premium Login Screen Component
interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Super Admin');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Default checks
    if (email.toLowerCase() === 'superadmin@gmail.com' && password === 'admin123' && role === 'Super Admin') {
      onLogin({ name: 'Aria Montgomery', email: 'superadmin@gmail.com', role: 'Super Admin' });
      return;
    }
    if (email.toLowerCase() === 'inmanager@gmail.com' && password === 'manager123' && role === 'Inventory Manager') {
      onLogin({ name: 'Marcus Aurelius', email: 'inmanager@gmail.com', role: 'Inventory Manager' });
      return;
    }

    // Dynamic checks for accounts added by Super Admin in Settings
    const savedCreds = localStorage.getItem(`login_credentials_${email.toLowerCase()}`);
    if (savedCreds) {
      const creds = JSON.parse(savedCreds);
      if (creds.password === password && creds.role === role) {
        onLogin({ name: creds.name, email: creds.email, role: creds.role });
        return;
      }
    }

    alert('Invalid login credentials or role assignment.\n\nDefaults:\nSuper Admin: superadmin@gmail.com / admin123\nInventory Manager: inmanager@gmail.com / manager123');
  };

  return (
    <div className="login-split-container">
      <style>{`
        .login-split-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: #000;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        .login-brand-side {
          flex: 1.6;
          background: url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
        }
        .login-brand-side::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(6, 6, 6, 0.95) 20%, rgba(212, 175, 55, 0.25) 100%);
          z-index: 1;
        }
        .login-brand-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .login-form-side {
          flex: 1.1;
          background: #060606;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }
        .login-form-card {
          width: 100%;
          max-width: 420px;
          padding: 45px;
          border-radius: 16px;
          border: 1px solid rgba(212, 175, 55, 0.15);
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(25px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          animation: cardFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: var(--accent-gold);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid var(--accent-gold);
          background: linear-gradient(135deg, var(--accent-gold) 0%, #b8860b 100%);
          color: #faf4f4ff;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(212, 175, 55, 0.15);
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(212, 175, 55, 0.3);
          opacity: 0.95;
        }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .login-brand-side { display: none; }
          .login-form-side { flex: 1; min-height: 100vh; }
        }
      `}</style>

      {/* Left Brand Side */}
      <div className="login-brand-side">
        <div className="login-brand-content">
          <div>
            <h1 className="serif-text" style={{ fontSize: '2.5rem', letterSpacing: '0.15em', fontWeight: 800, margin: 0, color: '#fff' }}>
              zenelait
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
              Haute Couture
            </span>
          </div>

          <div style={{ maxWidth: '460px', marginBottom: '40px' }}>
            <h2 className="serif-text" style={{ fontSize: '2.2rem', lineHeight: '1.2', color: '#fff', margin: '0 0 16px 0', fontWeight: 'normal' }}>
              Where gravity ends, <span style={{ fontStyle: 'italic', color: 'var(--accent-gold)' }}>elegance</span> begins.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6', margin: 0 }}>
              Access the private collection administrative panel. Track luxury orders, audit inventory valuation, and manage client profiles.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 1)' }}>
              © 2026 zenelait System inc.
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Exclusive Admin Access
            </span>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="login-form-side">
        <div className="login-form-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 className="serif-text" style={{ fontSize: '1.6rem', letterSpacing: '0.05em', fontWeight: 600, margin: 0, color: '#fff' }}>
              Sign In
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px', margin: '6px 0 0 0' }}>
              Administrative Portal
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. superadmin@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="login-input"
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.03) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23d4af37\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center/14px' }}
              >
                <option value="Super Admin" style={{ background: '#111', color: '#fff' }}>Super Admin</option>
                <option value="Inventory Manager" style={{ background: '#111', color: '#fff' }}>Inventory Manager</option>
              </select>
            </div>

            <button type="submit" className="login-btn">
              Authorize Access
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Manage Current User Authentication State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    alert('Logged out successfully.');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Restrict access to settings/other tabs for inventory managers if necessary
  const filteredActiveTab = (currentUser.role === 'Inventory Manager' && ['settings', 'customers', 'orders', 'coupons'].includes(activeTab))
    ? 'inventory'
    : activeTab;

  return (
    <ThemeProvider>
      <div className="admin-layout" style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <Sidebar activeTab={filteredActiveTab} setActiveTab={setActiveTab} onLogout={handleLogout} userRole={currentUser?.role} />

        <div className="admin-main-wrapper" style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0', marginLeft: '260px', padding: '0' }}>
          <Topbar />

          <main className="admin-main-content">
            {filteredActiveTab === 'dashboard' && <Dashboard />}
            {filteredActiveTab === 'products' && <Products />}
            {filteredActiveTab === 'categories' && <Categories />}
            {filteredActiveTab === 'brands' && <Brands />}
            {filteredActiveTab === 'inventory' && <Inventory />}
            {filteredActiveTab === 'orders' && <Orders />}
            {filteredActiveTab === 'customers' && <Customers />}
            {filteredActiveTab === 'reviews' && <Reviews />}
            {filteredActiveTab === 'coupons' && <Coupons />}
            {filteredActiveTab === 'analytics' && <Analytics />}
            {filteredActiveTab === 'settings' && <Settings />}
            {filteredActiveTab === 'support' && <SupportTickets />}

            {/* Fallbacks for non-implemented placeholder tabs */}
            {!['dashboard', 'products', 'categories', 'brands', 'inventory', 'orders', 'customers', 'reviews', 'coupons', 'analytics', 'settings', 'support'].includes(filteredActiveTab) && (
              <div className="glass-card text-center" style={{ padding: '80px 40px' }}>
                <h2 className="serif-text">Module Coming Soon</h2>
                <p className="text-secondary" style={{ marginTop: '10px' }}>
                  The administrative view for "{filteredActiveTab}" is currently under private beta clearance.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
