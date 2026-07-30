import React, { useEffect, useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useUser } from '../contexts/UserContext';
import { resolveAssetImage } from '../utils/assetResolver';

export default function ProductModal({ product, onClose, onAddToCart, adding }) {
  const [qty, setQty] = useState(1);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useUser();

  const isInCart = user && Array.isArray(user.cart) && user.cart.some(item => String(item.productId) === String(product?.id));

  useEffect(() => {
    setQty(1);
  }, [product]);

  if (!product) return null;

  function inc() {
    setQty(q => Math.min(99, q + 1));
  }
  function dec() {
    setQty(q => Math.max(1, q - 1));
  }

  async function handleAdd() {
    if (onAddToCart) {
      await onAddToCart(product, qty);
    }
  }

  const mainImage = resolveAssetImage(product.images && product.images[0] ? product.images[0] : null, product.category, product.name);

  return (
    <div className="product-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <div className="product-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close product details">✕</button>

        <div className="modal-grid">
          <div className="modal-image-wrap">
            <img
              src={mainImage}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = resolveAssetImage(null, product.category, product.name);
              }}
            />
          </div>

          <div className="modal-body">
            <h2 id="pm-title" className="modal-title">{product.name}</h2>
            <p className="modal-desc">{product.description}</p>

            <div className="modal-meta">
              <div className="modal-price">₹{product.price}</div>
              <div className="modal-count">{product.count} gm / pcs</div>
            </div>

            <div className="modal-actions">
              <div className="qty-controls modal-qty">
                <button className="btn btn-secondary" onClick={dec} aria-label="Decrease quantity">−</button>
                <div className="qty">{qty}</div>
                <button className="btn btn-secondary" onClick={inc} aria-label="Increase quantity">+</button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-cta"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? 'Adding…' : isInCart ? 'Remove from Cart' : `Add ${qty} to cart`}
                </button>

                <button className="btn btn-ghost" onClick={onClose}>Close</button>
              </div>

              <button
                className={`btn btn-secondary ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            <div className="modal-extra">
              <p style={{ color: 'var(--muted)', marginTop: 12 }}>
                Category: <strong>{product.category}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}