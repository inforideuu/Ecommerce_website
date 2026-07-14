import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';

interface ReviewItem {
  id: string;
  reviewer: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  status: 'pending' | 'approved' | 'archived';
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formFields, setFormFields] = useState({
    reviewer: '',
    rating: 5,
    productName: 'General Collection',
    comment: '',
    status: 'approved' as 'pending' | 'approved' | 'archived'
  });

  const fetchReviews = () => {
    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/reviews')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((r: any) => ({
          id: r.id,
          reviewer: r.customerName || r.reviewer || '',
          rating: r.rating,
          date: r.date,
          comment: r.comment,
          productName: r.productName,
          status: r.status
        }));
        setReviews(mapped);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = (id: string, status: ReviewItem['status']) => {
    const target = reviews.find(r => r.id === id);
    if (!target) return;

    const payload = {
      id: target.id,
      customerName: target.reviewer,
      productName: target.productName,
      rating: target.rating,
      comment: target.comment,
      date: target.date,
      status: status
    };

    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        fetchReviews();
        alert(`Review status updated to ${status}.`);
      })
      .catch(err => console.error(err));
  };

  const deleteReview = (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      fetch(`https://ecommerce-website-hvuy.onrender.com/api/admin/reviews?id=${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => fetchReviews())
        .catch(err => console.error(err));
    }
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: `rev-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formFields.reviewer,
      productName: formFields.productName,
      rating: formFields.rating,
      comment: formFields.comment,
      date: new Date().toISOString().split('T')[0],
      status: formFields.status
    };

    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setIsFormOpen(false);
        fetchReviews();
        setFormFields({
          reviewer: '',
          rating: 5,
          productName: 'General Collection',
          comment: '',
          status: 'approved'
        });
      })
      .catch(err => console.error(err));
  };
  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Client Testimonials</h1>
          <p className="subtitle">Moderate user feedback, review ratings metrics, and edit testimonials.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-admin btn-admin-primary">
          Add Testimonial
        </button>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Product</th>
              <th>Feedback</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{r.reviewer}</strong>
                  <span className="product-sub-category">{r.date}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < r.rating ? 'var(--accent-gold)' : 'none'} 
                        color="var(--accent-gold)" 
                      />
                    ))}
                  </div>
                </td>
                <td><strong>{r.productName}</strong></td>
                <td style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: '0.9rem' }}>
                  "{r.comment}"
                </td>
                <td>
                  <span className={`status-badge ${r.status === 'approved' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {r.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-actions-group">
                    {r.status !== 'approved' && (
                      <button onClick={() => handleAction(r.id, 'approved')} className="text-emerald" title="Approve Review">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {r.status !== 'archived' && (
                      <button onClick={() => handleAction(r.id, 'archived')} className="text-warning" title="Archive Review">
                        <ShieldAlert size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteReview(r.id)} className="text-rose" title="Delete Review">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsFormOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{
            maxWidth: '500px', width: '90%', padding: '24px', borderRadius: '12px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 className="serif-text" style={{ margin: 0 }}>Add New Testimonial</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reviewer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scarlett Johansson"
                  value={formFields.reviewer}
                  onChange={e => setFormFields({ ...formFields, reviewer: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product Reference (or Brand Quote)</label>
                <input
                  type="text"
                  required
                  value={formFields.productName}
                  onChange={e => setFormFields({ ...formFields, productName: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Star Rating (1-5)</label>
                <select
                  value={formFields.rating}
                  onChange={e => setFormFields({ ...formFields, rating: Number(e.target.value) })}
                  className="form-control"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Testimonial Quote</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the testimonial quote text here..."
                  value={formFields.comment}
                  onChange={e => setFormFields({ ...formFields, comment: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', padding: '8px', marginTop: '4px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-admin btn-admin-primary w-full" style={{ padding: '10px', marginTop: '8px' }}>
                Publish Testimonial
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reviews;
