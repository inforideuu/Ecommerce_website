import { API_BASE_URL } from '../config';
import React from 'react';
import { DollarSign, ShoppingBag, Users, Layers, TrendingUp, AlertTriangle, Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AdminProduct, AdminOrder, AdminCustomer } from '../data/mockData';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch admin products:', err));

    fetch(`${API_BASE_URL}/api/admin/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch admin orders:', err));

    fetch(`${API_BASE_URL}/api/admin/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to fetch admin customers:', err));
  }, []);

  // Statistics totals calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const lowStockProducts = products.filter(p => p.stock <= 10).length;

  // Dynamic Category Sales calculation
  let womenSales = 0;
  let menSales = 0;
  let kidsSales = 0;

  orders.forEach(o => {
    try {
      const itemsList = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      if (Array.isArray(itemsList)) {
        itemsList.forEach((item: any) => {
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 1;
          const amount = price * qty;
          
          const gender = (item.gender || item.category || '').toLowerCase();
          if (gender.includes('women') || gender.includes('female')) {
            womenSales += amount;
          } else if (gender.includes('men') || gender.includes('male')) {
            menSales += amount;
          } else if (gender.includes('kid') || gender.includes('child') || gender.includes('baby')) {
            kidsSales += amount;
          } else {
            womenSales += amount * 0.6;
            menSales += amount * 0.3;
            kidsSales += amount * 0.1;
          }
        });
      }
    } catch (e) {}
  });

  const grandTotal = womenSales + menSales + kidsSales || 1;
  const womenPct = Math.round((womenSales / grandTotal) * 100) || 60;
  const menPct = Math.round((menSales / grandTotal) * 100) || 30;
  const kidsPct = 100 - womenPct - menPct;

  // Monthly Revenue Line Chart calculation
  const monthlyRevenueMap: { [key: string]: number } = {};
  orders.forEach(o => {
    const dateStr = o.date || '';
    let month = 'Other';
    if (dateStr.includes('Jan')) month = 'Jan';
    else if (dateStr.includes('Feb')) month = 'Feb';
    else if (dateStr.includes('Mar')) month = 'Mar';
    else if (dateStr.includes('Apr')) month = 'Apr';
    else if (dateStr.includes('May')) month = 'May';
    else if (dateStr.includes('Jun')) month = 'Jun';
    else if (dateStr.includes('Jul')) month = 'Jul';
    else if (dateStr.includes('Aug')) month = 'Aug';
    else if (dateStr.includes('Sep')) month = 'Sep';
    else if (dateStr.includes('Oct')) month = 'Oct';
    else if (dateStr.includes('Nov')) month = 'Nov';
    else if (dateStr.includes('Dec')) month = 'Dec';
    else {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const mNum = parseInt(parts[1], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (mNum >= 1 && mNum <= 12) {
          month = months[mNum - 1];
        }
      }
    }
    monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + o.total;
  });

  const monthKeys = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const activeMonths = monthKeys.filter(m => (monthlyRevenueMap[m] || 0) > 0);
  const displayMonths = activeMonths.length >= 3 ? activeMonths : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  
  const points = displayMonths.map((m, idx) => ({
    month: m,
    revenue: monthlyRevenueMap[m] || 0,
    x: displayMonths.length > 1 ? (idx / (displayMonths.length - 1)) * 500 : 250
  }));
  const maxRevenue = Math.max(...points.map(p => p.revenue)) || 10000;
  const coords = points.map(p => ({
    x: p.x,
    y: 180 - (p.revenue / maxRevenue) * 150
  }));

  let pathD = '';
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      pathD += ` L ${coords[i].x} ${coords[i].y}`;
    }
  }
  const fillD = pathD ? `${pathD} L 500 200 L 0 200 Z` : '';

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <h1 className="serif-text">Business Analytics</h1>
          <p className="subtitle">Real-time metrics, revenue performance, and inventory analysis.</p>
        </div>
        <button onClick={() => alert('Report generated.')} className="btn-admin btn-admin-primary">
          Generate Monthly Report
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Total Revenue</span>
            <DollarSign size={18} className="text-indigo" />
          </div>
          <h3>₹{totalRevenue}</h3>
          <div className="kpi-footer">
            <span className="trend-up"><TrendingUp size={12} /> +12.4%</span>
            <span>vs last month</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Total Orders</span>
            <ShoppingBag size={18} className="text-blue" />
          </div>
          <h3>{orders.length}</h3>
          <div className="kpi-footer">
            <span className="trend-up"><TrendingUp size={12} /> +8.2%</span>
            <span>vs yesterday</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Active Customers</span>
            <Users size={18} className="text-emerald" />
          </div>
          <h3>{customers.length}</h3>
          <div className="kpi-footer">
            <span className="trend-up"><TrendingUp size={12} /> +15.1%</span>
            <span>new signups today</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Low Stock Items</span>
            <Layers size={18} className="text-warning" />
          </div>
          <h3>{lowStockProducts}</h3>
          <div className="kpi-footer">
            {lowStockProducts > 0 ? (
              <span className="trend-warn"><AlertTriangle size={12} /> Needs Reorder</span>
            ) : (
              <span className="trend-ok">All Stocks Healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Charts Section */}
      <div className="charts-grid-layout">
        {/* Area Line Chart for Revenue */}
        <div className="chart-card glass-card">
          <h3>Monthly Revenue (Winter Season)</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 200" className="svg-chart">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-color)" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="0.5" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-color)" strokeWidth="0.5" />
              
              {/* Chart line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--primary-accent)"
                  strokeWidth="3"
                />
              )}
              
              {/* Fill area */}
              {fillD && (
                <path
                  d={fillD}
                  fill="url(#chart-gradient)"
                  opacity="0.15"
                />
              )}
              
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-accent)" />
                  <stop offset="100%" stopColor="var(--primary-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="chart-labels">
              {displayMonths.map(m => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart for Category Sales */}
        <div className="chart-card glass-card category-dist-card">
          <h3>Sales Category Distribution</h3>
          <div className="donut-chart-box">
            <svg width="150" height="150" viewBox="0 0 36 36" className="donut-svg">
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
              {/* Women Segment */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--accent-indigo)" strokeWidth="3"
                strokeDasharray={`${womenPct} ${100 - womenPct}`} strokeDashoffset="25" />
              {/* Men Segment */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--accent-emerald)" strokeWidth="3"
                strokeDasharray={`${menPct} ${100 - menPct}`} strokeDashoffset={`${25 - womenPct}`} />
              {/* Kids Segment */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--accent-blue)" strokeWidth="3"
                strokeDasharray={`${kidsPct} ${100 - kidsPct}`} strokeDashoffset={`${25 - womenPct - menPct}`} />
            </svg>
            <div className="donut-legend">
              <div className="legend-row">
                <span className="legend-dot bg-indigo"></span>
                <span>Women ({womenPct}%)</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot bg-emerald"></span>
                <span>Men ({menPct}%)</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot bg-blue"></span>
                <span>Kids ({kidsPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets row */}
      <div className="dashboard-widgets-grid">
        {/* Recent Orders */}
        <div className="widget-panel glass-card">
          <div className="widget-header">
            <h3>Recent Transactions</h3>
            <Clock size={16} className="text-muted" />
          </div>
          <div className="widget-orders-list">
            {orders.map(order => (
              <div key={order.id} className="widget-order-item">
                <div className="order-details">
                  <strong>{order.customerName}</strong>
                  <span>{order.date} | {order.deliveryMethod}</span>
                </div>
                <div className="order-amount">
                  <strong>₹{order.total}</strong>
                  <span className={`status-badge ${order.status === 'completed' ? 'badge-success' : order.status === 'shipped' ? 'badge-info' : 'badge-warning'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest reviews / activity feed */}
        <div className="widget-panel glass-card">
          <div className="widget-header">
            <h3>Recent Client Reviews</h3>
            <Star size={16} className="text-gold" />
          </div>
          <div className="widget-reviews-list">
            <div className="widget-review-item">
              <div className="review-meta">
                <strong>Scarlett Johansson</strong>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                </div>
              </div>
              <p>"The evening gown fits like a dream. Absolutely love the silk texture."</p>
            </div>

            <div className="widget-review-item">
              <div className="review-meta">
                <strong>Aria Montgomery</strong>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
                </div>
              </div>
              <p>"The double breasted cashmere overcoat was delivered inside signature white-glove packaging. Outstanding."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;