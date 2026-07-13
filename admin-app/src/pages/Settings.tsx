import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, DollarSign, Shield, UserPlus, Trash2 } from 'lucide-react';
import './Settings.css';

interface UserAccount {
  name: string;
  email: string;
  role: 'Super Admin' | 'Inventory Manager';
  status: 'active' | 'blocked';
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const [generalForm, setGeneralForm] = useState({
    storeName: 'zenelait Haute Couture',
    contactEmail: 'concierge@zenelait.luxury',
    currency: 'INR (₹)',
    taxRate: '18%', // GST standard
    supercoinRewardPercentage: '25',
    storeAnnouncement: 'Complimentary Signature Shipping on global orders over ₹20,000!',
    flashSaleActive: 'true',
    flashSaleHours: '4',
    flashSaleMinutes: '34',
    flashSaleSeconds: '55',
    flashSaleTitle: 'Exclusive Private Flash Sale',
    flashSaleSubtitle: 'Save up to 30% off selected leather garments and silk styles. Complimentary silk garment cover included.',
    flashSaleImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
  });

  // Load and manage users list from localStorage
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Inventory Manager' as 'Super Admin' | 'Inventory Manager'
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('admin_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers: UserAccount[] = [
        { name: 'Aria Montgomery', email: 'superadmin@gmail.com', role: 'Super Admin', status: 'active' },
        { name: 'Marcus Aurelius', email: 'inmanager@gmail.com', role: 'Inventory Manager', status: 'active' }
      ];
      localStorage.setItem('admin_users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }

    // Fetch backend settings
    fetch('http://localhost:8000/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setGeneralForm({
            storeName: data.store_name || data.storeName || 'zenelait Haute Couture',
            contactEmail: data.contact_email || data.contactEmail || 'concierge@zenelait.luxury',
            currency: data.currency || 'INR (₹)',
            taxRate: data.tax_rate || data.taxRate || '18%',
            supercoinRewardPercentage: data.supercoin_reward_percentage || '25',
            storeAnnouncement: data.store_announcement || data.storeAnnouncement || 'Complimentary Signature Shipping on global orders over ₹20,000!',
            flashSaleActive: data.flash_sale_active || data.flashSaleActive || 'true',
            flashSaleHours: data.flash_sale_hours || data.flashSaleHours || '4',
            flashSaleMinutes: data.flash_sale_minutes || data.flashSaleMinutes || '34',
            flashSaleSeconds: data.flash_sale_seconds || data.flashSaleSeconds || '55',
            flashSaleTitle: data.flash_sale_title || data.flashSaleTitle || 'Exclusive Private Flash Sale',
            flashSaleSubtitle: data.flash_sale_subtitle || data.flashSaleSubtitle || 'Save up to 30% off selected leather garments and silk styles. Complimentary silk garment cover included.',
            flashSaleImage: data.flash_sale_image || data.flashSaleImage || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
          });
        }
      })
      .catch(err => console.error('Failed to load store settings:', err));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      store_name: generalForm.storeName,
      contact_email: generalForm.contactEmail,
      currency: generalForm.currency,
      tax_rate: generalForm.taxRate,
      supercoin_reward_percentage: generalForm.supercoinRewardPercentage,
      store_announcement: generalForm.storeAnnouncement,
      flash_sale_active: generalForm.flashSaleActive,
      flash_sale_hours: generalForm.flashSaleHours,
      flash_sale_minutes: generalForm.flashSaleMinutes,
      flash_sale_seconds: generalForm.flashSaleSeconds,
      flash_sale_title: generalForm.flashSaleTitle,
      flash_sale_subtitle: generalForm.flashSaleSubtitle,
      flash_sale_image: generalForm.flashSaleImage
    };

    fetch('http://localhost:8000/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => alert('Settings configurations saved successfully to backend database.'))
      .catch(err => {
        console.error(err);
        alert('Failed to save settings.');
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralForm(prev => ({ ...prev, flashSaleImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill out all user fields.');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      alert('A user account with this email already exists.');
      return;
    }

    const updatedUsers: UserAccount[] = [
      ...users,
      { name: newUser.name, email: newUser.email, role: newUser.role, status: 'active' }
    ];

    // Store login credentials securely (simulated in localStorage)
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    localStorage.setItem(`login_credentials_${newUser.email}`, JSON.stringify({
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      name: newUser.name
    }));

    setUsers(updatedUsers);
    alert(`Successfully created account for ${newUser.name} as ${newUser.role}.`);
    setNewUser({ name: '', email: '', password: '', role: 'Inventory Manager' });
  };

  const handleDeleteUser = (email: string) => {
    if (email === 'superadmin@gmail.com') {
      alert('Cannot delete the root Super Admin account!');
      return;
    }
    if (window.confirm(`Delete administrative account for ${email}?`)) {
      const updated = users.filter(u => u.email !== email);
      setUsers(updated);
      localStorage.setItem('admin_users', JSON.stringify(updated));
      localStorage.removeItem(`login_credentials_${email}`);
    }
  };

  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">System Configurations</h1>
          <p className="subtitle">Customize company settings, update tax valuations, and assign role privileges.</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Left tabs selector */}
        <aside className="settings-tabs-sidebar glass-card">
          <button className={`settings-tab-btn ${activeTab === 'general' ? 'tab-active' : ''}`} onClick={() => setActiveTab('general')}>
            <SettingsIcon size={16} /> General Settings
          </button>
          <button className={`settings-tab-btn ${activeTab === 'financial' ? 'tab-active' : ''}`} onClick={() => setActiveTab('financial')}>
            <DollarSign size={16} /> Currencies & Taxes
          </button>
          <button className={`settings-tab-btn ${activeTab === 'marketing' ? 'tab-active' : ''}`} onClick={() => setActiveTab('marketing')}>
            <DollarSign size={16} /> Flash Sale Marketing
          </button>
          <button className={`settings-tab-btn ${activeTab === 'roles' ? 'tab-active' : ''}`} onClick={() => setActiveTab('roles')}>
            <Shield size={16} /> Users & Roles
          </button>
        </aside>

        {/* Form Panel */}
        <main className="settings-content-panel glass-card">
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="settings-form">
              <h3>General Store Metadata</h3>

              <div className="form-group">
                <label>Company Brand Name</label>
                <input
                  type="text"
                  value={generalForm.storeName}
                  onChange={e => setGeneralForm({ ...generalForm, storeName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Support Contact Email</label>
                <input
                  type="email"
                  value={generalForm.contactEmail}
                  onChange={e => setGeneralForm({ ...generalForm, contactEmail: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Super Coin Reward Ratio (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={generalForm.supercoinRewardPercentage}
                  onChange={e => setGeneralForm({ ...generalForm, supercoinRewardPercentage: e.target.value })}
                  className="form-control"
                />
                <span className="help-text" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage of order grand total value awarded to clients as Super Coins.</span>
              </div>



              <button type="submit" className="btn-admin btn-admin-primary mt-4">Save Configurations</button>
            </form>
          )}

          {activeTab === 'financial' && (
            <form onSubmit={handleSave} className="settings-form">
              <h3>Currency and Regional Taxes</h3>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Primary Currency (Locked)</label>
                  <select
                    value={generalForm.currency}
                    disabled
                    className="form-control"
                  >
                    <option>INR (₹)</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>The primary store currency is fixed to Indian Rupee (₹).</span>
                </div>

                <div className="form-group">
                  <label>Regional Sales Tax Rate (GST)</label>
                  <input
                    type="text"
                    value={generalForm.taxRate}
                    onChange={e => setGeneralForm({ ...generalForm, taxRate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <button type="submit" className="btn-admin btn-admin-primary mt-4">Save Financials</button>
            </form>
          )}

          {activeTab === 'marketing' && (
            <form onSubmit={handleSave} className="settings-form">
              <h3>Flash Sale Marketing Settings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Configure promotional banners and countdown timers shown on the homepage.</p>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Flash Sale Status</label>
                <select
                  value={generalForm.flashSaleActive}
                  onChange={e => setGeneralForm({ ...generalForm, flashSaleActive: e.target.value })}
                  className="form-control"
                >
                  <option value="true">Active (Visible on Homepage)</option>
                  <option value="false">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Sale Title Banner</label>
                <input
                  type="text"
                  value={generalForm.flashSaleTitle}
                  onChange={e => setGeneralForm({ ...generalForm, flashSaleTitle: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Exclusive Private Flash Sale"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Sale Subtitle / Terms</label>
                <textarea
                  value={generalForm.flashSaleSubtitle}
                  onChange={e => setGeneralForm({ ...generalForm, flashSaleSubtitle: e.target.value })}
                  className="form-control"
                  rows={2}
                  placeholder="Describe promotional item selections and values..."
                />
              </div>

              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Timer Hours</label>
                  <input
                    type="number"
                    value={generalForm.flashSaleHours}
                    onChange={e => setGeneralForm({ ...generalForm, flashSaleHours: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Timer Minutes</label>
                  <input
                    type="number"
                    value={generalForm.flashSaleMinutes}
                    onChange={e => setGeneralForm({ ...generalForm, flashSaleMinutes: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Timer Seconds</label>
                  <input
                    type="number"
                    value={generalForm.flashSaleSeconds}
                    onChange={e => setGeneralForm({ ...generalForm, flashSaleSeconds: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Sale Cover Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="form-control"
                  />
                  {generalForm.flashSaleImage && (
                    <div style={{ position: 'relative', width: '120px', height: '120px', marginTop: '8px' }}>
                      <img
                        src={generalForm.flashSaleImage}
                        alt="Sale Cover Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setGeneralForm({ ...generalForm, flashSaleImage: '' })}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: 'var(--status-error)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-admin btn-admin-primary mt-2">Save Marketing Settings</button>
            </form>
          )}

          {activeTab === 'roles' && (
            <div className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3>Permissions and Administrative Accounts</h3>
                <div className="users-roles-list mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {users.map((user, idx) => (
                    <div key={idx} className="role-user-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                      <div>
                        <strong>{user.name}</strong>
                        <span className="user-email-meta" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`status-badge ${user.role === 'Super Admin' ? 'badge-success' : 'badge-info'}`}>{user.role}</span>
                        {user.email !== 'superadmin@gmail.com' && (
                          <button onClick={() => handleDeleteUser(user.email)} style={{ background: 'none', border: 'none', color: 'var(--text-rose)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h3>Add Administrative Account</h3>
                <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@zenelait.luxury"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Login Password</label>
                    <input
                      type="password"
                      placeholder="Set account password"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Assigned Privilege Role</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value as 'Super Admin' | 'Inventory Manager' })}
                      className="form-control"
                    >
                      <option value="Inventory Manager">Inventory Manager</option>

                    </select>
                  </div>
                  <button type="submit" className="btn-admin btn-admin-primary mt-2" style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={16} /> Save Credentials
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default Settings;
