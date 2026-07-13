import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/analytics')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const totalSales = stats ? stats.totalSales : 0;
  const totalOrders = stats ? stats.totalOrders : 0;
  const totalProducts = stats ? stats.totalProducts : 0;
  const totalCustomers = stats ? stats.totalCustomers : 0;

  // Dynamic Chart calculations
  let linePath = "M 0 150 L 500 150";
  let fillPath = "M 0 150 L 500 150 L 500 200 L 0 200 Z";
  let salesLabels: string[] = ["Q1", "Q2", "Q3", "Q4"];

  if (stats && Array.isArray(stats.salesHistory) && stats.salesHistory.length > 0) {
    const history = stats.salesHistory;
    const maxRev = Math.max(...history.map((h: any) => h.revenue)) || 1000;
    const pointsCoords = history.map((h: any, idx: number) => {
      const x = history.length > 1 ? (idx / (history.length - 1)) * 500 : 250;
      const y = 180 - (h.revenue / maxRev) * 150;
      return { x, y };
    });
    linePath = `M ${pointsCoords[0].x} ${pointsCoords[0].y}` + pointsCoords.slice(1).map((p: any) => ` L ${p.x} ${p.y}`).join('');
    fillPath = `${linePath} L 500 200 L 0 200 Z`;
    salesLabels = history.map((h: any) => {
      return h.date ? h.date.substring(5) : '';
    });
  }

  // Dynamic Catalog Category Breakdown (Horizontal Bars)
  const categoryDist = stats && Array.isArray(stats.categoryDistribution) ? stats.categoryDistribution : [];
  const totalCatCount = categoryDist.reduce((acc: number, c: any) => acc + c.count, 0) || 1;
  const sortedCats = [...categoryDist].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <h1 className="serif-text">Advanced Analytics</h1>
          <p className="subtitle">Interactive business metrics, performance indicators, and transaction data analysis.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Total Sales Revenue</span>
            <DollarSign size={18} className="text-indigo" />
          </div>
          <h3>₹{totalSales.toLocaleString()}</h3>
          <div className="kpi-footer">
            <span className="trend-up"><TrendingUp size={12} /> +12.4%</span>
            <span>cumulative database revenue</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Total Customer Accounts</span>
            <Users size={18} className="text-emerald" />
          </div>
          <h3>{totalCustomers}</h3>
          <div className="kpi-footer">
            <span className="trend-up"><TrendingUp size={12} /> +2.1%</span>
            <span>registered clients</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Order Volumes</span>
            <ShoppingCart size={18} className="text-warning" />
          </div>
          <h3>{totalOrders}</h3>
          <div className="kpi-footer">
            <span>total checkout transitions</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Catalog Items Count</span>
            <Package size={18} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h3>{totalProducts}</h3>
          <div className="kpi-footer">
            <span>active design listings</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts list from DB */}
      {stats && stats.lowStockAlerts && stats.lowStockAlerts.length > 0 && (
        <div className="premium-card glass-card" style={{ marginBottom: '24px', border: '1px solid rgba(225, 29, 72, 0.3)', background: 'rgba(225, 29, 72, 0.03)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Real-time Low Stock Warnings
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {stats.lowStockAlerts.map((item: any) => (
              <li key={item.id}>
                <strong>{item.name}</strong> (SKU: {item.id}) is running low on stock (Only <strong>{item.stock} left</strong>!)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SVGs Charts layout */}
      <div className="charts-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="chart-card glass-card">
          <h3>Annual Revenue Performance (₹ Lakhs)</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 200" className="svg-chart">
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-color)" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="0.5" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-color)" strokeWidth="0.5" />
              
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--accent-indigo)"
                  strokeWidth="3"
                />
              )}
              
              {fillPath && (
                <path
                  d={fillPath}
                  fill="url(#analytics-chart-gradient)"
                  opacity="0.15"
                />
              )}
              
              <defs>
                <linearGradient id="analytics-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-indigo)" />
                  <stop offset="100%" stopColor="var(--accent-indigo)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {salesLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Catalog Category Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {sortedCats.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No catalog categories found.</p>
            ) : (
              sortedCats.map((cat: any, idx: number) => {
                const pct = Math.round((cat.count / totalCatCount) * 100);
                const colors = ['var(--accent-indigo)', 'var(--accent-emerald)', 'var(--accent-blue)'];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{cat.category}</span>
                      <strong>{pct}% ({cat.count} items)</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
