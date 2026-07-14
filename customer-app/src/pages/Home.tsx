import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { ScrollSequenceCanvas } from '../components/ScrollSequenceCanvas';
import './Home.css';

export const Home: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Flash Sale details states
  const [flashActive, setFlashActive] = useState(true);
  const [flashTitle, setFlashTitle] = useState('Exclusive Private Flash Sale');
  const [flashSubtitle, setFlashSubtitle] = useState('Save up to 30% off selected leather garments and silk styles. Complimentary silk garment cover included.');
  const [flashImage, setFlashImage] = useState('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80');
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 55 });
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  const defaultReviews = [
    { name: 'Aria Montgomery', rating: 5, comment: 'Absolutely stunned by the silk wrap evening gown. The drape is incredibly fluid and fits like a custom couture piece.', role: 'Vogue Contributor' },
    { name: 'Julian Vance', rating: 5, comment: 'The Mongolian cashmere coat is soft beyond description. Premium customer service and fast international delivery.', role: 'Refined Taste Blog' },
    { name: 'Scarlett Johansson', rating: 5, comment: 'Magnificent tailoring. The asymmetric blazer is the perfect balance of avant-garde and classic boardroom look.', role: 'Entrepreneur' }
  ];
  const [dbReviews, setDbReviews] = useState<any[]>(defaultReviews);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://ecommerce-website-hvuy.onrender.com/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err));

    fetch('https://ecommerce-website-hvuy.onrender.com/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const roots = data.filter(c => c.parentCategory === 'None' || c.parentCategory === 'none' || !c.parentCategory);
          setDbCategories(roots);
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err));

    // Fetch marketing and settings configurations
    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.flash_sale_active !== undefined) setFlashActive(data.flash_sale_active === 'true');
          if (data.flash_sale_title) setFlashTitle(data.flash_sale_title);
          if (data.flash_sale_subtitle) setFlashSubtitle(data.flash_sale_subtitle);
          if (data.flash_sale_image) setFlashImage(data.flash_sale_image);
          
          const hours = parseInt(data.flash_sale_hours) || 4;
          const mins = parseInt(data.flash_sale_minutes) || 34;
          const secs = parseInt(data.flash_sale_seconds) || 55;
          setTimeLeft({ hours, minutes: mins, seconds: secs });
        }
      })
      .catch(err => console.error('Failed to load flash sale settings:', err));

    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbBrands(data.filter(b => b.status === 'active'));
        }
      })
      .catch(err => console.error('Failed to fetch brands list:', err));

    fetch('https://ecommerce-website-hvuy.onrender.com/api/admin/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const approved = data.filter(r => r.status === 'approved' || r.status === 'active');
          if (approved.length > 0) {
            setDbReviews(approved);
          } else {
            setDbReviews(defaultReviews);
          }
        } else {
          setDbReviews(defaultReviews);
        }
      })
      .catch(() => setDbReviews(defaultReviews));
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const trendingProducts = products.filter(p => p.trending);
  const bestSellers = products.filter(p => p.bestSeller);



  return (
    <div className="home-page">
      {/* 1. Cinematic Scroll Sequence Hero Section */}
      <ScrollSequenceCanvas
        folderPath="/hero_images"
        fileNameGenerator={(index) => `ezgif-frame-${String(index).padStart(3, '0')}.png`}
        totalFrames={161}
        scrollDistance="400%"
      />

      {/* Luxury Features Banner */}
      <section className="features-banner glass-panel">
        <div className="container features-grid">
          <div className="feature-item">
            <Truck size={24} className="text-gold" />
            <div>
              <h3>Complimentary Shipping</h3>
              <p>On all global orders over ₹20,000</p>
            </div>
          </div>
          <div className="feature-item">
            <RefreshCw size={24} className="text-gold" />
            <div>
              <h3>Private Concierge Returns</h3>
              <p>30 days return via doorstep pick up</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck size={24} className="text-gold" />
            <div>
              <h3>Secured Authenticity</h3>
              <p>Certified direct from design houses</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section id="shop_by_category" className="categories-section container reveal-3d">
        <h2 className="serif-text section-title text-center">Shop by Category</h2>
        <div className="categories-grid">
          {dbCategories.length > 0 ? (
            dbCategories.map(dept => (
              <Link key={dept.id} to={`/products?gender=${dept.name.toLowerCase()}`} className="category-card">
                <img src={dept.image || "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800"} alt={dept.name} />
                <div className="category-card-overlay">
                  <h3 className="serif-text">{dept.name}</h3>
                  <span>Browse Selection <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))
          ) : (
            <>
              <Link to="/products?gender=women" className="category-card">
                <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800" alt="Women Category" />
                <div className="category-card-overlay">
                  <h3 className="serif-text">Women's Gowns</h3>
                  <span>Browse Selection <ArrowRight size={14} /></span>
                </div>
              </Link>
              <Link to="/products?gender=men" className="category-card">
                <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800" alt="Men Category" />
                <div className="category-card-overlay">
                  <h3 className="serif-text">Men's Wardrobe</h3>
                  <span>Browse Selection <ArrowRight size={14} /></span>
                </div>
              </Link>
              <Link to="/products?gender=kids" className="category-card">
                <img src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800" alt="Kids Category" />
                <div className="category-card-overlay">
                  <h3 className="serif-text">Kids Apparel</h3>
                  <span>Browse Selection <ArrowRight size={14} /></span>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 3. Featured Collections */}
      <section className="featured-collections bg-light-gray reveal-3d">
        <div className="container">
          <div className="section-header">
            <h2 className="serif-text">Featured Collections</h2>
            <Link to="/search" className="view-all-link">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="products-grid-layout">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flash Sale Section with Countdown */}
      {flashActive && (
        <section className="flash-sale-section glass-panel container reveal-3d">
          <div className="flash-sale-grid">
            <div className="flash-sale-content">
              <span className="badge badge-sale">Limited Time Event</span>
              <h2 className="serif-text">{flashTitle}</h2>
              <p>{flashSubtitle}</p>
              
              {/* Animated timer */}
              <div className="countdown-timer">
                <div className="timer-box">
                  <span className="timer-num">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="timer-unit">Hours</span>
                </div>
                <div className="timer-colon">:</div>
                <div className="timer-box">
                  <span className="timer-num">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="timer-unit">Mins</span>
                </div>
                <div className="timer-colon">:</div>
                <div className="timer-box">
                  <span className="timer-num">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="timer-unit">Secs</span>
                </div>
              </div>

              <Link to="/search?category=Sale" className="btn-premium btn-premium-gold">
                Access Private Sale
              </Link>
            </div>
            
            <div className="flash-sale-image">
              <img src={flashImage} alt="Flash Sale Promotion" />
            </div>
          </div>
        </section>
      )}

      {/* 5. Trending Products */}
      <section className="trending-section container reveal-3d">
        <div className="section-header">
          <h2 className="serif-text">Trending Now</h2>
          <Link to="/search" className="view-all-link">Discover More <ChevronRight size={16} /></Link>
        </div>
        <div className="products-grid-layout">
          {trendingProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section className="best-sellers-section bg-light-gray reveal-3d">
        <div className="container">
          <div className="section-header">
            <h2 className="serif-text">Best Sellers</h2>
            <Link to="/search" className="view-all-link">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="products-grid-layout">
            {bestSellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Premium Brands */}
      <section className="brands-section container reveal-3d">
        <h3 className="brand-header serif-text">Houses We Represent</h3>
        <div className="brands-logo-row">
          {dbBrands.length > 0 ? (
            dbBrands.map(b => (
              <span key={b.id}>{b.name.toUpperCase()}</span>
            ))
          ) : (
            <>
              <span>GUCCI</span>
              <span>ZARA</span>
              <span>H&M STUDIO</span>
              <span>NIKE LUXE</span>
              <span>ADIDAS ORIGINALS</span>
            </>
          )}
        </div>
      </section>

      {/* Parallax Promo Banner */}
      <section className="parallax-promo-banner reveal-3d">
        <div className="parallax-promo-content">
          <span className="serif-text" style={{ letterSpacing: '0.35em', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>ZENELAIT HAUTE COUTURE</span>
          <h2 className="serif-text" style={{ fontSize: '2.5rem', fontWeight: 300, color: '#ffffff', margin: '10px 0' }}>Crafting Eternal Elegance</h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 20px auto' }}>
            Every piece is tailored to perfection using the finest handpicked silks, organic cottons, and pure Mongolian cashmere. Experience couture design fit for your everyday moments.
          </p>
          <Link to="/search" className="btn-premium btn-premium-gold" style={{ display: 'inline-block' }}>
            Explore Autumn Collection
          </Link>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="reviews-section bg-light-gray reveal-3d">
        <div className="container">
          <h2 className="serif-text section-title text-center">Client Testimonials</h2>
          <div className="reviews-grid">
            {dbReviews.map((rev, idx) => (
              <div key={idx} className="review-card glass-panel">
                <div className="review-rating">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                  ))}
                </div>
                <p className="review-comment">"{rev.comment}"</p>
                <div className="review-user">
                  <h4>{rev.customerName || rev.name}</h4>
                  <span>{rev.role || 'Verified Couture Client'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal container */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
