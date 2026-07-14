import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, X } from 'lucide-react';
import type { AdminCustomer } from '../data/mockData';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    points: 0,
    ordersCount: 0,
    address: '',
    status: 'active' as 'active' | 'blocked'
  });

  const selectCustomer = (c: AdminCustomer) => {
    setSelectedCustomer(c);
    setCustomerForm({
      name: c.name,
      email: c.email,
      points: c.points,
      ordersCount: c.ordersCount,
      address: c.address || '',
      status: c.status
    });
  };

  const handleCustomerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    fetch(`https://ecommerce-website-hvuy.onrender.com/api/admin/customers/${selectedCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerForm)
    })
      .then(res => res.json())
      .then(() => {
        fetchCustomers();
        setSelectedCustomer(null);
        alert('Customer details updated successfully!');
      })
      .catch(err => console.error(err));
  };

  const fetchCustomers = () => {
    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/customers')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch customers:', err));
  };

  // Safe fallback to setProducts since state uses setCustomers
  const setProducts = (data: any) => {
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleStatus = (id: string) => {
    setCustomers(customers.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'blocked' : 'active';
        alert(`Customer ${c.name} is now ${newStatus}.`);
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Client Relationship Management</h1>
          <p className="subtitle">View purchase profiles, manage reward levels, and toggle active status.</p>
        </div>
      </div>

      <div className="products-filters-bar glass-card">
        <div className="filter-search-input">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Email</th>
              <th>Super Coins</th>
              <th>Orders count</th>
              <th>Primary address</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id} onClick={() => selectCustomer(c)} style={{ cursor: 'pointer' }} className="row-hover">
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td><strong className="text-gold">{c.points} Coins</strong></td>
                <td>{c.ordersCount} orders</td>
                <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</td>
                <td>
                  <span className={`status-badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-actions-group">
                    {/* <button
                      onClick={() => {
                        if (window.confirm(`Upgrade ${c.name} to VIP Gold Status?`)) {
                          fetch(`https://ecommerce-website-hvuy.onrender.com/api/admin/customers/${c.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ points: 10000, ordersCount: 10, status: c.status })
                          })
                            .then(res => res.json())
                            .then(() => {
                              fetchCustomers();
                              alert(`${c.name} promoted to VIP Gold Status!`);
                            })
                            .catch(err => console.error(err));
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '1rem' }}
                      title="Promote to Gold Member"
                    >
                      👑
                    </button> */}
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(c.id); }} className="text-rose" title={c.status === 'active' ? 'Block Account' : 'Activate Account'}>
                      <ShieldAlert size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="form-drawer-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="form-drawer glass-card" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Customer details ({selectedCustomer.name})</h2>
              <button onClick={() => setSelectedCustomer(null)}><X size={20} /></button>
            </div>

            <div className="drawer-scroll-body" style={{ padding: '20px' }}>
              <form onSubmit={handleCustomerUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="form-control"
                    style={{ padding: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="form-control"
                    style={{ padding: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Super Coins</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customerForm.points}
                    onChange={e => setCustomerForm({ ...customerForm, points: Number(e.target.value) })}
                    className="form-control"
                    style={{ padding: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders Count</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customerForm.ordersCount}
                    onChange={e => setCustomerForm({ ...customerForm, ordersCount: Number(e.target.value) })}
                    className="form-control"
                    style={{ padding: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary Address</label>
                  <textarea
                    value={customerForm.address}
                    onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="form-control"
                    rows={3}
                    style={{ padding: '10px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Status</label>
                  <select
                    value={customerForm.status}
                    onChange={e => setCustomerForm({ ...customerForm, status: e.target.value as 'active' | 'blocked' })}
                    className="form-control"
                    style={{ padding: '10px' }}
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked / Suspended</option>
                  </select>
                </div>

                <button type="submit" className="btn-admin btn-admin-primary w-full mt-4" style={{ padding: '12px' }}>
                  Update Customer Details
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Customers;
