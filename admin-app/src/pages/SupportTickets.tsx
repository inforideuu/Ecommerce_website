import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Crown, ShieldAlert, MessageCircle } from 'lucide-react';

interface Ticket {
  id: string;
  customerEmail: string;
  customerName: string;
  message: string;
  status: string;
  date: string;
}

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    fetch(`${API_BASE_URL}/api/support-tickets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTickets(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching support tickets:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    fetch(`${API_BASE_URL}/api/support-tickets`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`Ticket status updated to "${newStatus}"`);
          fetchTickets();
        } else {
          alert('Failed to update ticket status.');
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="admin-page-content" style={{ padding: '24px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="serif-text" style={{ fontSize: '2rem', margin: 0, fontWeight: 300, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown className="text-gold" size={28} /> VIP Support Tickets
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Verify, approve, or reject customer concierge requests to unlock profile settings.
          </p>
        </div>
        <button className="btn-premium btn-premium-primary" onClick={fetchTickets} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          Refresh Tickets
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p className="text-secondary">Retrieving live VIP concierge tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '60px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <MessageCircle size={40} className="text-muted" style={{ marginBottom: '12px' }} />
          <h3 className="serif-text" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Support Tickets</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>All VIP profile unlock requests are resolved.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: ticket.status === 'Pending Verification' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <ShieldAlert className={ticket.status === 'Pending Verification' ? 'text-gold' : 'text-muted'} size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{ticket.customerName}</span>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>({ticket.customerEmail})</span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>ID: {ticket.id}</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    Request Details: <strong>"{ticket.message}"</strong>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged on {ticket.date}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <span className="status-badge" style={{ 
                  background: ticket.status === 'Approved & Unlocked' ? 'rgba(16, 185, 129, 0.1)' : ticket.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)', 
                  color: ticket.status === 'Approved & Unlocked' ? '#10b981' : ticket.status === 'Rejected' ? '#ef4444' : 'var(--accent-gold)', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: `1px solid ${ticket.status === 'Approved & Unlocked' ? '#10b981' : ticket.status === 'Rejected' ? '#ef4444' : 'var(--accent-gold)'}`
                }}>
                  {ticket.status}
                </span>

                {ticket.status === 'Pending Verification' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'Approved & Unlocked')}
                      className="btn-premium btn-premium-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Approve & Unlock
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'Rejected')}
                      className="btn-premium btn-premium-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};