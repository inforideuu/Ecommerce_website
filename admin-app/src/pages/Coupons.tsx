import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, X } from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  requiredSupercoins: number;
  expiry: string;
  status: 'active' | 'expired';
}

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minPurchase: 0,
    requiredSupercoins: 0,
    expiry: '',
    status: 'active' as 'active' | 'expired'
  });

  const fetchCoupons = () => {
    fetch(`${API_BASE_URL}/api/admin/coupons`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((c: any) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minPurchase: c.minPurchase || 0,
          requiredSupercoins: c.requiredSupercoins || 0,
          expiry: c.endDate || c.expiry || '',
          status: c.status
        }));
        setCoupons(mapped);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: '',
      code: formFields.code,
      type: formFields.type,
      value: formFields.value,
      minPurchase: formFields.minPurchase,
      requiredSupercoins: formFields.requiredSupercoins,
      startDate: new Date().toISOString().split('T')[0],
      endDate: formFields.expiry,
      status: formFields.status,
      usageCount: 0
    };

    fetch(`${API_BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setIsFormOpen(false);
        fetchCoupons();
        setFormFields({
          code: '',
          type: 'percentage',
          value: 10,
          minPurchase: 0,
          requiredSupercoins: 0,
          expiry: '',
          status: 'active'
        });
      })
      .catch(err => console.error(err));
  };

  const deleteCoupon = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      fetch(`${API_BASE_URL}/api/admin/coupons?id=${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => fetchCoupons())
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Promo Campaign Codes</h1>
          <p className="subtitle">Add seasonal discount rates, manage exclusive influencer campaigns, and track rules.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-admin btn-admin-primary">
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Value</th>
              <th>Campaign Type</th>
              <th>Required Super Coins</th>
              <th>Expiry Date</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ticket size={16} className="text-gold" />
                    <strong>{c.code}</strong>
                  </div>
                </td>
                <td>
                  <strong>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</strong>
                </td>
                <td>{c.type === 'percentage' ? 'Percentage Off' : 'Flat Rupee Off'}</td>
                <td>
                  <strong style={{ color: c.requiredSupercoins > 0 ? 'var(--accent-gold)' : 'inherit' }}>
                    {c.requiredSupercoins > 0 ? `${c.requiredSupercoins} Coins` : '0 (Free)'}
                  </strong>
                </td>
                <td>{c.expiry}</td>
                <td>
                  <span className={`status-badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {c.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => deleteCoupon(c.id)} className="text-rose" title="Delete Coupon">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <div className="form-drawer-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="form-drawer glass-card" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Add Promo Code</h2>
              <button onClick={() => setIsFormOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="drawer-scroll-body">
              <div className="form-group">
                <label>Coupon Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={formFields.code}
                  onChange={e => setFormFields({ ...formFields, code: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formFields.type}
                  onChange={e => setFormFields({ ...formFields, type: e.target.value as 'percentage' | 'fixed' })}
                  className="form-control"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Price Discount (₹)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formFields.value}
                  onChange={e => setFormFields({ ...formFields, value: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Required Super Coins (0 if standard coupon)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formFields.requiredSupercoins}
                  onChange={e => setFormFields({ ...formFields, requiredSupercoins: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Min Purchase Required (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formFields.minPurchase}
                  onChange={e => setFormFields({ ...formFields, minPurchase: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formFields.expiry}
                  onChange={e => setFormFields({ ...formFields, expiry: e.target.value })}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn-admin btn-admin-primary w-full mt-4">
                Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Coupons;