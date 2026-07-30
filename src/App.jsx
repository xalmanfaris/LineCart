import React, { useMemo, useState, StrictMode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import logo from './assets/linecartlogo.png';
import { UserProvider, useUser } from './contexts/UserContext';
import { WishlistProvider, useWishlist } from './contexts/WishlistContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import ProductView from './pages/ProductView';
import { getProducts, getCart, addToCart, removeFromCart } from './api';
import ProductModal from './components/ProductModal';
import AdminShell from './pages/admin/AdminShell';
import PlaceOrder from './pages/PlaceOrder';
import { resolveAssetImage } from './utils/assetResolver';

function AppShell() {
  const [query, setQuery] = useState('');
  const { user, logout, setUser } = useUser();
  const { wishlist, isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [addingIds, setAddingIds] = useState(new Set());
  const [modalProduct, setModalProduct] = useState(null);
  const [modalAdding, setModalAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { cartItems, cartCount, addToCart, removeFromCart, isInCart, getCartItemId } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('[App] Fetching products...');
        const data = await getProducts();
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
      } catch (err) {
        console.error('[App] Failed to fetch products:', err);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [products, query]);

  const dateProducts = products.filter(p => p.category === 'Dates').slice(0, 3);
  const badamProducts = products.filter(p => p.category === 'Badam').slice(0, 3);
  const cashewProducts = products.filter(p => p.category === 'Cashew').slice(0, 3);
  const chocolateProducts = products.filter(p => p.category === 'Chocolate').slice(0, 3);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    } else {
      navigate('/');
      setTimeout(() => {
        const el2 = document.getElementById(id);
        if (el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const { showNotification } = useNotification();

  const handleAddToCart = async (product, qty = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product) return;
    if (addingIds.has(product.id)) return;

    setAddingIds(prev => new Set(prev).add(product.id));
    setModalAdding(true);

    try {
      await addToCart(product.id, qty);
    } finally {
      setAddingIds(prev => {
        const copy = new Set(prev);
        copy.delete(product.id);
        return copy;
      });
      setModalAdding(false);
    }
  };

  const handleRemoveFromCart = async (product) => {
    if (!user) return;
    if (!product) return;
    if (addingIds.has(product.id)) return;

    const itemId = getCartItemId(product.id);
    if (!itemId) return;

    setAddingIds(prev => new Set(prev).add(product.id));
    setModalAdding(true);

    try {
      await removeFromCart(itemId);
    } finally {
      setAddingIds(prev => {
        const copy = new Set(prev);
        copy.delete(product.id);
        return copy;
      });
      setModalAdding(false);
    }
  };

  const handleCartAction = (product) => {
    if (isInCart(product.id)) {
      handleRemoveFromCart(product);
    } else {
      handleAddToCart(product);
    }
  };

  return (
    <div className="app">
      <header className="navbar" role="banner">
        <div className="container nav-row">
          <div className="brand" aria-hidden="false">
            <Link to="/" className="brand-link">
              <img src={logo} alt="LineCart" className="brand-logo" />
              <span className="brand-text">LineCart</span>
            </Link>
          </div>

          <div className="nav-center">
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search premium dates, almonds, cashews..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  marginTop: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.id}`);
                        setShowDropdown(false);
                        setQuery('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <img
                        src={resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name)}
                        alt={p.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = resolveAssetImage(null, p.category, p.name);
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ color: '#0ea5e9', fontSize: '0.85rem' }}>₹{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="nav-actions">
            <Link to="/shop" className="nav-link">Shop</Link>
            <button className="btn-link" onClick={() => scrollToId('about')}>About</button>
            <button className="btn-link" onClick={() => scrollToId('contact')}>Contact</button>

            {user && (
              <>
                <Link to="/wishlist" className="cart-btn" title="Wishlist" style={{ position: 'relative' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {wishlist.length > 0 && (
                    <span className="cart-badge">{wishlist.length}</span>
                  )}
                </Link>

                <Link to="/cart" className="cart-btn" title="Cart" style={{ position: 'relative' }}>
                  <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="20" r="1.5" /><circle cx="20" cy="20" r="1.5" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
              </>
            )}

            {!user ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate('/profile')}
                  style={{
                    padding: '6px 10px',
                    fontWeight: 700,
                    color: user.role === 'admin' || user.role === 'Admin' ? '#1e40af' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {(user.role === 'admin' || user.role === 'Admin') && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4.5c-1.5 0-2.5 1-2.5 2.5v3h5v-3c0-1.5-1-2.5-2.5-2.5z" />
                      <path d="M19.5 9h-15c-.83 0-1.5.67-1.5 1.5v8c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-8c0-.83-.67-1.5-1.5-1.5z" />
                      <path d="M12 14v2" />
                    </svg>
                  )}
                  {user.name}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowLogoutModal(true)}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-card container">
            <div className="hero-left">
              <h1 className="hero-title">Shop smarter. Ship faster.</h1>
              <p className="hero-sub">Premium groceries & nuts — curated, sustainably packed, and shipped fast.</p>
              <div className="hero-ctas">
                <button className="btn-cta" onClick={() => navigate('/shop')}>Shop Now</button>
              </div>
            </div>
          </div>
        </section>

        {/* Dates Section */}
        <section id="shop" className="product-list" aria-label="Dates">
          <h2 className="section-title">Premium Dates</h2>
          <div className="products-inner">
            {dateProducts.length === 0 && <div style={{ color: '#6b7280' }}>No dates found.</div>}
            {dateProducts.map((p) => {
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                  <div className="product-image-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name || ''}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = resolveAssetImage(null, p.category, p.name);
                        }}
                      />
                    </Link>
                  </div>
                  <div className="product-info">
                    <h4 id={`p-${p.id}-name`} className="product-name">{p.name}</h4>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-meta">
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-count">{p.count} gm</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-add"
                        onClick={() => handleCartAction(p)}
                        disabled={addingIds.has(p.id)}
                      >
                        {addingIds.has(p.id) ? 'Adding…' : isInCart(p.id) ? 'Remove from Cart' : 'Add Cart'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        View Details
                      </button>
                      {user && (
                        <button
                          className={`btn btn-secondary ${isInWishlist(p.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p.id)}
                          title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(p.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Almonds Section */}
        <section className="product-list" aria-label="Almonds">
          <h2 className="section-title">Premium Almonds</h2>
          <div className="products-inner">
            {badamProducts.length === 0 && <div style={{ color: '#6b7280' }}>No almonds found.</div>}
            {badamProducts.map((p) => {
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                  <div className="product-image-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name || ''}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = resolveAssetImage(null, p.category, p.name);
                        }}
                      />
                    </Link>
                  </div>
                  <div className="product-info">
                    <h4 id={`p-${p.id}-name`} className="product-name">{p.name}</h4>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-meta">
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-count">{p.count} gm</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-add"
                        onClick={() => handleCartAction(p)}
                        disabled={addingIds.has(p.id)}
                      >
                        {addingIds.has(p.id) ? 'Adding…' : isInCart(p.id) ? 'Remove from Cart' : 'Add Cart'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setModalProduct(p)}>Quick view</button>
                      {user && (
                        <button
                          className={`btn btn-secondary ${isInWishlist(p.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p.id)}
                          title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(p.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Cashews Section */}
        <section className="product-list" aria-label="Cashews">
          <h2 className="section-title">Premium Cashews</h2>
          <div className="products-inner">
            {cashewProducts.length === 0 && <div style={{ color: '#6b7280' }}>No cashews found.</div>}
            {cashewProducts.map((p) => {
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                  <div className="product-image-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name || ''}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = resolveAssetImage(null, p.category, p.name);
                        }}
                      />
                    </Link>
                  </div>
                  <div className="product-info">
                    <h4 id={`p-${p.id}-name`} className="product-name">{p.name}</h4>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-meta">
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-count">{p.count} gm</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-add"
                        onClick={() => handleCartAction(p)}
                        disabled={addingIds.has(p.id)}
                      >
                        {addingIds.has(p.id) ? 'Adding…' : isInCart(p.id) ? 'Remove from Cart' : 'Add Cart'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setModalProduct(p)}>Quick view</button>
                      {user && (
                        <button
                          className={`btn btn-secondary ${isInWishlist(p.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p.id)}
                          title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(p.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Chocolates Section */}
        <section className="product-list" aria-label="Chocolate">
          <h2 className="section-title">Premium Chocolates</h2>
          <div className="products-inner">
            {chocolateProducts.length === 0 && <div style={{ color: '#6b7280' }}>No chocolates found.</div>}
            {chocolateProducts.map((p) => {
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                  <div className="product-image-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name || ''}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = resolveAssetImage(null, p.category, p.name);
                        }}
                      />
                    </Link>
                  </div>
                  <div className="product-info">
                    <h4 id={`p-${p.id}-name`} className="product-name">{p.name}</h4>
                    <p className="product-desc">{p.description}</p>
                    <div className="product-meta">
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-count">{p.count} gm</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-add"
                        onClick={() => handleCartAction(p)}
                        disabled={addingIds.has(p.id)}
                      >
                        {addingIds.has(p.id) ? 'Adding…' : isInCart(p.id) ? 'Remove from Cart' : 'Add Cart'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setModalProduct(p)}>Quick view</button>
                      {user && (
                        <button
                          className={`btn btn-secondary ${isInWishlist(p.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p.id)}
                          title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(p.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="about" className="product-list" aria-label="About">
          <h2 className="section-title">About LineCart</h2>
          <div className="container" style={{ maxWidth: 1100, margin: '0 auto 24px' }}>
            <div style={{ background: 'white', padding: 18, borderRadius: 12, boxShadow: 'var(--shadow)' }}>
              <p style={{ marginTop: 0, color: 'var(--muted)' }}>
                LineCart is a curated grocery & nuts marketplace focused on quality, fast shipping and
                carefully sourced products. We handpick premium dates, almonds, cashews and more —
                then pack and ship them with care.
              </p>
              <p style={{ color: 'var(--muted)' }}>
                Our mission is simple: give customers great products and a delightful shopping experience.
                We're continuously improving — you can contact us below for feedback or partnership inquiries.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="product-list" aria-label="Contact">
          <h2 className="section-title">Contact us</h2>
          <div className="container" style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
              <div style={{ background: 'white', padding: 18, borderRadius: 12, boxShadow: 'var(--shadow)' }}>
                <h3 style={{ marginTop: 0 }}>Customer support</h3>
                <p style={{ color: 'var(--muted)' }}>Email: support@linecart.example</p>
                <p style={{ color: 'var(--muted)' }}>Phone: +91 98765 43210</p>
                <p style={{ color: 'var(--muted)' }}>Address: 123 LineCart Street, Shop City</p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        <section className="features" aria-hidden="false">
          <div className="feature">Secure payments</div>
          <div className="feature">Free returns</div>
          <div className="feature">Customer support</div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-content">
              <div>© {new Date().getFullYear()} LineCart. All rights reserved.</div>
              <div className="social-links">
                <a href="https://instagram.com/linecart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="https://x.com/linecart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="https://facebook.com/linecart" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={async (prod, qty) => {
            await handleAddToCart(prod, qty);
            setModalProduct(null);
          }}
          adding={modalAdding}
        />
      )}

      {showLogoutModal && (
        <div className="product-modal-overlay" style={{ zIndex: 1100 }} role="dialog" aria-modal="true" onClick={() => setShowLogoutModal(false)}>
          <div className="product-modal" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0' }}>Sign Out</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--muted)', lineHeight: 1.5 }}>Are you sure you want to sign out of your account?</p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                  navigate('/');
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setInfo(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setInfo({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setBusy(true);
    try {
      await new Promise(res => setTimeout(res, 700));
      setInfo({ type: 'success', text: 'Message sent. We will get back to you soon.' });
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      console.error(err);
      setInfo({ type: 'error', text: 'Unable to send message. Try again later.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: 'white', padding: 18, borderRadius: 12, boxShadow: 'var(--shadow)' }}>
      <h3 style={{ marginTop: 0 }}>Send us a message</h3>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <input className="auth-input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <textarea className="auth-input" rows={5} placeholder="Your message" value={message} onChange={e => setMessage(e.target.value)} />
        {info && (
          <div style={{ color: info.type === 'error' ? '#9a1f1f' : '#064047', fontWeight: 700 }}>
            {info.text}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-cta" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setName(''); setEmail(''); setMessage(''); setInfo(null); }}>Reset</button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                <Route path="/*" element={<AppShell />} />
                <Route path="/admin/*" element={<AdminShell />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductView />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/place-order" element={<PlaceOrder />} />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
