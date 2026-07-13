import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, X, FolderOpen, Image as ImageIcon, 
  Settings, Globe, Check, Eye, Save, UploadCloud 
} from 'lucide-react';
import type { AdminCategory } from '../data/mockData';
import './Products.css'; // Shares the same premium css grid & card styles

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'dept' | 'group' | 'sub'>('all');
  const [categoryType, setCategoryType] = useState<'dept' | 'group' | 'sub'>('dept');

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getCategoryType = (c: AdminCategory) => {
    if (c.parentCategory === 'None' || c.parentCategory === 'none' || !c.parentCategory) {
      return 'Department';
    }
    const parent = categories.find(p => p.id === c.parentCategory);
    if (parent && (parent.parentCategory === 'None' || parent.parentCategory === 'none' || !parent.parentCategory)) {
      return 'Category Group';
    }
    return 'Subcategory';
  };

  // Form Fields
  const [formFields, setFormFields] = useState({
    id: '',
    name: '',
    slug: '',
    parentCategory: 'None',
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&q=80',
    status: 'active',
    featured: false,
    showOnHomepage: false,
    sortOrder: 0,
    seoTitle: '',
    metaDescription: '',
    seoKeywords: ''
  });

  const fetchCategories = () => {
    fetch('http://localhost:8000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err));
  };

  const getParentName = (parentId: string) => {
    if (parentId === 'None' || parentId === 'none' || !parentId) return 'None (Root)';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : parentId;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormFields(prev => ({
      ...prev,
      name: val,
      slug: prev.slug ? prev.slug : slug,
      seoTitle: prev.seoTitle ? prev.seoTitle : val
    }));
  };

  const handleAutofillSeo = () => {
    const val = formFields.name;
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const parent = formFields.parentCategory;
    const autoMeta = val ? `Explore premium apparel collections in ${val}${parent !== 'None' ? ` under ${parent}` : ''} at Zenelait. Standard delivery available.` : '';
    const autoKeywords = val ? `${val.toLowerCase()}, apparel, luxury fashion, ${parent !== 'None' ? parent.toLowerCase() : ''}` : '';

    setFormFields(prev => ({
      ...prev,
      slug: slug,
      seoTitle: val ? `${val} Collection | Zenelait Luxury`.slice(0, 70) : '',
      metaDescription: autoMeta.slice(0, 160),
      seoKeywords: autoKeywords
    }));
  };

  const handleOpenAddForm = () => {
    setCategoryType('dept');
    setEditingCategory(null);
    setErrors({});
    setFormFields({
      id: '',
      name: '',
      slug: '',
      parentCategory: 'None',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&q=80',
      status: 'active',
      featured: false,
      showOnHomepage: false,
      sortOrder: 0,
      seoTitle: '',
      metaDescription: '',
      seoKeywords: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (c: AdminCategory) => {
    let type: 'dept' | 'group' | 'sub' = 'dept';
    const parent = categories.find(p => p.id === c.parentCategory);
    if (c.parentCategory === 'None' || c.parentCategory === 'none' || !c.parentCategory) {
      type = 'dept';
    } else if (parent && (parent.parentCategory === 'None' || parent.parentCategory === 'none' || !parent.parentCategory)) {
      type = 'group';
    } else {
      type = 'sub';
    }
    setCategoryType(type);
    setEditingCategory(c);
    setErrors({});
    setFormFields({
      id: c.id,
      name: c.name || '',
      slug: c.slug || '',
      parentCategory: c.parentCategory || 'None',
      description: '',
      thumbnail: c.image || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&q=80',
      status: c.status || 'active',
      featured: false,
      showOnHomepage: false,
      sortOrder: 0,
      seoTitle: c.name || '',
      metaDescription: '',
      seoKeywords: ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete category? This action removes catalog structures.')) {
      fetch(`http://localhost:8000/api/categories?id=${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => fetchCategories())
        .catch(err => console.error(err));
    }
  };

  // Real Image File Upload Reader
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFields(f => ({ ...f, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Category Handler
  const handleSaveCategory = (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formFields.name.trim()) newErrors.name = 'Category Name is required.';
    if (!formFields.slug.trim()) newErrors.slug = 'Slug URL path is required.';
    
    // Unique slug check (scoped to parent category level)
    const duplicateSlug = categories.find(c => 
      c.slug.toLowerCase() === formFields.slug.toLowerCase() && 
      c.parentCategory === formFields.parentCategory &&
      c.id !== editingCategory?.id
    );
    if (duplicateSlug) {
      newErrors.slug = 'Slug URL path must be unique under the selected parent category.';
    }

    // Self reference validation
    if (formFields.parentCategory !== 'None' && formFields.parentCategory.toLowerCase() === formFields.name.toLowerCase()) {
      newErrors.parentCategory = 'A category cannot be its own parent category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0,0);
      return;
    }

    setSaving(true);
    const activeStatus = forceStatus || formFields.status;

    const payload = {
      id: editingCategory ? editingCategory.id : undefined,
      name: formFields.name,
      parentCategory: formFields.parentCategory,
      slug: formFields.slug,
      status: activeStatus,
      image: formFields.thumbnail
    };

    fetch('http://localhost:8000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSaving(false);
        if (data.success) {
          fetchCategories();
          setIsFormOpen(false);
        } else {
          alert('Failed to save category details.');
        }
      })
      .catch(err => {
        console.error(err);
        setSaving(false);
        alert('Server timed out.');
      });
  };

  // --- RENDER DEDICATED ADD/EDIT CATEGORY SCREEN ---
  if (isFormOpen) {
    return (
      <div className="admin-products-page" style={{ position: 'relative' }}>
        {saving && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div className="glass-card text-center" style={{ padding: '30px' }}>
              <div className="spinner-gold" style={{ margin: '0 auto 16px auto' }} />
              <h3 className="serif-text">Creating Category Directory...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Synchronizing store taxonomy files</p>
            </div>
          </div>
        )}

        <div className="products-title-row">
          <div>
            <h1 className="serif-text">{editingCategory ? 'Edit Category Hierarchy' : 'New E-Commerce Category'}</h1>
            <p className="subtitle">Set up catalog collections and organize customer search indexes.</p>
          </div>
          <button className="btn-admin btn-admin-secondary" onClick={() => setIsFormOpen(false)}>
            <X size={14} /> Back to Categories
          </button>
        </div>

        <div className="add-product-container">
          {/* Left Form Column */}
          <div className="form-sections-column">
            
            {/* Section 1: Basic Information */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <FolderOpen size={18} />
                <div>
                  <h3>Basic Information</h3>
                  <p>Category descriptors and parent tree routing</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)' }}>Hierarchy Level / Category Type *</label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input 
                      type="radio" 
                      name="categoryType" 
                      value="dept" 
                      checked={categoryType === 'dept'}
                      onChange={() => {
                        setCategoryType('dept');
                        setFormFields(prev => ({ ...prev, parentCategory: 'None' }));
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    📁 Department (Root tab)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input 
                      type="radio" 
                      name="categoryType" 
                      value="group" 
                      checked={categoryType === 'group'}
                      onChange={() => {
                        setCategoryType('group');
                        const firstDept = categories.find(c => c.parentCategory === 'None' || c.parentCategory === 'none');
                        setFormFields(prev => ({ ...prev, parentCategory: firstDept ? firstDept.id : 'cat-1' }));
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    🗂️ Category Group (Column)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input 
                      type="radio" 
                      name="categoryType" 
                      value="sub" 
                      checked={categoryType === 'sub'}
                      onChange={() => {
                        setCategoryType('sub');
                        const firstGroup = categories.find(c => ['cat-1', 'cat-2', 'cat-3'].includes(c.parentCategory) || getCategoryType(c) === 'Category Group');
                        setFormFields(prev => ({ ...prev, parentCategory: firstGroup ? firstGroup.id : 'gp-m1' }));
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    🔗 Subcategory (Menu Link)
                  </label>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {categoryType === 'dept' && "💡 Creates a root navigation tab next to Men, Women, Kids (e.g. Home Decor)."}
                  {categoryType === 'group' && "💡 Creates a column heading inside the dropdown (e.g. Boys Wear, Top Wear)."}
                  {categoryType === 'sub' && "💡 Creates a clickable subcategory link inside a column group (e.g. T-Shirts, Shirts)."}
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>
                  {categoryType === 'dept' ? 'Department Name *' :
                   categoryType === 'group' ? 'Category Group Name *' :
                   'Subcategory Name *'}
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'input-error' : ''}`}
                  placeholder={
                    categoryType === 'dept' ? "e.g. Home Decor" :
                    categoryType === 'group' ? "e.g. Boys Wear, Bedding" :
                    "e.g. T-Shirts, Bedsheets"
                  }
                  value={formFields.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
                {errors.name && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>

              {categoryType !== 'dept' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>
                    {categoryType === 'group' ? 'Parent Department (Root) *' : 'Parent Category Group (Column) *'}
                  </label>
                  {categoryType === 'group' ? (
                    <select
                      className={`form-control ${errors.parentCategory ? 'input-error' : ''}`}
                      value={formFields.parentCategory}
                      onChange={e => setFormFields({ ...formFields, parentCategory: e.target.value })}
                    >
                      {categories.filter(c => c.parentCategory === 'None' || c.parentCategory === 'none').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className={`form-control ${errors.parentCategory ? 'input-error' : ''}`}
                      value={formFields.parentCategory}
                      onChange={e => setFormFields({ ...formFields, parentCategory: e.target.value })}
                    >
                      {categories.filter(c => getCategoryType(c) === 'Category Group').map(g => {
                        const parentDept = categories.find(p => p.id === g.parentCategory);
                        return (
                          <option key={g.id} value={g.id}>{g.name} ({parentDept ? parentDept.name : 'Root'})</option>
                        );
                      })}
                    </select>
                  )}
                  {errors.parentCategory && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.parentCategory}</span>}
                </div>
              )}


            </div>

            {/* Section 2: Category Images - Only for Root Departments */}
            {categoryType === 'dept' && (
              <div className="premium-card glass-card">
                <div className="card-header-row">
                  <ImageIcon size={18} />
                  <div>
                    <h3>Category Image</h3>
                    <p>Provide a thumbnail representation icon for this department collection</p>
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '400px' }}>
                  <label>Category Thumbnail Image</label>
                  <div 
                    className="dropzone-box" 
                    style={{ padding: '16px', cursor: 'pointer', position: 'relative' }} 
                    onClick={() => document.getElementById('thumbnail-file-input')?.click()}
                  >
                    <UploadCloud size={24} style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.75rem', display: 'block' }}>Choose Image File</span>
                    <input 
                      id="thumbnail-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleThumbnailFileChange}
                    />
                  </div>
                  {formFields.thumbnail && (
                    <div className="image-thumb-wrapper" style={{ width: '80px', height: '80px', marginTop: '12px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <img src={formFields.thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        className="img-remove-btn" 
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                        onClick={() => setFormFields({ ...formFields, thumbnail: '' })}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Display Settings */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Settings size={18} />
                <div>
                  <h3>Display Settings</h3>
                  <p>Control visibility statuses and sorting weight parameters</p>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={formFields.status} onChange={e => setFormFields({ ...formFields, status: e.target.value })}>
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="hidden">Hidden (Archived)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort Order Index</label>
                  <input type="number" className="form-control" value={formFields.sortOrder} onChange={e => setFormFields({ ...formFields, sortOrder: Number(e.target.value) })} />
                </div>
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Featured Category</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show inside recommendation sliders.</span>
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Display in main department grids.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.showOnHomepage}
                  onChange={e => setFormFields({ ...formFields, showOnHomepage: e.target.checked })}
                />
              </div>
            </div>

            {/* Section 4: SEO */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Globe size={18} />
                <div>
                  <h3>SEO Configs</h3>
                  <p>Set search engine title attributes and meta descriptions</p>
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
                <label>Slug URL path *</label>
                <input
                  type="text"
                  className={`form-control ${errors.slug ? 'input-error' : ''}`}
                  placeholder={
                    categoryType === 'dept' ? "e.g. home-decor" :
                    categoryType === 'group' ? "e.g. bedding" :
                    "e.g. t-shirts"
                  }
                  value={formFields.slug}
                  onChange={e => setFormFields({ ...formFields, slug: e.target.value })}
                  required
                />
                {errors.slug && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.slug}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>SEO Title</label>
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
                <input type="text" className="form-control" placeholder="e.g. gowns, evening wear, silk wrap" value={formFields.seoKeywords} onChange={e => setFormFields({ ...formFields, seoKeywords: e.target.value })} />
              </div>
            </div>

            {/* Bottom Actions Fixed Bar */}
            <div className="form-actions-fixed-bar">
              <button type="button" className="btn-admin btn-admin-secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-admin btn-admin-secondary" onClick={(e) => handleSaveCategory(e, 'draft')}>
                <Save size={14} /> Save Draft
              </button>
              <button type="button" className="btn-admin btn-admin-secondary" onClick={() => alert(`Preview:\nName: ${formFields.name || 'Unnamed'}\nSlug: /${formFields.slug}\nParent: ${formFields.parentCategory}`)}>
                <Eye size={14} /> Preview
              </button>
              <button type="button" className="btn-admin btn-admin-primary" onClick={(e) => handleSaveCategory(e, 'active')}>
                <Check size={14} /> Create Category
              </button>
            </div>

          </div>

          {/* Right Live Preview Sticky Sidebar */}
          <div className="sticky-preview-sidebar">
            <div className="premium-card glass-card" style={{ border: '1px solid var(--accent-gold)', background: 'var(--bg-secondary)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="preview-mock-tag">Category Preview</span>
                <span className={`status-badge ${formFields.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {formFields.status}
                </span>
              </div>

              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                {categoryType === 'dept' && (
                  <div style={{ aspectRatio: '16/9', background: 'var(--bg-tertiary)', position: 'relative' }}>
                    {formFields.thumbnail ? (
                      <img src={formFields.thumbnail} alt="Category Image Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <ImageIcon size={24} />
                      </div>
                    )}
                    {formFields.featured && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#000', color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 'bold', padding: '3px 6px', borderRadius: '4px' }}>
                        FEATURED
                      </div>
                    )}
                  </div>
                )}

                <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {categoryType === 'dept' ? (
                    <img src={formFields.thumbnail} alt="Thumb Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  ) : categoryType === 'group' ? (
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: '1px solid var(--border-color)' }}>
                      <FolderOpen size={18} />
                    </div>
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'rgba(156, 163, 175, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid var(--border-color)' }}>
                      <Globe size={18} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formFields.name || 'Category Name'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Slug: <code>/{formFields.slug || 'slug'}</code></span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Parent Node: <strong>{getParentName(formFields.parentCategory)}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Filter categories by selected level tab, status filter, and search text query
  const filteredCategories = categories.filter(c => {
    // 1. Level Type Tab Filter
    const type = getCategoryType(c);
    if (activeTypeTab === 'dept' && type !== 'Department') return false;
    if (activeTypeTab === 'group' && type !== 'Category Group') return false;
    if (activeTypeTab === 'sub' && type !== 'Subcategory') return false;

    // 2. Status Filter
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    // 3. Search text matching (name, slug, parentNode)
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const parentName = getParentName(c.parentCategory).toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchSlug = (c.slug || '').toLowerCase().includes(q);
      const matchParent = parentName.includes(q);
      if (!matchName && !matchSlug && !matchParent) return false;
    }

    return true;
  });

  // --- RENDER STANDARD CATEGORIES TABLE LIST ---
  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Category Management</h1>
          <p className="subtitle">Manage store navigation, collections hierarchy, and slug urls.</p>
        </div>
        <button onClick={handleOpenAddForm} className="btn-admin btn-admin-primary">
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Search & Filter Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input 
            type="text"
            className="form-control"
            placeholder="Search categories by name, slug or parent node..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Status Filter:</label>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '150px', margin: 0 }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Private)</option>
            <option value="hidden">Hidden (Archived)</option>
          </select>
        </div>
      </div>

      {/* Category Level / Type Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTypeTab('all')} 
          className={`btn-admin ${activeTypeTab === 'all' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          All ({categories.length})
        </button>
        <button 
          onClick={() => setActiveTypeTab('dept')} 
          className={`btn-admin ${activeTypeTab === 'dept' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Departments (Roots) ({categories.filter(c => getCategoryType(c) === 'Department').length})
        </button>
        <button 
          onClick={() => setActiveTypeTab('group')} 
          className={`btn-admin ${activeTypeTab === 'group' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Category Groups (Columns) ({categories.filter(c => getCategoryType(c) === 'Category Group').length})
        </button>
        <button 
          onClick={() => setActiveTypeTab('sub')} 
          className={`btn-admin ${activeTypeTab === 'sub' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Subcategories (Links) ({categories.filter(c => getCategoryType(c) === 'Subcategory').length})
        </button>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category Name</th>
              <th>Hierarchy Level</th>
              <th>Parent Node</th>
              <th>Slug Url</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(c => {
              const type = getCategoryType(c);
              let typeStyle = {};
              if (type === 'Department') {
                typeStyle = { background: 'rgba(212, 175, 55, 0.12)', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.25)' };
              } else if (type === 'Category Group') {
                typeStyle = { background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' };
              } else {
                typeStyle = { background: 'rgba(156, 163, 175, 0.12)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.25)' };
              }

              return (
                <tr key={c.id}>
                  <td>
                    {type === 'Department' ? (
                      <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : type === 'Category Group' ? (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                        <FolderOpen size={16} />
                      </div>
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(156, 163, 175, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <Globe size={16} />
                      </div>
                    )}
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.65rem', 
                      fontWeight: 600, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      ...typeStyle 
                    }}>
                      {type}
                    </span>
                  </td>
                  <td>{getParentName(c.parentCategory)}</td>
                  <td><code>/{c.slug}</code></td>
                  <td>
                    <span className={`status-badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions-group">
                      <button onClick={() => handleOpenEditForm(c)} title="Edit"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-rose" title="Delete"><Trash2 size={14} /></button>
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
export default Categories;
