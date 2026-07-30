import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import { resolveAssetImage } from '../utils/assetResolver';

export default function Wishlist() {
  const { wishlistProducts, toggleWishlist } = useWishlist();
  const { user } = useUser();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [modalProduct, setModalProduct] = useState(null);
  const [addingIds, setAddingIds] = useState(new Set());

  const handleAddToCart = async (product, qty = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;
    if (addingIds.has(product.id)) return;

    setAddingIds(prev => new Set(prev).add(product.id));

    try {
      await addToCart(product.id, qty);
    } finally {
      setAddingIds(prev => {
        const copy = new Set(prev);
        copy.delete(product.id);
        return copy;
      });
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: 1100, marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2>My Wishlist</h2>
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
      </div>

      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: '1.1rem' }}>Your wishlist is empty.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 12 }}>Browse Products</button>
        </div>
      ) : (
        <div className="products-inner">
          {wishlistProducts.map(p => {
            const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
            return (
              <article className="product-card" key={p.id} aria-labelledby={`p-${p.id}-name`}>
                <div className="product-image-wrap">
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
                      onClick={() => handleAddToCart(p)}
                      disabled={addingIds.has(p.id)}
                    >
                      {addingIds.has(p.id) ? 'Adding…' : 'Add to Cart'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setModalProduct(p)}>Quick view</button>
                    <button
                      className={`btn btn-secondary active`}
                      onClick={() => toggleWishlist(p.id)}
                      title="Remove from wishlist"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="red" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={async (prod, qty) => {
            await handleAddToCart(prod, qty);
            setModalProduct(null);
          }}
          adding={addingIds.has(modalProduct.id)}
        />
      )}
    </div>
  );
}
