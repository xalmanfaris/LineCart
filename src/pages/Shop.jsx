import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import { useUser } from '../contexts/UserContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { getProducts } from '../api';
import { resolveAssetImage } from '../utils/assetResolver';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('[Shop] Fetching products...');
        const data = await getProducts();
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
      } catch (err) {
        console.error('[Shop] Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const { user } = useUser();
  const { cartCount, addToCart, removeFromCart, isInCart, getCartItemId } = useCart();

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [products]);

  const [selectedCats, setSelectedCats] = useState(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [qtyMin, setQtyMin] = useState('');
  const [query, setQuery] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const location = useLocation();

  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist, wishlist } = useWishlist();

  function toggleCat(cat) {
    setSelectedCats(prev => {
      const copy = new Set(prev);
      if (copy.has(cat)) copy.delete(cat);
      else copy.add(cat);
      return copy;
    });
  }

  const filtered = useMemo(() => {
    let res = products.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      res = res.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (selectedCats.size > 0) {
      res = res.filter(p => selectedCats.has(p.category));
    }
    const min = Number(priceMin || 0);
    const max = Number(priceMax || 0);
    if (priceMin !== '' && !isNaN(min)) res = res.filter(p => Number(p.price) >= min);
    if (priceMax !== '' && !isNaN(max) && max > 0) res = res.filter(p => Number(p.price) <= max);
    const qmin = Number(qtyMin || 0);
    if (qtyMin !== '' && !isNaN(qmin) && qmin > 0) res = res.filter(p => Number(p.count) >= qmin);
    return res;
  }, [products, selectedCats, priceMin, priceMax, qtyMin, query]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCats(new Set([cat]));
    }
    const pmin = params.get('priceMin');
    const pmax = params.get('priceMax');
    const qmin = params.get('qtyMin');
    const q = params.get('q');
    if (pmin !== null) setPriceMin(pmin);
    if (pmax !== null) setPriceMax(pmax);
    if (qmin !== null) setQtyMin(qmin);
    if (q !== null) setQuery(q);
  }, [location.search]);

  const handleCartAction = async (product) => {
    if (isInCart(product.id)) {
      setAdding(true);
      const itemId = getCartItemId(product.id);
      await removeFromCart(itemId);
      setAdding(false);
    } else {
      setAdding(true);
      await addToCart(product.id);
      setAdding(false);
    }
  };

  const onModalAddToCart = async (product, qty) => {
    setAdding(true);
    await addToCart(product.id, qty);
    setAdding(false);
    setModalProduct(null);
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 1100, marginTop: 18, textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ fontSize: '18px', color: '#6b7280', marginTop: '10px' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1100, marginTop: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18 }}>
        <aside style={{ position: 'sticky', top: 18 }}>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Filters</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6 }}><strong>Search</strong></label>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." className="auth-input" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label><strong>Categories</strong></label>
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {categories.map(cat => (
                  <label key={cat} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedCats.has(cat)} onChange={() => toggleCat(cat)} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label><strong>Price Range (₹)</strong></label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input className="auth-input" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                <input className="auth-input" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label><strong>Min Weight / Qty</strong></label>
              <input className="auth-input" placeholder="e.g. 100" value={qtyMin} onChange={e => setQtyMin(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setSelectedCats(new Set()); setPriceMin(''); setPriceMax(''); setQtyMin(''); setQuery(''); }}>Reset</button>
            </div>
          </div>
        </aside>

        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>All Products</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#6b7280' }}>{filtered.length} products found</div>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                style={{ padding: '8px 12px' }}
                title="Go to home"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </button>
              {user && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/cart')}
                    style={{ position: 'relative', padding: '8px 12px' }}
                    title="Go to cart"
                  >
                    <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="20" r="1.5" /><circle cx="20" cy="20" r="1.5" />
                      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L23 6H6" />
                    </svg>
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#0ea5e9',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/wishlist')}
                    style={{ position: 'relative', padding: '8px 12px' }}
                    title="Go to wishlist"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {wishlist.length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#0ea5e9',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="products-inner">
            {filtered.map(p => {
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                  <div className="product-image-wrap">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="product-image"
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
                      <span className="product-count">{p.count} gm / pcs</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-add"
                        onClick={() => handleCartAction(p)}
                        disabled={adding}
                      >
                        {adding ? 'Processing…' : isInCart(p.id) ? 'Remove Cart' : 'Add to Cart'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate(`/product/${p.id}`)}>Details</button>
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
        </main>
      </div>

      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onAddToCart={onModalAddToCart} adding={adding} />
      )}
    </div>
  );
}
