import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { Bell, MessageSquare, Sun, Moon, Search, Settings, Shield, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Topbar.css';

interface NotificationItem {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface MessageItem {
  id: number;
  sender: string;
  text: string;
  time: string;
  orderId?: string;
}

interface TopbarProps {
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ globalSearch, setGlobalSearch }) => {
  const { theme, toggleTheme } = useTheme();

  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Messages State
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageReply, setMessageReply] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  React.useEffect(() => {
    const fetchActiveAlerts = () => {
      fetch(`${API_BASE_URL}/api/admin/orders`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const list: NotificationItem[] = [];
            let index = 1;
            
            data.forEach((order: any) => {
              let returnReq: any = null;
              if (order.returnRequest) {
                try {
                  returnReq = typeof order.returnRequest === 'string' ? JSON.parse(order.returnRequest) : order.returnRequest;
                } catch(e) {}
              }
              
              let exchangeReq: any = null;
              if (order.exchangeRequest) {
                try {
                  exchangeReq = typeof order.exchangeRequest === 'string' ? JSON.parse(order.exchangeRequest) : order.exchangeRequest;
                } catch(e) {}
              }
              
              if (returnReq && returnReq.status === 'Return Requested') {
                list.push({
                  id: index++,
                  text: `Return Requested: Order #${order.id}`,
                  time: 'Active Alert',
                  read: false
                });
              } else if (exchangeReq && exchangeReq.status === 'Exchange Requested') {
                list.push({
                  id: index++,
                  text: `Size Exchange Requested: Order #${order.id}`,
                  time: 'Active Alert',
                  read: false
                });
              } else if (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'pending payment' || order.status.toLowerCase() === 'confirmed') {
                list.push({
                  id: index++,
                  text: `New order #${order.id} placed`,
                  time: 'Pending Review',
                  read: false
                });
              }
            });
            
            setNotifications(list);
          }
        })
        .catch(err => console.error(err));
    };

    const fetchActiveMessages = () => {
      fetch(`${API_BASE_URL}/api/support-messages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const userMsgs = data.filter((m: any) => m.sender === 'user');
            const mapped = userMsgs.map((m: any, idx: number) => ({
              id: idx + 1,
              sender: `Client (Order #${m.orderId})`,
              text: m.text,
              time: 'New Message',
              orderId: m.orderId
            }));
            setMessages(mapped);
          }
        })
        .catch(err => console.error(err));
    };

    fetchActiveAlerts();
    fetchActiveMessages();
    const timer = setInterval(() => {
      fetchActiveAlerts();
      fetchActiveMessages();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markItemRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleReplySubmit = (e: React.FormEvent, msgId: number) => {
    e.preventDefault();
    if (!messageReply.trim()) return;
    const target = messages.find(m => m.id === msgId);
    if (!target) return;

    fetch(`${API_BASE_URL}/api/support-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: target.orderId,
        sender: 'agent',
        text: messageReply
      })
    })
      .then(res => res.json())
      .then(() => {
        setMessageReply('');
        setActiveReplyId(null);
        alert(`Reply sent successfully for Order #${target.orderId}!`);
      })
      .catch(err => console.error(err));
  };

  return (
    <header className="admin-topbar glass-card">
      {/* Global Search Bar */}
      <div className="topbar-search-form">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Global search products, SKU, client orders..." 
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
        />
      </div>

      <div className="topbar-actions-row">
        {/* Theme Toggler */}
        <button className="topbar-action-circle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Messages Center */}
        <div className="relative-container">
          <button className="topbar-action-circle" onClick={() => { setIsMessageOpen(!isMessageOpen); setIsNotifyOpen(false); }} title="Messages Center">
            <MessageSquare size={18} />
            {messages.length > 0 && <span className="badge-bubble bg-violet">{messages.length}</span>}
          </button>

          {isMessageOpen && (
            <div className="topbar-dropdown glass-card notify-dropdown" style={{ width: '320px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Client Support Messages</h4>
                {messages.length > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{messages.length} pending</span>}
              </div>
              <div className="notify-list" style={{ marginTop: '10px' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px 0' }}>No pending support tickets.</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="notify-item" style={{ paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{msg.sender}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>{msg.text}</p>

                      {activeReplyId === msg.id ? (
                        <form onSubmit={(e) => handleReplySubmit(e, msg.id)} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <input
                            type="text"
                            placeholder="Type reply..."
                            value={messageReply}
                            onChange={e => setMessageReply(e.target.value)}
                            style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            autoFocus
                          />
                          <button type="submit" style={{ background: 'var(--primary-accent)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                            <Send size={10} />
                          </button>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setActiveReplyId(msg.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', padding: 0, cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Clear message history for this order?')) {
                                fetch(`${API_BASE_URL}/api/support-messages?orderId=${msg.orderId}`, {
                                  method: 'DELETE'
                                })
                                  .then(() => {
                                    alert('Message history cleared successfully!');
                                    setMessages(messages.filter(m => m.orderId !== msg.orderId));
                                  })
                                  .catch(err => console.error(err));
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-rose)', fontSize: '0.75rem', padding: 0, cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
                          >
                            Clear Thread
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div className="relative-container">
          <button className="topbar-action-circle" onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsMessageOpen(false); }} title="Notifications Center">
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-bubble bg-emerald">{unreadCount}</span>}
          </button>

          {isNotifyOpen && (
            <div className="topbar-dropdown glass-card notify-dropdown" style={{ width: '320px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, border: 'none', padding: 0 }}>System Alerts</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              <div className="notify-list" style={{ marginTop: '10px' }}>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px 0' }}>No active notifications.</p>
                ) : (
                  notifications.map(not => (
                    <div key={not.id} className="notify-item" style={{ opacity: not.read ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: not.read ? 'normal' : '600' }}>{not.text}</p>
                        <span style={{ fontSize: '0.7rem' }}>{not.time}</span>
                      </div>
                      {!not.read && (
                        <button
                          onClick={() => markItemRead(not.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.7rem', padding: 0, cursor: 'pointer' }}
                          title="Mark Read"
                        >
                          Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative-container">
          <div className="profile-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="avatar-mini">AM</div>
            <div className="profile-pill-details">
              <h5>Aria Montgomery</h5>
              <span>Senior Admin</span>
            </div>
          </div>

          {isProfileOpen && (
            <div className="topbar-dropdown glass-card profile-dropdown">
              <div className="dropdown-header">
                <strong>Aria Montgomery</strong>
                <p>superadmin@gmail.com</p>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={() => alert('Profile settings')} className="dropdown-item">
                <Settings size={14} /> Settings
              </button>
              <button onClick={() => alert('Security details')} className="dropdown-item">
                <Shield size={14} /> Security
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Topbar;