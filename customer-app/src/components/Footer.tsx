import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {

  return (
    <footer className="footer-container">
      <div className="container footer-grid">
        <div className="footer-brand-section">
          <Link to="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/ecomlogo.png" alt="Logo" style={{ height: '120px', objectFit: 'contain' }} />
          </Link>
          <p className="brand-description">
            Experience the pinnacle of luxury, modern aesthetics, and hand-tailored premium clothing. Styled for the sophisticated, designed for the future.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h3>Shop Collection</h3>
          <ul>
            <li><Link to="/search?category=New Arrivals">New Arrivals</Link></li>
            <li><Link to="/search?category=Men">Men's Wardrobe</Link></li>
            <li><Link to="/search?category=Women">Women's Gowns</Link></li>
            <li><Link to="/search?category=Kids">Kids Apparel</Link></li>
            <li><Link to="/search?category=Sale">Exclusive Sales</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h3>Client Services</h3>
          <ul>
            <li><Link to="/dashboard">My Account</Link></li>
            <li><Link to="/contact">Book an Appointment</Link></li>
            <li><Link to="/shipping-policy">Complimentary Shipping</Link></li>
            <li><Link to="/returns">Returns & Exchanges</Link></li>
            <li><Link to="/gift-cards">Gift Experience</Link></li>
          </ul>
        </div>
        <div className="footer-links-col">
          <h3> Powered by</h3>
          <img src="zenelaitinfotech_logo.png" alt="zenelaitinfotech_logo" style={{height:"50px",width:"120px"}} />
        </div>

        {/* Newsletter Subscription Removed */}
      </div>

      <div className="footer-bottom-wrapper">
        <div className="footer-bottom container">
          <p>&copy; {new Date().getFullYear()} zenelait Fashion Ltd. All rights reserved.</p>
          <div className="payment-icons">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
