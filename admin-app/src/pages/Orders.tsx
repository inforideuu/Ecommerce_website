import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, FileText, X } from 'lucide-react';
import type { AdminOrder } from '../data/mockData';
import './Orders.css';

interface OrdersProps {
  globalSearch?: string;
}

export const Orders: React.FC<OrdersProps> = ({ globalSearch = '' }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected order details panel overlay
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!activeOrder) return;
    const fetchChat = () => {
      fetch(`${API_BASE_URL}/api/support-messages?orderId=${activeOrder.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setChatMessages(data);
        })
        .catch(err => console.error(err));
    };
    fetchChat();
    const timer = setInterval(fetchChat, 4000);
    return () => clearInterval(timer);
  }, [activeOrder]);

  const fetchOrders = () => {
    fetch(`${API_BASE_URL}/api/admin/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId: string, status: AdminOrder['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus: order.paymentStatus, trackingNumber: order.trackingNumber })
    })
      .then(res => res.json())
      .then(() => {
        fetchOrders();
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder({ ...activeOrder, status });
        }
        alert(`Order ${orderId} marked as ${status}.`);
      })
      .catch(err => console.error(err));
  };

  const handlePaymentUpdate = (orderId: string, paymentStatus: AdminOrder['paymentStatus']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let returnRequest = order.returnRequest;
    if (paymentStatus === 'refunded' && order.returnRequest && order.returnRequest.status) {
      returnRequest = { ...order.returnRequest, status: 'Refund Completed' };
    }

    fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: order.status,
        paymentStatus,
        trackingNumber: order.trackingNumber,
        returnRequest
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchOrders();
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder({ ...activeOrder, paymentStatus, returnRequest });
        }
        alert(`Order ${orderId} payment status updated to ${paymentStatus} and return flow marked as completed.`);
      })
      .catch(err => console.error(err));
  };

  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print the invoice.');
      return;
    }
    
    const items = order.items || [];
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td>${item.name || 'Designer Wardrobe Item'}</td>
        <td>${item.size || 'M'}</td>
        <td>${item.quantity || item.qty || 1}</td>
        <td>₹${item.price || 0}</td>
        <td>₹${(item.price || 0) * (item.quantity || item.qty || 1)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; background: #fff; }
          .invoice-container { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
          .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .invoice-logo { font-size: 24px; font-weight: bold; font-family: 'Georgia', serif; letter-spacing: 2px; }
          .invoice-title { font-size: 32px; font-weight: 300; text-transform: uppercase; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; }
          .meta-grid h3 { margin-bottom: 8px; color: #555; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
          .meta-grid p { margin: 4px 0; line-height: 1.4; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table th, .invoice-table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
          .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
          .invoice-total { display: flex; justify-content: flex-end; font-size: 18px; font-weight: bold; margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="invoice-logo">ZENELAIT LUXE</div>
            <div class="invoice-title">Invoice</div>
          </div>
          <div class="meta-grid">
            <div>
              <h3>Billed To:</h3>
              <p><strong>Name:</strong> ${order.customerName}</p>
              <p><strong>Email:</strong> ${order.email}</p>
            </div>
            <div>
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${order.date || 'N/A'}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
              <p><strong>Delivery Line:</strong> ${order.deliveryMethod || 'N/A'}</p>
            </div>
          </div>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="invoice-total">
            Total Amount: ₹${order.total}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAdminChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !chatInput.trim()) return;
    const adminMsg = chatInput;
    setChatInput('');

    fetch(`${API_BASE_URL}/api/support-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: activeOrder.id,
        sender: 'agent',
        text: adminMsg
      })
    })
      .then(res => res.json())
      .then(() => {
        fetch(`${API_BASE_URL}/api/support-messages?orderId=${activeOrder.id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setChatMessages(data);
          });
      })
      .catch(err => console.error(err));
  };

  const handleReturnUpdate = (orderId: string, returnStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedReturnRequest = { ...order.returnRequest, status: returnStatus };
    const payStatus = returnStatus === 'Refund Completed' ? 'refunded' : order.paymentStatus;

    fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnRequest: updatedReturnRequest, paymentStatus: payStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchOrders();
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder({ ...activeOrder, returnRequest: updatedReturnRequest, paymentStatus: payStatus });
        }
        alert(`Return status updated to ${returnStatus}.`);
      })
      .catch(err => console.error(err));
  };

  const handleExchangeUpdate = (orderId: string, exchangeStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedExchangeRequest = { ...order.exchangeRequest, status: exchangeStatus };

    fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeRequest: updatedExchangeRequest })
    })
      .then(res => res.json())
      .then(() => {
        fetchOrders();
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder({ ...activeOrder, exchangeRequest: updatedExchangeRequest });
        }
        alert(`Exchange status updated to ${exchangeStatus}.`);
      })
      .catch(err => console.error(err));
  };

  const filteredOrders = orders.filter(o => {
    const activeSearch = globalSearch || searchQuery;
    const matchesSearch = o.customerName.toLowerCase().includes(activeSearch.toLowerCase()) || o.id.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesStatus = selectedStatus ? o.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Client Orders</h1>
          <p className="subtitle">Track sales fulfillments, verify payments, print invoices, and initiate refunds.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters-bar glass-card">
        <div className="filter-search-input">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="select-wrapper">
          <Filter size={12} className="select-icon" />
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.date}</td>
                <td>
                  <strong>{o.customerName}</strong>
                  <span className="product-sub-category">{o.email}</span>
                </td>
                <td>{o.itemsCount} items</td>
                <td><strong>₹{o.total}</strong></td>
                <td>
                  <span className={`status-badge ${o.paymentStatus === 'paid' ? 'badge-success' : o.paymentStatus === 'refunded' ? 'badge-warning' : 'badge-danger'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${o.status === 'completed' ? 'badge-success' : o.status === 'shipped' ? 'badge-info' : o.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {o.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => setActiveOrder(o)} className="btn-admin btn-admin-secondary" title="View Details">
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details drawer panel */}
      {activeOrder && (
        <div className="form-drawer-overlay" onClick={() => setActiveOrder(null)}>
          <div className="form-drawer glass-card" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Order details ({activeOrder.id})</h2>
              <button onClick={() => setActiveOrder(null)}><X size={20} /></button>
            </div>

            <div className="drawer-scroll-body order-detail-drawer">
              <div className="detail-meta-group">
                <p><strong>Customer:</strong> {activeOrder.customerName}</p>
                <p><strong>Contact Email:</strong> {activeOrder.email}</p>
                <p><strong>Shipping Line:</strong> {activeOrder.deliveryMethod}</p>
                {activeOrder.trackingNumber && <p><strong>Tracking:</strong> <code>{activeOrder.trackingNumber}</code></p>}
                <p><strong>Total Price Due:</strong> ₹{activeOrder.total}</p>

                <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Ordered Items</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeOrder.items && activeOrder.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>{item.name || 'Designer Wardrobe Item'} (Size: {item.size || 'M'}) x {item.quantity || item.qty || 1}</span>
                        <strong>₹{(item.price || 0) * (item.quantity || item.qty || 1)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracking & Carrier Input */}
              <div className="order-actions-section">
                <h4>Fulfillment Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tracking Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DHL-981726-IND"
                      value={activeOrder.trackingNumber || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setActiveOrder({ ...activeOrder, trackingNumber: val });
                      }}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logistics Carrier</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Blue Dart Luxury Delivery"
                      value={activeOrder.deliveryMethod || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setActiveOrder({ ...activeOrder, deliveryMethod: val });
                      }}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={activeOrder.deliveryDate ? activeOrder.deliveryDate.substring(0, 16) : ''}
                      onChange={e => {
                        const val = e.target.value;
                        setActiveOrder({ ...activeOrder, deliveryDate: val });
                      }}
                      style={{ padding: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      fetch(`${API_BASE_URL}/api/admin/orders/${activeOrder.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          status: activeOrder.status,
                          paymentStatus: activeOrder.paymentStatus,
                          trackingNumber: activeOrder.trackingNumber,
                          deliveryMethod: activeOrder.deliveryMethod,
                          deliveryDate: activeOrder.deliveryDate
                        })
                      })
                        .then(res => res.json())
                        .then(() => {
                          fetchOrders();
                          alert('Fulfillment details updated successfully!');
                        })
                        .catch(err => console.error(err));
                    }}
                    className="btn-admin btn-admin-primary w-full"
                    style={{ padding: '10px', fontSize: '0.85rem', marginTop: '4px' }}
                  >
                    Save Fulfillment Details
                  </button>
                </div>
              </div>

              {/* Fulfillment Status Selection Dropdown */}
              <div className="order-actions-section">
                <h4>Fulfillment Status</h4>
                <div style={{ marginTop: '8px' }}>
                  <select 
                    className="form-control" 
                    value={activeOrder.status} 
                    onChange={e => handleStatusUpdate(activeOrder.id, e.target.value as any)}
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    <option value="pending">Pending (Order Placed)</option>
                    <option value="processing">Processing & Quality Check</option>
                    <option value="packed">Packed & Quality Checked</option>
                    <option value="shipped">Shipped & In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="completed">Completed / Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="order-actions-section">
                <h4>Financial Settlement</h4>
                <div className="action-button-list">
                  <button onClick={() => handlePaymentUpdate(activeOrder.id, 'paid')} className="btn-admin btn-admin-primary" disabled={activeOrder.paymentStatus === 'paid'}>
                    Mark as Paid
                  </button>
                  <button onClick={() => handlePaymentUpdate(activeOrder.id, 'refunded')} className="btn-admin btn-admin-secondary text-rose" disabled={activeOrder.paymentStatus === 'refunded'}>
                    Issue Refund
                  </button>
                </div>
              </div>

              {/* Return Request Management */}
              {activeOrder.returnRequest && activeOrder.returnRequest.status && (
                <div className="order-actions-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginTop: '14px', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <h4 style={{ color: 'var(--text-rose)', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <span>⚠️ Return Request</span>
                  </h4>
                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ margin: '2px 0' }}><strong>Reason:</strong> {activeOrder.returnRequest.reason}</p>
                    {activeOrder.returnRequest.description && <p style={{ margin: '2px 0' }}><strong>Details:</strong> {activeOrder.returnRequest.description}</p>}
                    {activeOrder.returnRequest.imageUrl && (
                      <p style={{ margin: '2px 0' }}>
                        <strong>Attached Proof:</strong><br/>
                        <img src={activeOrder.returnRequest.imageUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', marginTop: '4px' }} />
                      </p>
                    )}
                    {activeOrder.returnRequest.paymentDetails && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--accent-gold)', marginTop: '4px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem' }}><strong>COD Refund Target:</strong></p>
                        <p style={{ margin: 0, fontSize: '0.75rem' }}>{activeOrder.returnRequest.paymentDetails.type === 'upi' ? `UPI ID: ${activeOrder.returnRequest.paymentDetails.upi}` : `Bank: ${activeOrder.returnRequest.paymentDetails.bankName} | A/C: ${activeOrder.returnRequest.paymentDetails.accountNumber} | IFSC: ${activeOrder.returnRequest.paymentDetails.ifsc}`}</p>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Return Status Progress</label>
                      <select 
                        className="form-control" 
                        value={activeOrder.returnRequest.status} 
                        onChange={e => handleReturnUpdate(activeOrder.id, e.target.value)}
                        style={{ padding: '8px', fontSize: '0.8rem', width: '100%' }}
                      >
                        <option value="Return Requested">Return Requested</option>
                        <option value="Return Approved">Return Approved</option>
                        <option value="Pickup Scheduled">Pickup Scheduled</option>
                        <option value="Product Picked Up">Product Picked Up</option>
                        <option value="Quality Inspection">Quality Inspection</option>
                        <option value="Refund Processed">Refund Processed</option>
                        <option value="Refund Completed">Refund Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Exchange Request Management */}
              {activeOrder.exchangeRequest && activeOrder.exchangeRequest.status && (
                <div className="order-actions-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginTop: '14px', background: 'rgba(59, 130, 246, 0.05)' }}>
                  <h4 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <span>🔄 Exchange Request</span>
                  </h4>
                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ margin: '2px 0' }}><strong>Item to Exchange:</strong> {activeOrder.exchangeRequest.itemName || 'Garment Piece'}</p>
                    <p style={{ margin: '2px 0' }}><strong>Original Size:</strong> {activeOrder.exchangeRequest.fromSize} | <strong>New Size:</strong> <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{activeOrder.exchangeRequest.toSize}</span></p>
                    
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Exchange Status Progress</label>
                      <select 
                        className="form-control" 
                        value={activeOrder.exchangeRequest.status} 
                        onChange={e => handleExchangeUpdate(activeOrder.id, e.target.value)}
                        style={{ padding: '8px', fontSize: '0.8rem', width: '100%' }}
                      >
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Replacement Shipped">Replacement Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice printable trigger */}
              <div className="order-actions-section">
                <button onClick={() => handlePrintInvoice(activeOrder)} className="btn-admin btn-admin-secondary w-full">
                  <FileText size={14} /> Print Invoice
                </button>
              </div>

              {/* Stylist Concierge Chat Panel */}
              <div className="order-actions-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '14px' }}>
                <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 8px 0' }}>
                  <span>💬 Stylist Support Desk</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Order ID: {activeOrder.id}</span>
                </h4>
                
                <div style={{
                  background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px',
                  maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px',
                  marginTop: '8px', border: '1px solid var(--border-color)'
                }}>
                  {chatMessages.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>No stylist inquiries started yet for this order.</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} style={{
                        maxWidth: '85%',
                        alignSelf: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
                        background: msg.sender === 'agent' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                        color: msg.sender === 'agent' ? '#000' : 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        lineHeight: 1.3
                      }}>
                        {msg.text}
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAdminChatSubmit} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type stylist response..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    required
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                  <button type="submit" className="btn-admin btn-admin-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Orders;