import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, FolderOpen, Award, Layers, ShoppingCart, Users, Star, Ticket, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Search, Heart, Crown } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['dashboard', 'products']);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderOpen size={18} /> },
    { id: 'brands', label: 'Brands', icon: <Award size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Layers size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'support', label: 'VIP Support', icon: <Crown size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const visibleItems = userRole === 'Inventory Manager'
    ? menuItems.filter(item => ['dashboard', 'products', 'categories', 'brands', 'inventory', 'analytics'].includes(item.id))
    : menuItems;

  const filteredMenuItems = visibleItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`admin-sidebar glass-card ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header-brand">
        {!isCollapsed && <span className="brand-logo serif-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><img src="/ecomlogo.png" alt="Logo" style={{ height: '60px', objectFit: 'contain' }} /> <span className="brand-badge">ADMIN</span></span>}
        <button className="sidebar-collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="sidebar-search-container">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Navigation List */}
      <nav className="sidebar-nav-list">
        {filteredMenuItems.map(item => {
          const isFav = favorites.includes(item.id);
          return (
            <div
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-icon-label-pair">
                {item.icon}
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <button
                  className={`favorite-toggle ${isFav ? 'fav-active' : ''}`}
                  onClick={e => toggleFavorite(e, item.id)}
                  title="Pin Favorite"
                >
                  <Heart size={12} fill={isFav ? 'var(--accent-indigo)' : 'none'} />
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-nav-item logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          {!isCollapsed && <span className="nav-label">Logout</span>}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
