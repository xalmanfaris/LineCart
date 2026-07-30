import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { updateUser, changePassword, getOrders, cancelOrder, updateProfile } from '../api';

export default function Profile() {
  const { user, setUser, logout } = useUser();
  const navigate = useNavigate();

  const [showReset, setShowReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [updateNameBusy, setUpdateNameBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);


  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancelId, setOrderToCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');


  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const orderData = await getOrders();

      setOrders(orderData || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  async function handleReset(e) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill all fields.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowReset(false);

      setShowSuccessModal(true);

    } catch (err) {
      console.error('Password update failed', err);
      const text = err?.response?.data?.message || err?.message || 'Unable to update password. Try again.';
      setMessage({ type: 'error', text });
    } finally {
      setBusy(false);
    }
  }

  function openCancelModal(orderId) {
    setOrderToCancelId(orderId);
    setCancelReason('');
    setCancelModalVisible(true);
  }

  async function confirmCancelOrder() {
    if (!orderToCancelId) return;
    const orderId = orderToCancelId;

    setCancelBusy(true);
    setCancelMessage(null);

    try {
      await cancelOrder(orderId); 


      setOrders(prev => prev.map(order =>
        (order.id === orderId || order.Id === orderId) ? { ...order, status: 'cancelled', Status: 'cancelled' } : order
      ));

      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.Id === orderId)) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled', Status: 'cancelled' });
      }

      setCancelMessage({ type: 'success', text: 'Order cancelled successfully.' });
      setCancelModalVisible(false);
    } catch (err) {
      console.error('Order cancel failed', err);
      const text = err?.response?.data?.message || err?.message || 'Unable to cancel order. Try again.';
      setCancelMessage({ type: 'error', text });
    } finally {
      setCancelBusy(false);
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileMessage(null);
    if (!editNameValue.trim()) {
      setProfileMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    setUpdateNameBusy(true);
    try {
      await updateProfile(editNameValue.trim());
      setUser({ ...user, name: editNameValue.trim() });
      setIsEditingName(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });

     
      setTimeout(() => {
        setProfileMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Update profile failed', err);
      const text = err?.response?.data?.message || err?.message || 'Unable to update profile. Try again.';
      setProfileMessage({ type: 'error', text });
    } finally {
      setUpdateNameBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 20px', maxWidth: 800 }}>
      <div className="auth-right" style={{ marginTop: 20 }}>
        {profileMessage && (
          <div
            role="alert"
            style={{
              padding: 10,
              borderRadius: 10,
              background: profileMessage.type === 'error' ? '#fff1f0' : 'rgba(6,182,212,0.06)',
              color: profileMessage.type === 'error' ? '#9a1f1f' : '#064047',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {profileMessage.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {!isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, height: 'auto', fontSize: 13 }}
                  onClick={() => {
                    setEditNameValue(user.name);
                    setIsEditingName(true);
                    setProfileMessage(null);
                  }}
                  title="Edit Name"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="auth-input"
                  style={{ margin: 0, py: 8, px: 12, maxWidth: 250, flex: 1 }}
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  placeholder="Your Name"
                  autoFocus
                  disabled={updateNameBusy}
                />
                <button className="btn btn-primary" style={{ padding: '8px 16px' }} type="submit" disabled={updateNameBusy}>
                  {updateNameBusy ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn-ghost" style={{ padding: '8px 16px' }} type="button" disabled={updateNameBusy} onClick={() => {
                  setIsEditingName(false);
                  setProfileMessage(null);
                }}>
                  Cancel
                </button>
              </form>
            )}
            <div style={{ color: 'var(--muted)', marginTop: 6 }}>{user.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back</button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowLogoutModal(true)}
            >
              Sign out
            </button>
          </div>
        </div>

        <hr style={{ margin: '18px 0', border: 0, borderTop: '1px solid rgba(11,17,28,0.06)' }} />

        <div>
          <h3 style={{ marginBottom: 8 }}>Security</h3>
          <p style={{ marginTop: 0, color: 'var(--muted)' }}>Change your account password.</p>

          {!showReset ? (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => setShowReset(true)}>Reset password</button>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>Current password</span>
                <div className="password-row">
                  <input
                    className="auth-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(v => !v)}
                    aria-label={showPasswords ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>New password</span>
                <div className="password-row">
                  <input
                    className="auth-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Choose a new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(v => !v)}
                    aria-label={showPasswords ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>Confirm new password</span>
                <div className="password-row">
                  <input
                    className="auth-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(v => !v)}
                    aria-label={showPasswords ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {message && (
                <div
                  role="alert"
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: message.type === 'error' ? '#fff1f0' : 'rgba(6,182,212,0.06)',
                    color: message.type === 'error' ? '#9a1f1f' : '#064047',
                    fontWeight: 700,
                  }}
                >
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? 'Updating…' : 'Update password'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowReset(false); setMessage(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <hr style={{ margin: '18px 0', border: 0, borderTop: '1px solid rgba(11,17,28,0.06)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Orders</h3>
            <button className="btn btn-ghost" onClick={fetchOrders} disabled={loadingOrders} style={{ fontSize: 13, padding: '4px 12px' }}>
              {loadingOrders ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p style={{ marginTop: 0, color: 'var(--muted)' }}>View and manage your order history.</p>

          {cancelMessage && (
            <div
              role="alert"
              style={{
                padding: 10,
                borderRadius: 10,
                background: cancelMessage.type === 'error' ? '#fff1f0' : 'rgba(6,182,212,0.06)',
                color: cancelMessage.type === 'error' ? '#9a1f1f' : '#064047',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              {cancelMessage.text}
            </div>
          )}

          {loadingOrders ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
              Loading your orders...
            </div>
          ) : orders && orders.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {orders.map((order) => {

                const orderId = order.id || order.Id;
                const createdAt = order.created_at || order.createdAt || order.CreatedAt;
                const totalAmount = order.total || order.totalAmount || order.TotalAmount;
                const status = order.status || order.Status;
                const items = order.items || order.Items || [];

                return (
                  <div
                    key={orderId}
                    style={{ padding: 16, borderRadius: 12, background: 'white', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>Order #{orderId}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 13 }}>{formatDate(createdAt)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>₹{totalAmount}</div>
                        <span className={`badge status-${status?.toLowerCase() || 'placed'}`} style={{ fontSize: 12 }}>
                          {status?.toLowerCase() || 'placed'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                        {items.length} item{items.length !== 1 ? 's' : ''}: {items.map(item => item.name || item.Name || `Item #${item.productId || item.ProductId}`).join(', ')}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'placed' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-ghost"
                              onClick={(e) => { e.stopPropagation(); openCancelModal(orderId); }}
                              disabled={cancelBusy}
                              style={{ fontSize: 13, padding: '4px 12px', background: '#fee2e2', color: '#dc2626' }}
                            >
                              {cancelBusy ? 'Cancelling…' : 'Cancel Order'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'white', borderRadius: 12, boxShadow: 'var(--shadow)' }}>
              No orders yet. Start shopping to place your first order!
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="product-modal-overlay" style={{ zIndex: 1000 }} role="dialog" aria-modal="true">
          <div className="product-modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '48px', color: '#06b6d4', marginBottom: '16px' }}>✓</div>
            <h3 style={{ margin: '0 0 12px 0' }}>Password Updated</h3>
            <p style={{ color: 'var(--muted)', margin: '0 0 24px 0' }}>Your password has been changed successfully.</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowSuccessModal(false)}>
              Continue
            </button>
          </div>
        </div>
      )}


      {selectedOrder && (
        <div className="product-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
          <div className="product-modal" style={{ maxWidth: 600, width: '90%', padding: 24, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0' }}>Order #{selectedOrder.id || selectedOrder.Id}</h2>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                  {formatDate(selectedOrder.created_at || selectedOrder.createdAt || selectedOrder.CreatedAt)}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Status</div>
                <span className={`badge status-${(selectedOrder.status || selectedOrder.Status)?.toLowerCase() || 'placed'}`} style={{ fontSize: 14, display: 'inline-block' }}>
                  {(selectedOrder.status || selectedOrder.Status)?.toUpperCase() || 'PLACED'}
                </span>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Total Amount</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>₹{selectedOrder.total || selectedOrder.totalAmount || selectedOrder.TotalAmount}</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Shipping Information</h4>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{selectedOrder.shippingName || selectedOrder.ShippingName}</strong><br />
                {selectedOrder.shippingLine1 || selectedOrder.ShippingLine1}<br />
                {(selectedOrder.shippingLine2 || selectedOrder.ShippingLine2) && <>{selectedOrder.shippingLine2 || selectedOrder.ShippingLine2}<br /></>}
                {selectedOrder.shippingCity || selectedOrder.ShippingCity}, {selectedOrder.shippingState || selectedOrder.ShippingState} {selectedOrder.shippingPostalCode || selectedOrder.ShippingPostalCode}<br />
                {selectedOrder.shippingCountry || selectedOrder.ShippingCountry}<br />
                <span style={{ display: 'inline-block', marginTop: 4 }}>📞 {selectedOrder.phone || selectedOrder.Phone}</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Items</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {(selectedOrder.items || selectedOrder.Items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, background: '#f8fafc', padding: '10px 12px', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name || item.Name || `Item #${item.productId || item.ProductId}`}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>Qty: {item.quantity || item.Quantity} × ₹{item.price || item.Price}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>₹{(item.quantity || item.Quantity) * (item.price || item.Price)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {((selectedOrder.status || selectedOrder.Status)?.toLowerCase() === 'pending' || (selectedOrder.status || selectedOrder.Status)?.toLowerCase() === 'placed') ? (
                <button
                  className="btn"
                  style={{ background: '#fee2e2', color: '#dc2626' }}
                  onClick={() => openCancelModal(selectedOrder.id || selectedOrder.Id)}
                  disabled={cancelBusy}
                >
                  {cancelBusy ? 'Cancelling…' : 'Cancel Order'}
                </button>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>
                  Orders marked as {(selectedOrder.status || selectedOrder.Status)?.toLowerCase()} cannot be cancelled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {cancelModalVisible && (
        <div className="product-modal-overlay" style={{ zIndex: 1100 }} role="dialog" aria-modal="true" onClick={() => !cancelBusy && setCancelModalVisible(false)}>
          <div className="product-modal" style={{ maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0' }}>Cancel Order</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', lineHeight: 1.5 }}>Are you sure you want to cancel this order? This action cannot be undone.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Reason for Cancellation (Optional)</span>
                <textarea
                  className="auth-input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Tell us why you are cancelling..."
                  disabled={cancelBusy}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setCancelModalVisible(false)} disabled={cancelBusy}>Keep Order</button>
              <button
                type="button"
                className="btn"
                style={{ background: '#fee2e2', color: '#dc2626' }}
                onClick={confirmCancelOrder}
                disabled={cancelBusy}
              >
                {cancelBusy ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
