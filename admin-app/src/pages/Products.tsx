import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Edit, Download, X, Filter, 
  FileText, Image as ImageIcon, Layers, DollarSign, 
  Activity, Tag, Globe, Check, Eye, Save, Sparkles, UploadCloud 
} from 'lucide-react';
import { BRANDS, CATEGORY_NAMES } from '../data/mockData';
import type { AdminProduct } from '../data/mockData';
import './Products.css';




interface ProductsProps {
  globalSearch?: string;
}

export const Products: React.FC<ProductsProps> = ({ globalSearch = '' }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  const activeBrands = dbBrands.length > 0 ? dbBrands.map(b => b.name) : BRANDS;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/admin/brands`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbBrands(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSeo, setShowSeo] = useState(false);

  // Image upload simulator states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form fields
  const [formFields, setFormFields] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Women',
    categoryGroup: '',
    subcategory: '',
    productType: '',
    brand: 'Gucci',
    price: 0,
    discountPrice: 0,
    costPrice: 0,
    description: '',
    stock: 0,
    lowStockAlert: 10,
    status: 'active',
    
    // Images
    images: [] as string[],
    
    // Variants
    sizes: [] as string[],
    colors: [] as string[],
    customColor: '#d4af37',
    
    // Attributes
    material: 'Silk',
    fabric: 'Crepe de Chine',
    fit: 'Regular Fit',
    pattern: 'Solid Color',
    sleeveType: 'Long Sleeve',
    neckType: 'V-Neck',
    occasion: 'Evening',
    season: 'Autumn/Winter',
    gender: 'Women',
    ageGroup: 'Adults',
    countryOfOrigin: 'Italy',
    
    // Shipping
    weight: 0.5,
    length: 30,
    width: 20,
    height: 5,
    
    // SEO
    slug: '',
    seoTitle: '',
    metaDescription: '',
    seoKeywords: '',
    
    // Publishing
    featured: false,
    bestSeller: false,
    newArrival: false,
    trending: false,
    limitedEdition: false
  });

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/api/admin/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch admin products:', err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Slug generator and SEO auto-population helper
  const handleNameChange = (val: string) => {
    const brandName = formFields.brand || 'Zenelait';
    const categoryName = formFields.category || 'Garments';
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const autoMeta = val ? `Buy ${val} by ${brandName} online. Premium quality garments with fast shipping.` : '';
    const autoKeywords = val ? `${val.toLowerCase()}, ${brandName.toLowerCase()}, ${categoryName.toLowerCase()}, activewear` : '';

    setFormFields(prev => ({
      ...prev,
      name: val,
      slug: slug,
      seoTitle: val ? `${val} | ${brandName} Official Store`.slice(0, 70) : '',
      metaDescription: prev.metaDescription ? prev.metaDescription : autoMeta.slice(0, 160),
      seoKeywords: prev.seoKeywords ? prev.seoKeywords : autoKeywords
    }));
  };

  const handleAutofillSeo = () => {
    const val = formFields.name || '';
    const brandName = formFields.brand || 'Zenelait';
    const categoryName = formFields.category || 'Garments';
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const autoMeta = val ? `Buy ${val} by ${brandName} online. Premium quality garments with fast shipping.` : '';
    const autoKeywords = val ? `${val.toLowerCase()}, ${brandName.toLowerCase()}, ${categoryName.toLowerCase()}, activewear` : '';

    setFormFields(prev => ({
      ...prev,
      slug: slug,
      seoTitle: val ? `${val} | ${brandName} Official Store`.slice(0, 70) : '',
      metaDescription: autoMeta.slice(0, 160),
      seoKeywords: autoKeywords
    }));
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setErrors({});
    setFormFields({
      name: '',
      sku: '',
      barcode: '',
      category: 'Women',
      categoryGroup: '',
      subcategory: '',
      productType: '',
      brand: BRANDS[0] || 'Gucci',
      price: 0,
      discountPrice: 0,
      costPrice: 0,
      description: '',
      stock: 0,
      lowStockAlert: 10,
      status: 'active',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
      ],
      sizes: ['S', 'M', 'L'],
      colors: ['#D4AF37', '#111827'],
      customColor: '#d4af37',
      material: 'Silk',
      fabric: 'Crepe de Chine',
      fit: 'Regular Fit',
      pattern: 'Solid Color',
      sleeveType: 'Long Sleeve',
      neckType: 'V-Neck',
      occasion: 'Evening',
      season: 'Autumn/Winter',
      gender: 'Women',
      ageGroup: 'Adults',
      countryOfOrigin: 'Italy',
      weight: 0.5,
      length: 30,
      width: 20,
      height: 5,
      slug: '',
      seoTitle: '',
      metaDescription: '',
      seoKeywords: '',
      featured: false,
      bestSeller: false,
      newArrival: false,
      trending: false,
      limitedEdition: false
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: any) => {
    setEditingProduct(p);
    setErrors({});

    // Parse values safely
    const parsedImages = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
    const parsedSizes = Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes || '[]');
    const parsedColors = Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors || '[]');

    setFormFields({
      name: p.name || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      category: p.category || 'Women',
      categoryGroup: p.categoryGroup || '',
      subcategory: p.subcategory || '',
      productType: p.productType || '',
      brand: p.brand || 'Gucci',
      price: p.price || 0,
      discountPrice: p.discountPrice || (p.price - (p.price * (p.discount || 0) / 100)) || 0,
      costPrice: p.costPrice || 0,
      description: p.description || '',
      stock: p.stock || 0,
      lowStockAlert: p.lowStockAlert || 10,
      status: p.status || 'active',
      images: parsedImages,
      sizes: parsedSizes,
      colors: parsedColors,
      customColor: '#d4af37',
      material: p.material || 'Silk',
      fabric: p.fabric || 'Crepe de Chine',
      fit: p.fit || 'Regular Fit',
      pattern: p.pattern || 'Solid Color',
      sleeveType: p.sleeveType || 'Long Sleeve',
      neckType: p.neckType || 'V-Neck',
      occasion: p.occasion || 'Evening',
      season: p.season || 'Autumn/Winter',
      gender: p.gender || 'Women',
      ageGroup: p.ageGroup || 'Adults',
      countryOfOrigin: p.countryOfOrigin || 'Italy',
      weight: p.weight || 0.5,
      length: p.length || 30,
      width: p.width || 20,
      height: p.height || 5,
      slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
      seoTitle: p.seoTitle || p.name || '',
      metaDescription: p.metaDescription || p.description || '',
      seoKeywords: p.seoKeywords || '',
      featured: p.featured === 1 || p.featured === true,
      bestSeller: p.bestSeller === 1 || p.bestSeller === true,
      newArrival: p.newArrival === 1 || p.newArrival === true,
      trending: p.trending === 1 || p.trending === true,
      limitedEdition: p.limitedEdition === 1 || p.limitedEdition === true
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          setProducts(products.filter(p => p.id !== id));
        })
        .catch(err => console.error(err));
    }
  };

  // File Upload Handler (Base64 conversion)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        
        setTimeout(() => {
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Str = reader.result as string;
              setFormFields(prevFields => {
                if (prevFields.images.includes(base64Str)) return prevFields;
                return {
                  ...prevFields,
                  images: [...prevFields.images, base64Str]
                };
              });
            };
            reader.readAsDataURL(file);
          });
          setIsUploading(false);
        }, 300);
      } else {
        setUploadProgress(progress);
      }
    }, 150);
  };

  // Size click toggle
  const handleToggleSize = (sz: string) => {
    setFormFields(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sz) ? prev.sizes.filter(s => s !== sz) : [...prev.sizes, sz]
    }));
  };

  // Color picker addition
  const handleAddCustomColor = () => {
    if (!formFields.colors.includes(formFields.customColor)) {
      setFormFields(prev => ({
        ...prev,
        colors: [...prev.colors, prev.customColor]
      }));
    }
  };

  // Color click remove
  const handleRemoveColor = (col: string) => {
    setFormFields(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== col)
    }));
  };

  // Real-time Calculators
  const cost = Number(formFields.costPrice) || 0;
  const retail = Number(formFields.price) || 0;
  const discountVal = Number(formFields.discountPrice) || 0;

  const sellingPrice = discountVal > 0 ? discountVal : retail;
  const profitMargin = sellingPrice > 0 ? Math.round(((sellingPrice - cost) / sellingPrice) * 100) : 0;
  const discountPct = retail > 0 && discountVal > 0 ? Math.round(((retail - discountVal) / retail) * 100) : 0;

  // Auto stock status
  const currentStock = Number(formFields.stock) || 0;
  const lowLimit = Number(formFields.lowStockAlert) || 10;
  
  let stockStatusLabel = 'In Stock';
  let stockBadgeClass = 'badge-success';
  if (currentStock === 0) {
    stockStatusLabel = 'Out of Stock';
    stockBadgeClass = 'badge-danger';
  } else if (currentStock <= lowLimit) {
    stockStatusLabel = 'Low Stock';
    stockBadgeClass = 'badge-warning';
  }

  // Form submission with validation checks
  const handleSaveProduct = (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formFields.name.trim()) newErrors.name = 'Product Title is required.';
    if (!formFields.sku.trim()) newErrors.sku = 'SKU code is required.';
    if (!formFields.category) newErrors.category = 'Department is required.';
    if (!formFields.categoryGroup) newErrors.categoryGroup = 'Category Group is required.';
    if (!formFields.subcategory) newErrors.subcategory = 'Subcategory is required.';
    
    // Unique SKU check
    const duplicateSku = products.find(p => p.sku.toLowerCase() === formFields.sku.toLowerCase() && p.id !== editingProduct?.id);
    if (duplicateSku) {
      newErrors.sku = 'SKU code must be unique. This SKU is already assigned to another garment.';
    }

    if (retail <= 0) newErrors.price = 'Retail price must be a positive number.';
    if (cost < 0) newErrors.costPrice = 'Cost price cannot be negative.';
    if (currentStock < 0) newErrors.stock = 'Warehouse stock level cannot be negative.';
    if (discountVal > 0 && discountVal > retail) {
      newErrors.discountPrice = 'Discount price cannot exceed the main retail price.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    setSaving(true);

    const activeStatus = forceStatus || formFields.status;

    // Build model structure
    const productPayload = {
      name: formFields.name,
      category: formFields.category,
      categoryGroup: formFields.categoryGroup,
      subcategory: formFields.subcategory,
      productType: formFields.productType,
      brand: formFields.brand,
      price: retail,
      originalPrice: retail,
      discount: discountPct,
      costPrice: cost,
      sku: formFields.sku,
      barcode: formFields.barcode,
      description: formFields.description,
      images: formFields.images,
      sizes: formFields.sizes,
      colors: formFields.colors,
      material: formFields.material,
      stock: currentStock,
      weight: formFields.weight,
      dimensions: `${formFields.length}x${formFields.width}x${formFields.height} cm`,
      status: activeStatus,
      tag: formFields.featured ? 'Featured' : (formFields.bestSeller ? 'Best Seller' : ''),
      occasion: formFields.occasion,
      trending: formFields.trending ? 1 : 0,
      featured: formFields.featured ? 1 : 0,
      bestSeller: formFields.bestSeller ? 1 : 0,
      newArrival: formFields.newArrival ? 1 : 0,
      limitedEdition: formFields.limitedEdition ? 1 : 0,
      slug: formFields.slug,
      seoTitle: formFields.seoTitle,
      metaDescription: formFields.metaDescription,
      seoKeywords: formFields.seoKeywords,
      details: [
        `Fabric: ${formFields.fabric}`,
        `Fit: ${formFields.fit}`,
        `Pattern: ${formFields.pattern}`,
        `Sleeve: ${formFields.sleeveType}`,
        `Neck: ${formFields.neckType}`,
        `Season: ${formFields.season}`,
        `Made in ${formFields.countryOfOrigin}`
      ]
    };

    const targetUrl = editingProduct 
      ? `${API_BASE_URL}/api/admin/products/${editingProduct.id}`
      : `${API_BASE_URL}/api/admin/products`;

    const targetMethod = editingProduct ? 'PUT' : 'POST';

    fetch(targetUrl, {
      method: targetMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload)
    })
      .then(res => res.json())
      .then(data => {
        setSaving(false);
        if (data.success) {
          fetchProducts();
          setIsFormOpen(false);
        } else {
          alert('Error saving product details: ' + (data.error || 'unknown server error'));
        }
      })
      .catch(err => {
        console.error(err);
        setSaving(false);
        alert('Server connection timed out.');
      });
  };

  const filteredProducts = products.filter(p => {
    const activeSearch = globalSearch || searchQuery;
    const matchesSearch = p.name.toLowerCase().includes(activeSearch.toLowerCase()) || p.sku.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert("No products to export.");
      return;
    }
    const headers = ["ID", "Name", "SKU", "Category", "Brand", "Price", "Discount", "Stock", "Status", "Material", "Occasion"];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || '',
      p.category,
      p.brand,
      p.price,
      p.discount || 0,
      p.stock,
      p.status,
      p.material || '',
      p.occasion || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER DEDICATED REDESIGNED ADD/EDIT PRODUCT PAGE ---
  if (isFormOpen) {
    return (
      <div className="admin-products-page" style={{ position: 'relative' }}>
        {saving && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div className="glass-card text-center" style={{ padding: '30px' }}>
              <div className="spinner-gold" style={{ margin: '0 auto 16px auto' }} />
              <h3 className="serif-text">Saving Luxury Garment...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Updating catalogs and synchronizing inventory matrix</p>
            </div>
          </div>
        )}

        <div className="products-title-row">
          <div>
            <h1 className="serif-text">{editingProduct ? 'Redesign Garment File' : 'Add Luxury Clothing Product'}</h1>
            <p className="subtitle">Publish premium designer inventory to the catalog database.</p>
          </div>
          <button className="btn-admin btn-admin-secondary" onClick={() => setIsFormOpen(false)}>
            <X size={14} /> Back to Catalog
          </button>
        </div>

        <div className="add-product-container">
          {/* Left Fields Column */}
          <div className="form-sections-column">
            
            {/* Section 1: Basic Information */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <FileText size={18} />
                <div>
                  <h3>Basic Information</h3>
                  <p>Garment identifiers, brand registry, and central text details</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Product Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Silk Wrap Evening Gown"
                  value={formFields.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
                {errors.name && <span className="error-text-label" style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>

              <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>SKU Code *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.sku ? 'input-error' : ''}`}
                    placeholder="e.g. SLK-WR-001"
                    value={formFields.sku}
                    onChange={e => setFormFields({ ...formFields, sku: e.target.value })}
                    required
                  />
                  {errors.sku && <span className="error-text-label" style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.sku}</span>}
                </div>
                <div className="form-group">
                  <label>Barcode / EAN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 400192837461"
                    value={formFields.barcode}
                    onChange={e => setFormFields({ ...formFields, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Department (Category) *</label>
                  <select
                    className={`form-control ${errors.category ? 'input-error' : ''}`}
                    value={formFields.category}
                    onChange={e => setFormFields(prev => ({ 
                      ...prev, 
                      category: e.target.value,
                      categoryGroup: '',
                      subcategory: ''
                    }))}
                  >
                    <option value="">Select Department</option>
                    {dbCategories.filter(c => c.parentCategory === 'None' || c.parentCategory === 'none').map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  {errors.category && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label>Category Group *</label>
                  <select
                    className={`form-control ${errors.categoryGroup ? 'input-error' : ''}`}
                    value={formFields.categoryGroup}
                    disabled={!formFields.category}
                    onChange={e => setFormFields(prev => ({ 
                      ...prev, 
                      categoryGroup: e.target.value,
                      subcategory: ''
                    }))}
                  >
                    <option value="">Select Group</option>
                    {(() => {
                      const dept = dbCategories.find(c => c.name === formFields.category && (c.parentCategory === 'None' || c.parentCategory === 'none'));
                      return dept ? dbCategories.filter(c => c.parentCategory === dept.id).map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      )) : null;
                    })()}
                  </select>
                  {errors.categoryGroup && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.categoryGroup}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Subcategory *</label>
                <select
                  className={`form-control ${errors.subcategory ? 'input-error' : ''}`}
                  value={formFields.subcategory}
                  disabled={!formFields.categoryGroup}
                  onChange={e => setFormFields(prev => ({ 
                    ...prev, 
                    subcategory: e.target.value
                  }))}
                >
                  <option value="">Select Subcategory</option>
                  {(() => {
                    const dept = dbCategories.find(c => c.name === formFields.category && (c.parentCategory === 'None' || c.parentCategory === 'none'));
                    if (!dept) return null;
                    const group = dbCategories.find(c => c.name === formFields.categoryGroup && c.parentCategory === dept.id);
                    return group ? dbCategories.filter(c => c.parentCategory === group.id).map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    )) : null;
                  })()}
                </select>
                {errors.subcategory && <span style={{ color: 'var(--status-error)', fontSize: '0.75rem' }}>{errors.subcategory}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Brand House *</label>
                <select
                  className="form-control"
                  value={formFields.brand}
                  onChange={e => setFormFields({ ...formFields, brand: e.target.value })}
                >
                  {activeBrands.map(br => <option key={br} value={br}>{br}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Product Description *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the fabric blend, draping silhouette, and presence feel..."
                  value={formFields.description}
                  onChange={e => setFormFields({ ...formFields, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Publication Status</label>
                <select
                  className="form-control"
                  value={formFields.status}
                  onChange={e => setFormFields({ ...formFields, status: e.target.value })}
                >
                  <option value="active">Active (Visible in Catalog)</option>
                  <option value="draft">Draft (Restricted access)</option>
                  <option value="archived">Archived (Deactivated catalog item)</option>
                </select>
              </div>
            </div>

            {/* Section 2: Product Images */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <ImageIcon size={18} />
                <div>
                  <h3>Product Gallery</h3>
                  <p>Upload high-definition fashion photography. First image is the main card visual</p>
                </div>
              </div>

              <div className="dropzone-box" style={{ cursor: 'default' }}>
                <input 
                  type="file" 
                  id="product-image-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                />
                <UploadCloud size={32} style={{ color: 'var(--accent-gold)', marginBottom: '10px' }} />
                <button 
                  type="button" 
                  className="btn-admin btn-admin-primary" 
                  onClick={() => document.getElementById('product-image-upload')?.click()}
                  style={{ marginBottom: '10px' }}
                >
                  Choose Image File(s)
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supports premium JPG, PNG, and WebP files up to 10MB</p>
                
                {isUploading && (
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    <div style={{ background: 'var(--bg-tertiary)', height: '4px', width: '200px', margin: '0 auto', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--accent-gold)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.15s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', display: 'block' }}>Processing file upload... {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {formFields.images.length > 0 && (
                <div className="uploaded-images-grid">
                  {formFields.images.map((img, idx) => (
                    <div key={idx} className="image-thumb-wrapper" title={idx === 0 ? 'Primary catalog thumbnail' : 'Gallery carousel piece'}>
                      <img src={img} alt={`Preview ${idx}`} />
                      <button 
                        type="button" 
                        className="img-remove-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFields(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        ✕
                      </button>
                      {idx === 0 ? (
                        <div className="main-img-tag">MAIN</div>
                      ) : (
                        <button
                          type="button"
                          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: '0.6rem', padding: '2px 0', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Reorder, make this index 0
                            const arr = [...formFields.images];
                            const clicked = arr.splice(idx, 1)[0];
                            setFormFields(prev => ({ ...prev, images: [clicked, ...arr] }));
                          }}
                        >
                          Make Main
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Product Variants */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Layers size={18} />
                <div>
                  <h3>Product Variants</h3>
                  <p>Design multi-size profiles and color configurations for the customer card</p>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Available Sizes</label>
                <div className="size-chips-grid">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                    const active = formFields.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        className={`size-chip ${active ? 'chip-active' : ''}`}
                        onClick={() => handleToggleSize(sz)}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Color Swatches</label>
                <div className="color-swatches-row">
                  {formFields.colors.map(col => (
                    <div 
                      key={col} 
                      className="color-circle-swatch selected-color" 
                      style={{ backgroundColor: col }}
                      onClick={() => handleRemoveColor(col)}
                      title="Click to remove color swatch"
                    />
                  ))}
                  
                  {/* Custom color picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                    <input
                      type="color"
                      value={formFields.customColor}
                      onChange={e => setFormFields({ ...formFields, customColor: e.target.value })}
                      style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      className="btn-admin btn-admin-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={handleAddCustomColor}
                    >
                      Add Color
                    </button>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>Click any swatch above to remove it from selection.</span>
              </div>
            </div>

            {/* Section 4: Pricing */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <DollarSign size={18} />
                <div>
                  <h3>Pricing Details</h3>
                  <p>Configure purchase ledgers. Financial margins are calculated automatically</p>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.costPrice ? 'input-error' : ''}`}
                    value={formFields.costPrice}
                    onChange={e => setFormFields({ ...formFields, costPrice: Number(e.target.value) })}
                    required
                  />
                  {errors.costPrice && <span style={{ color: 'var(--status-error)', fontSize: '0.7rem' }}>{errors.costPrice}</span>}
                </div>
                <div className="form-group">
                  <label>Retail Price (₹) *</label>
                  <input
                    type="number"
                    className={`form-control ${errors.price ? 'input-error' : ''}`}
                    value={formFields.price}
                    onChange={e => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    required
                  />
                  {errors.price && <span style={{ color: 'var(--status-error)', fontSize: '0.7rem' }}>{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label>Discount Price (₹)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.discountPrice ? 'input-error' : ''}`}
                    value={formFields.discountPrice}
                    onChange={e => setFormFields({ ...formFields, discountPrice: Number(e.target.value) })}
                  />
                  {errors.discountPrice && <span style={{ color: 'var(--status-error)', fontSize: '0.7rem' }}>{errors.discountPrice}</span>}
                </div>
              </div>

              {/* Automatic KPI Cards */}
              <div className="kpis-row">
                <div className="kpi-badge-card">
                  <span className="kpi-val">{profitMargin}%</span>
                  <span className="kpi-lbl">Profit Margin</span>
                </div>
                <div className="kpi-badge-card">
                  <span className="kpi-val">{discountPct}%</span>
                  <span className="kpi-lbl">Active Discount</span>
                </div>
              </div>
            </div>

            {/* Section 5: Inventory */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Activity size={18} />
                <div>
                  <h3>Warehouse Inventory</h3>
                  <p>Set physical stocks and warnings parameters. Badges will update automatically</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Warehouse Stock *</label>
                  <input
                    type="number"
                    className={`form-control ${errors.stock ? 'input-error' : ''}`}
                    value={formFields.stock}
                    onChange={e => setFormFields({ ...formFields, stock: Number(e.target.value) })}
                    required
                  />
                  {errors.stock && <span style={{ color: 'var(--status-error)', fontSize: '0.7rem' }}>{errors.stock}</span>}
                </div>
                <div className="form-group">
                  <label>Low Stock Warning Alert</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formFields.lowStockAlert}
                    onChange={e => setFormFields({ ...formFields, lowStockAlert: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem' }}>Current stock level label status:</span>
                <span className={`status-badge ${stockBadgeClass}`} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>{stockStatusLabel}</span>
              </div>
            </div>

            {/* Section 6: Attributes */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Tag size={18} />
                <div>
                  <h3>Product Attributes</h3>
                  <p>Specific descriptors used for catalog filtering tags and size guides</p>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Material</label>
                  <select 
                    className="form-control" 
                    value={['Silk', 'Cashmere', 'Wool', 'Linen', 'Leather', 'Velvet'].includes(formFields.material) ? formFields.material : 'custom'} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setFormFields({ ...formFields, material: '' });
                      } else {
                        setFormFields({ ...formFields, material: val });
                      }
                    }}
                  >
                    <option value="Silk">Silk</option>
                    <option value="Cashmere">Cashmere</option>
                    <option value="Wool">Wool</option>
                    <option value="Linen">Linen</option>
                    <option value="Leather">Leather</option>
                    <option value="Velvet">Velvet</option>
                    <option value="custom">Custom...</option>
                  </select>
                  {!['Silk', 'Cashmere', 'Wool', 'Linen', 'Leather', 'Velvet'].includes(formFields.material) && (
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ marginTop: '8px' }} 
                      placeholder="Type custom material..." 
                      value={formFields.material} 
                      onChange={e => setFormFields({ ...formFields, material: e.target.value })}
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Fabric Type</label>
                  <input type="text" className="form-control" value={formFields.fabric} onChange={e => setFormFields({ ...formFields, fabric: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fit Silhouette</label>
                  <select className="form-control" value={formFields.fit} onChange={e => setFormFields({ ...formFields, fit: e.target.value })}>
                    <option>Regular Fit</option>
                    <option>Slim Fit</option>
                    <option>Oversized Fit</option>
                    <option>Tailored Fit</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Pattern Style</label>
                  <input type="text" className="form-control" value={formFields.pattern} onChange={e => setFormFields({ ...formFields, pattern: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sleeve Cut</label>
                  <input type="text" className="form-control" value={formFields.sleeveType} onChange={e => setFormFields({ ...formFields, sleeveType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Neck Type</label>
                  <input type="text" className="form-control" value={formFields.neckType} onChange={e => setFormFields({ ...formFields, neckType: e.target.value })} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Gender Theme</label>
                  <select className="form-control" value={formFields.gender} onChange={e => setFormFields({ ...formFields, gender: e.target.value })}>
                    <option>Women</option>
                    <option>Men</option>
                    <option>Unisex</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Age Group</label>
                  <select className="form-control" value={formFields.ageGroup} onChange={e => setFormFields({ ...formFields, ageGroup: e.target.value })}>
                    <option>Adults</option>
                    <option>Kids</option>
                    <option>Toddlers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Country of Origin</label>
                  <input type="text" className="form-control" value={formFields.countryOfOrigin} onChange={e => setFormFields({ ...formFields, countryOfOrigin: e.target.value })} />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Occasion Mapping</label>
                  <input type="text" className="form-control" placeholder="e.g. Evening, Casual" value={formFields.occasion} onChange={e => setFormFields({ ...formFields, occasion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Season</label>
                  <select className="form-control" value={formFields.season} onChange={e => setFormFields({ ...formFields, season: e.target.value })}>
                    <option value="Autumn/Winter">Autumn/Winter</option>
                    <option value="Spring/Summer">Spring/Summer</option>
                    <option value="Resort">Resort</option>
                    <option value="All Season">All Season</option>
                  </select>
                </div>
              </div>
            </div>



            {/* Section 8: SEO */}
            <div className="premium-card glass-card">
              <div className="card-header-row" style={{ cursor: 'pointer' }} onClick={() => setShowSeo(!showSeo)}>
                <Globe size={18} />
                <div style={{ flex: 1 }}>
                  <h3>Search Engine Optimization (SEO)</h3>
                  <p>Configure title tags and slugs for search indexes (Auto-generated by default)</p>
                </div>
                <button 
                  type="button" 
                  className="btn-admin btn-admin-secondary" 
                  style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                >
                  {showSeo ? 'Hide Details' : 'Show Advanced Settings'}
                </button>
              </div>

              {showSeo && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
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
                    <label>URL Slug Link</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formFields.slug} 
                      onChange={e => setFormFields({ ...formFields, slug: e.target.value })} 
                    />
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
                      <span>Standard search engines cut off at 70 characters.</span>
                      <span className={formFields.seoTitle.length > 60 ? 'seo-counter-alert' : ''}>{formFields.seoTitle.length} / 70</span>
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
                      <span>Recommended text length: 160 characters.</span>
                      <span className={formFields.metaDescription.length > 150 ? 'seo-counter-alert' : ''}>{formFields.metaDescription.length} / 160</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>SEO Keywords (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. silk gown, formal dress, women designer wear"
                      value={formFields.seoKeywords} 
                      onChange={e => setFormFields({ ...formFields, seoKeywords: e.target.value })} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 9: Publishing Options */}
            <div className="premium-card glass-card">
              <div className="card-header-row">
                <Sparkles size={18} />
                <div>
                  <h3>Publishing Settings</h3>
                  <p>Enable premium display markers across front-page carousels</p>
                </div>
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Featured Product</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show inside the hero carousel deck.</span>
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
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Best Seller</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inject Gold bestseller tag on search grids.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.bestSeller}
                  onChange={e => setFormFields({ ...formFields, bestSeller: e.target.checked })}
                />
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>New Arrival</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mark garment as seasonal new arrival.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.newArrival}
                  onChange={e => setFormFields({ ...formFields, newArrival: e.target.checked })}
                />
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Trending Now</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sort inside client trending collections.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.trending}
                  onChange={e => setFormFields({ ...formFields, trending: e.target.checked })}
                />
              </div>

              <div className="switch-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Limited Edition</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lock with exclusive limited-run badge overlays.</span>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle-switch-input" 
                  checked={formFields.limitedEdition}
                  onChange={e => setFormFields({ ...formFields, limitedEdition: e.target.checked })}
                />
              </div>
            </div>

            {/* Bottom Actions Fixed Bar */}
            <div className="form-actions-fixed-bar">
              <button 
                type="button" 
                className="btn-admin btn-admin-secondary" 
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                className="btn-admin btn-admin-secondary"
                onClick={(e) => handleSaveProduct(e, 'draft')}
              >
                <Save size={14} /> Save Draft
              </button>
              
              <button 
                type="button" 
                className="btn-admin btn-admin-secondary"
                onClick={() => alert(`Mock Product View:\nTitle: ${formFields.name || 'Unnamed'}\nCategory: ${formFields.category}\nPrice: ₹${retail}\nStock: ${currentStock}`)}
              >
                <Eye size={14} /> Preview
              </button>

              <button 
                type="button" 
                className="btn-admin btn-admin-primary"
                onClick={(e) => handleSaveProduct(e)}
              >
                <Check size={14} /> Publish Garment
              </button>
            </div>

          </div>

          {/* Right Live Preview Sticky Sidebar */}
          <div className="sticky-preview-sidebar">
            <div className="premium-card glass-card" style={{ border: '1px solid var(--accent-gold)', background: 'var(--bg-secondary)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="preview-mock-tag">Live Card Preview</span>
                <span className={`status-badge ${formFields.status === 'active' ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {formFields.status}
                </span>
              </div>

              {/* Product preview card design */}
              <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--bg-tertiary)' }}>
                  {formFields.images.length > 0 ? (
                    <img src={formFields.images[0]} alt="Card Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: '0.75rem', marginTop: '6px' }}>Awaiting images...</span>
                    </div>
                  )}

                  {formFields.limitedEdition && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#000', color: 'var(--accent-gold)', fontSize: '0.65rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                      LIMITED EDITION
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{formFields.brand || 'Designer Brand'}</span>
                    <span>{formFields.category}</span>
                  </div>
                  
                  <h4 style={{ fontSize: '0.95rem', margin: '4px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formFields.name || 'Garment Title'}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {discountVal > 0 ? (
                      <>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>₹{discountVal}</span>
                        <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{retail}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--status-error)', fontWeight: 'bold' }}>({discountPct}% Off)</span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 'bold' }}>₹{retail || '0.00'}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', marginTop: '10px', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Stock: <strong>{currentStock}</strong></span>
                    <span className={`status-badge ${stockBadgeClass}`} style={{ fontSize: '0.65rem' }}>{stockStatusLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STANDARD CATALOG TABLE LIST ---
  return (
    <div className="admin-products-page">
      <div className="products-title-row">
        <div>
          <h1 className="serif-text">Product Management</h1>
          <p className="subtitle">Add luxury inventory items, edit SKU information, and check stock levels.</p>
        </div>
        
        <div className="action-buttons-group">
          <button onClick={handleExportCSV} className="btn-admin btn-admin-secondary">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleOpenAddForm} className="btn-admin btn-admin-primary">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

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

        <div className="dropdown-filters-group">
          <div className="select-wrapper">
            <Filter size={12} className="select-icon" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
              <option value="">All Brands</option>
              {activeBrands.map(br => <option key={br} value={br}>{br}</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="enterprise-table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const pImages = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
              const pImg = pImages[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&q=80';
              return (
                <tr key={p.id}>
                  <td>
                    <img src={pImg} alt={p.name} className="product-table-thumb" />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <span className="product-sub-category">{p.brand} | {p.category}</span>
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="status-badge badge-danger">Out of Stock</span>
                    ) : p.stock <= ((p as any).lowStockAlert || 10) ? (
                      <span className="status-badge badge-warning">{p.stock} Low Stock</span>
                    ) : (
                      <span className="status-badge badge-success">{p.stock} In Stock</span>
                    )}
                  </td>
                  <td><strong>₹{p.price}</strong></td>
                  <td className="text-muted">₹{p.costPrice}</td>
                  <td>
                    <span className={`status-badge ${p.status === 'active' ? 'badge-success' : p.status === 'draft' ? 'badge-info' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions-group">
                      <button onClick={() => handleOpenEditForm(p)} title="Edit Product"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-rose" title="Delete Product"><Trash2 size={14} /></button>
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
export default Products;