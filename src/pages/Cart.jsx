import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { resolveAssetImage } from '../utils/assetResolver';

export default function Cart() {
  const { user } = useUser();
  const { cartItems, cartTotal, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const total = cartTotal;

  async function handleChangeQty(itemId, newQty) {
    if (newQty < 1) {
      handleRemove(itemId);
      return;
    }

    setSaving(true);
    await updateCartItem(itemId, newQty);
    setSaving(false);
  }

  async function handleRemove(itemId) {
    setSaving(true);
    await removeFromCart(itemId);
    setSaving(false);
  }

  async function handleClearCart() {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    setSaving(true);
    await clearCart();
    setSaving(false);
  }

  async function handlePurchase() {
    if (!cartItems.length) return;
    if (saving) return;

    navigate('/place-order', {
      state: {
        cartItems: cartItems.map(item => ({
          id: item.productId,
          name: item.product?.name || 'Product',
          price: item.product?.price || 0,
          quantity: item.quantity
        })),
        totalAmount: total
      }
    });
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 1100, marginTop: 18, textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ fontSize: '18px', color: '#6b7280', marginTop: '10px' }}>Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '28px 20px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Your Shopping Cart</h2>
        <div style={{ display: 'flex', gap: 8 }}>
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
          {cartItems.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={handleClearCart}
              disabled={saving}
              title="Clear cart"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ padding: 30, borderRadius: 12, background: 'white', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '1.1rem' }}>Your cart is empty.</p>
          <button className="btn btn-cta" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Explore Products</button>
        </div>
      ) : (
        <div className="cart-page">
          <div className="cart-list">
            {cartItems.map(item => {
              const p = item.product || {};
              const imgSrc = resolveAssetImage(p.images && p.images[0] ? p.images[0] : null, p.category, p.name);
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = resolveAssetImage(null, p.category, p.name);
                      }}
                    />
                  </div>

                  <div className="cart-item-body">
                    <h4 className="cart-item-title">{p.name}</h4>
                    <div className="cart-item-desc">{p.description}</div>
                    <div className="cart-item-meta">
                      <span className="cart-item-price">₹{p.price}</span>
                      <span className="cart-item-count">{p.count} gm</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-controls">
                        <p>Quantity:</p>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleChangeQty(item.id, item.quantity - 1)}
                          disabled={saving}
                        >
                          −
                        </button>
                        <div className="qty">{item.quantity}</div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleChangeQty(item.id, item.quantity + 1)}
                          disabled={saving}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn btn-ghost"
                        onClick={() => handleRemove(item.id)}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <div className="cart-item-subtotal">₹{(p.price || 0) * item.quantity}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items Count</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-row total">
                <strong>Total Amount</strong>
                <strong>₹{total}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                <button className="btn btn-cta" onClick={handlePurchase} disabled={saving}>
                  {saving ? 'Processing…' : 'Proceed to Checkout'}
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>Continue Shopping</button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
