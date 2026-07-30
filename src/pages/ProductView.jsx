import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { getProductById } from '../api';
import { resolveAssetImage } from '../utils/assetResolver';

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isInWishlist, toggleWishlist, wishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { cartCount, addToCart, removeFromCart, isInCart, getCartItemId } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const productData = await getProductById(id);
        if (productData) {
          setProduct(productData);
        } else {
          navigate('/shop');
        }
      } catch (err) {
        console.error('[ProductView] Failed to fetch product:', err);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  const handleCartAction = async () => {
    if (!product) return;
    if (adding) return;

    setAdding(true);
    if (isInCart(product.id)) {
      const itemId = getCartItemId(product.id);
      if (itemId) await removeFromCart(itemId);
    } else {
      await addToCart(product.id, qty);
    }
    setAdding(false);
  };

  function inc() {
    setQty(q => Math.min(99, q + 1));
  }

  function dec() {
    setQty(q => Math.max(1, q - 1));
  }

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 1100, marginTop: 18, textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ fontSize: '18px', color: '#6b7280', marginTop: '10px' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ maxWidth: 1100, marginTop: 18, textAlign: 'center' }}>
        <p>Product not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  const rawImages = product.images && product.images.length > 0 ? product.images : [null];
  const images = rawImages.map(img => resolveAssetImage(img, product.category, product.name));
  const mainImage = images[selectedImage] || images[0];

  return (
    <div className="container" style={{ maxWidth: 1100, marginTop: 18, position: 'relative' }}>
      {user && (
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 12 }}>
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
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        {/* Product Images */}
        <div>
          <div style={{ position: 'sticky', top: 18 }}>
            <div style={{ marginBottom: 16 }}>
              <img
                src={mainImage}
                alt={product.name}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow)'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = resolveAssetImage(null, product.category, product.name);
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      border: selectedImage === index ? '2px solid #0ea5e9' : '2px solid transparent',
                      borderRadius: 8,
                      padding: 4,
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 6
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = resolveAssetImage(null, product.category, product.name);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{product.name}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>₹{product.price}</span>
            <span style={{ color: 'var(--muted)', fontSize: '1rem' }}>Weight/Count: {product.count} gm</span>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>
              {product.category}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: 4 }}>
              <button className="btn btn-ghost" onClick={dec} style={{ padding: '6px 12px' }}>-</button>
              <span style={{ padding: '0 16px', fontWeight: 'bold' }}>{qty}</span>
              <button className="btn btn-ghost" onClick={inc} style={{ padding: '6px 12px' }}>+</button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCartAction}
              disabled={adding}
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              {adding ? 'Processing...' : isInCart(product.id) ? 'Remove from Cart' : `Add ${qty} to Cart`}
            </button>

            {user && (
              <button
                className={`btn btn-secondary ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                style={{ padding: '12px', borderRadius: 8 }}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'red' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>

          <button className="btn btn-ghost" onClick={() => navigate('/shop')}>← Back to Shop</button>
        </div>
      </div>
    </div>
  );
}
