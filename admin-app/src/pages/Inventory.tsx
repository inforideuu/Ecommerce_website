import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Layers } from 'lucide-react';
import type { AdminProduct } from '../data/mockData';

interface InventoryProps {
  globalSearch?: string;
}

export const Inventory: React.FC<InventoryProps> = ({ globalSearch = '' }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/api/admin/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch inventory:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const adjustStock = (id: string, newStock: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Optimistic state update
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));

    fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, stock: Math.max(0, newStock) })
    })
      .then(res => res.json())
      .then(() => fetchProducts())
      .catch(err => console.error('Failed to adjust stock:', err));
  };

  const filteredProducts = products.filter(p => {
    const activeSearch = globalSearch || searchQuery;
    const matchesSearch = p.name.toLowerCase().includes(activeSearch.toLowerCase()) || p.sku.toLowerCase().includes(activeSearch.toLowerCase());
    
    let matchesStock = true;
    if (selectedStockStatus === 'low') {
      matchesStock = p.stock > 0 && p.stock <= 10;
    } else if (selectedStockStatus === 'out') {
      matchesStock = p.stock === 0;
    } else if (selectedStockStatus === 'healthy') {
      matchesStock = p.stock > 10;
    }

    return matchesSearch && matchesStock;
  });

  const totalItemsInWarehouse = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Warehouse Inventory</h1>
          <p className="subtitle">Real-time stock audits, inline batch adjustments, and valuation details.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Total Units on Hand</span>
            <Layers size={18} className="text-indigo" />
          </div>
          <h3>{totalItemsInWarehouse}</h3>
          <div className="kpi-footer">
            <span>Across all warehouses</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Low Stock SKUs</span>
            <AlertTriangle size={18} className="text-warning" />
          </div>
          <h3>{lowStockCount}</h3>
          <div className="kpi-footer">
            <span className="trend-warn">Needs Attention</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span>Out of Stock SKUs</span>
            <AlertTriangle size={18} className="text-rose" />
          </div>
          <h3>{outOfStockCount}</h3>
          <div className="kpi-footer">
            <span className="trend-warn">Critical Priority</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters-bar glass-card">
        <div className="filter-search-input">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="select-wrapper">
          <select value={selectedStockStatus} onChange={e => setSelectedStockStatus(e.target.value)}>
            <option value="">All Stock Levels</option>
            <option value="healthy">Healthy (&gt; 10 units)</option>
            <option value="low">Low Stock (1-10 units)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory table */}
      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>SKU / Barcode</th>
              <th>Cost Price</th>
              <th>Retail Price</th>
              <th>Profit Margin</th>
              <th style={{ minWidth: '150px' }}>Current Stock</th>
              <th style={{ textAlign: 'right' }}>Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const margin = p.price - p.costPrice;
              const marginPercent = Math.round((margin / p.price) * 100) || 0;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.images[0]} alt={p.name} className="product-table-thumb" />
                      <div>
                        <strong>{p.name}</strong>
                        <span className="product-sub-category">{p.brand} | {p.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{p.sku}</code>
                    <span className="product-sub-category">{p.barcode}</span>
                  </td>
                  <td className="text-muted">₹{p.costPrice}</td>
                  <td><strong>₹{p.price}</strong></td>
                  <td>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>
                      ₹{margin} ({marginPercent}%)
                    </span>
                  </td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="status-badge badge-danger">Out of Stock</span>
                    ) : p.stock <= 10 ? (
                      <span className="status-badge badge-warning">{p.stock} Low Stock</span>
                    ) : (
                      <span className="status-badge badge-success">{p.stock} Units</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        onClick={() => adjustStock(p.id, p.stock - 1)} 
                        className="btn-admin btn-admin-secondary" 
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        disabled={p.stock === 0}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', width: '24px', display: 'inline-block', textAlign: 'center' }}>{p.stock}</span>
                      <button 
                        onClick={() => adjustStock(p.id, p.stock + 1)} 
                        className="btn-admin btn-admin-secondary" 
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Inventory;