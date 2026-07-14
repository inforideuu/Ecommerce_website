import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, X, Award, Image as ImageIcon, 
  Settings, Globe, Check, Eye, Save, UploadCloud
} from 'lucide-react';
import './Products.css'; // Shares the premium grid & card styles

interface BrandObject {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  website: string;
  country: string;
  founded: number;
  type: 'Luxury' | 'Premium' | 'Casual' | 'Sportswear' | 'Designer' | 'Streetwear';
  status: 'active' | 'draft' | 'hidden';
  featured: boolean;
  showOnHomepage: boolean;
  seoTitle: string;
  metaDescription: string;
  seoKeywords: string;
}

export const Brands: React.FC = () => {
  const [brands, setBrands] = useState<BrandObject[]>([]);

  const fetchBrands = () => {
    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandObject | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});



  // Form Fields
  const [formFields, setFormFields] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    website: '',
    country: 'Italy',
    founded: 1921,
    type: 'Luxury' as BrandObject['type'],
    status: 'active' as BrandObject['status'],
    featured: false,
    showOnHomepage: false,
    seoTitle: '',
    metaDescription: '',
    seoKeywords: ''
  });

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormFields(prev => ({
      ...prev,
      name: val,
      slug: prev.slug ? prev.slug : slug,
      seoTitle: prev.seoTitle ? prev.seoTitle : `${val} | Luxury Fashion House`
    }));
  };

  const handleAutofillSeo = () => {
    const val = formFields.name;
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const autoMeta = val ? `Shop original creations from the premium designer brand ${val} online. Explore new arrivals with secured checkout.` : '';
    const autoKeywords = val ? `${val.toLowerCase()}, designer clothing, luxury brand, zenelait` : '';

    setFormFields(prev => ({
      ...prev,
      slug: slug,
      seoTitle: val ? `${val} | Luxury Fashion House`.slice(0, 70) : '',
      metaDescription: autoMeta.slice(0, 160),
      seoKeywords: autoKeywords
    }));
  };

  const handleOpenAddForm = () => {
    setEditingBrand(null);
    setErrors({});
    setFormFields({
      name: '',
      slug: '',
      description: '',
      logo: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=100&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      website: '',
      country: 'Italy',
      founded: 1970,
      type: 'Luxury',
      status: 'active',
      featured: false,
      showOnHomepage: false,
      seoTitle: '',
      metaDescription: '',
      seoKeywords: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (b: BrandObject) => {
    setEditingBrand(b);
    setErrors({});
    setFormFields({
      name: b.name,
      slug: b.slug,
      description: b.description,
      logo: b.logo,
      banner: b.banner,
      website: b.website,
      country: b.country,
      founded: b.founded,
      type: b.type,
      status: b.status,
      featured: b.featured,
      showOnHomepage: b.showOnHomepage,
      seoTitle: b.seoTitle,
      metaDescription: b.metaDescription,
      seoKeywords: b.seoKeywords
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const target = brands.find(b => b.id === id);
    if (target && window.confirm(`Remove design house partnership with ${target.name}?`)) {
      fetch(`https://ecommerce-website-hvuy.onrender.com/api/admin/brands?id=${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => fetchBrands())
        .catch(err => console.error(err));
    }
  };

  // Native Logo File Reader
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFields(f => ({ ...f, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Brand Handler
  const handleSaveBrand = (e: React.FormEvent, forceStatus?: BrandObject['status']) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formFields.name.trim()) newErrors.name = 'Brand Name is required.';
    if (!formFields.slug.trim()) newErrors.slug = 'Brand Slug is required.';
    if (!formFields.logo) newErrors.logo = 'Brand Logo asset is required.';
    
    // Unique slug check
    const duplicateSlug = brands.find(b => b.slug.toLowerCase() === formFields.slug.toLowerCase() && b.id !== editingBrand?.id);
    if (duplicateSlug) {
      newErrors.slug = 'Brand slug URL must be unique.';
    }

    // Website URL validation
    if (formFields.website) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      if (!urlPattern.test(formFields.website)) {
        newErrors.website = 'Invalid website URL format.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    setSaving(true);
    const activeStatus = forceStatus || formFields.status;

    const payload = {
      id: editingBrand ? editingBrand.id : '',
      name: formFields.name,
      slug: formFields.slug,
      description: formFields.description,
      logo: formFields.logo,
      banner: formFields.banner,
      website: formFields.website,
      country: formFields.country,
      founded: Number(formFields.founded) || 1900,
      type: formFields.type,
      status: activeStatus,
      featured: formFields.featured,
      showOnHomepage: formFields.showOnHomepage,
      seoTitle: formFields.seoTitle,
      metaDescription: formFields.metaDescription,
      seoKeywords: formFields.seoKeywords
    };

    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        fetchBrands();
        setIsFormOpen(false);
      })
      .catch(err => {
        console.error(err);
        setSaving(false);
        alert('Server timed out.');
      });
  };

  // --- RENDER DEDICATED ADD/EDIT BRAND PANEL ---
  if (isFormOpen) {
    return (
      <div className="admin-products-page" style={{ position: 'relative' }}>
        {saving && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div className="glass-card text-center" style={{ padding: '30px' }}>
              <div className="spinner-gold" style={{ margin: '0 auto 16px auto' }} />
              <h3 className="serif-text">Saving Brand Record...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Updating design house profiles index</p>
            </div>
          </div>
        )}

        <div className="products-title-row">
          <div>
            <h1 className="serif-text">{editingBrand ? 'Redesign Brand File' : 'Add Design House Partner'}</h1>
            <p className="subtitle">Register fashion labels and branding credentials.</p>
          </div>
          <button className="btn-admin btn-admin-secondary" onClick={() => setIsFormOpen(false)}>
            <X size={14} /> Back to Directory
          </button>
        </div>

        <div className="add-product-container">
          {/* Left Form Column */}
          <div className="form-sections-column">
            
            {/* Section 1: Basic Information */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Award size={18} />
                <div>
                  <h3>Basic Information</h3>
                  <p>Design house branding names and descriptors</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Brand Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Gucci"
                  value={formFields.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
                {errors.name && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>


              <div className="form-group">
                <label>Brand Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Summarize the brand's style heritage, signature styles, and presence..."
                  value={formFields.description}
                  onChange={e => setFormFields({ ...formFields, description: e.target.value })}
                />
              </div>
            </div>

            {/* Section 2: Brand Identity */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <ImageIcon size={18} />
                <div>
                  <h3>Brand Identity</h3>
                  <p>Upload brand logos and horizontal marketing covers</p>
                </div>
              </div>

              <div className="form-group">
                <label>Brand Logo Asset *</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                  <label className="btn-admin btn-admin-secondary" style={{ cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <UploadCloud size={16} /> Choose Logo File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  {formFields.logo && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--status-success)' }}>✓ Logo Loaded</span>
                  )}
                </div>
                {errors.logo && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>{errors.logo}</span>}
                {formFields.logo && (
                  <div className="image-thumb-wrapper" style={{ width: '80px', height: '80px', marginTop: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={formFields.logo} alt="Logo Preview" />
                    <button type="button" className="img-remove-btn" onClick={() => setFormFields({ ...formFields, logo: '' })}>✕</button>
                  </div>
                )}
              </div>
            </div>


            {/* Section 4: Visibility */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Settings size={18} />
                <div>
                  <h3>Visibility Status</h3>
                  <p>Control partnership flags and homepage indexing permissions</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Status</label>
                <select className="form-control" value={formFields.status} onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}>
                  <option value="active">Active (Visible in Lists)</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="hidden">Hidden (Archived)</option>
                </select>
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Featured Brand House</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show gold badge overlays in filters.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.featured}
                  onChange={e => setFormFields({ ...formFields, featured: e.target.checked })}
                />
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Show on Homepage</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Display inside homepage collections bar.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.showOnHomepage}
                  onChange={e => setFormFields({ ...formFields, showOnHomepage: e.target.checked })}
                />
              </div>
            </div>

            {/* Section 5: SEO */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Globe size={18} />
                <div>
                  <h3>SEO Configs</h3>
                  <p>Set search engine tags and indexing descriptions</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleAutofillSeo}
                  className="btn-admin btn-admin-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  ✨ Auto-Generate SEO Fields
                </button>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Brand Slug URL *</label>
                <input
                  type="text"
                  className={`form-control ${errors.slug ? 'input-error' : ''}`}
                  placeholder="e.g. gucci"
                  value={formFields.slug}
                  onChange={e => setFormFields({ ...formFields, slug: e.target.value })}
                  required
                />
                {errors.slug && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.slug}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>SEO Title Tag</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formFields.seoTitle} 
                  onChange={e => setFormFields({ ...formFields, seoTitle: e.target.value })} 
                  maxLength={70}
                />
                <div className="seo-counter-label">
                  <span>Standard search limit: 70 characters.</span>
                  <span>{formFields.seoTitle.length} / 70</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Meta Description</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={formFields.metaDescription} 
                  onChange={e => setFormFields({ ...formFields, metaDescription: e.target.value })} 
                  maxLength={160}
                />
                <div className="seo-counter-label">
                  <span>Recommended text limit: 160 characters.</span>
                  <span>{formFields.metaDescription.length} / 160</span>
                </div>
              </div>

              <div className="form-group">
                <label>Keywords</label>
                <input type="text" className="form-control" placeholder="e.g. gucci, Italian luxury, designer clothing" value={formFields.seoKeywords} onChange={e => setFormFields({ ...formFields, seoKeywords: e.target.value })} />
              </div>
            </div>

            {/* Bottom Actions Fixed Bar */}
            <div className="form-actions-fixed-bar">
              <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-admin btn-admin-secondary" onClick={(e) => handleSaveBrand(e, 'draft')}>
                <Save size={14} /> Save Draft
              </button>
              <button type="button" className="btn-admin btn-admin-secondary" onClick={() => alert(`Preview:\nBrand: ${formFields.name || 'Unnamed'}\nSlug: /brand/${formFields.slug}\nType: ${formFields.type}`)}>
                <Eye size={14} /> Preview
              </button>
              <button type="button" className="btn-admin btn-admin-primary" onClick={(e) => handleSaveBrand(e, 'active')}>
                <Check size={14} /> Save Brand
              </button>
            </div>

          </div>

          {/* Right Live Preview Sticky Sidebar */}
          <div className="sticky-preview-sidebar">
            <div className="premium-card glass-card" style={{ border: '1px solid var(--accent-gold)', background: 'var(--bg-secondary)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="preview-mock-tag">Brand Preview</span>
                <span className={`status-badge ${formFields.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {formFields.status}
                </span>
              </div>

              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--bg-tertiary)', position: 'relative' }}>
                  {formFields.banner ? (
                    <img src={formFields.banner} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}

                  {formFields.featured && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#000', color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px' }}>
                      FEATURED HOUSE
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {formFields.logo ? (
                    <img src={formFields.logo} alt="Logo Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', borderRadius: '6px' }}>
                      LO
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formFields.name || 'Brand Name'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER STANDARD BRAND DIRECTORY TABLE LIST ---
  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Brand Partner Directory</h1>
          <p className="subtitle">Manage luxury design houses, featured status, and brand metadata.</p>
        </div>
        <button onClick={handleOpenAddForm} className="btn-admin btn-admin-primary">
          <Plus size={14} /> Add Brand
        </button>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Brand Logo</th>
              <th>Brand Name</th>
              <th>Featured House</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td>
                  <img src={b.logo} alt={b.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                </td>
                <td>
                  <strong>{b.name}</strong>
                </td>
                <td>
                  {b.featured ? (
                    <span className="status-badge badge-gold">Featured Brand</span>
                  ) : (
                    <span className="status-badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Standard</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${b.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {b.status === 'active' ? 'Active Partnership' : 'Draft Mode'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row-actions-group">
                    <button onClick={() => handleOpenEditForm(b)} title="Edit"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(b.id)} className="text-rose" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Brands;
