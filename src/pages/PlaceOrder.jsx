import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { createOrder, confirmOrder } from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';
import '../styles/PlaceOrder.css';


const stripePromise = loadStripe('pk_test_51T4Diy9QLFTsnwqYR7DFVAAk2WMaPRsI2mMauYo7SL4wV1XIfW0gEeYkkrXPvkTaiJEcn6fzc6MVVnCKVY9915nT002ZDvvSm6');

const PlaceOrder = () => {
    const { user } = useUser();
    const { clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, totalAmount } = location.state || { cartItems: [], totalAmount: 0 };

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [orderId, setOrderId] = useState(null);
    const [step, setStep] = useState(1);

    const [address, setAddress] = useState(() => ({
        name: user?.name || '',
        street: (user && Array.isArray(user.addresses) && user.addresses[0] && user.addresses[0].street) || '',
        city: (user && Array.isArray(user.addresses) && user.addresses[0] && user.addresses[0].city) || '',
        state: (user && Array.isArray(user.addresses) && user.addresses[0] && user.addresses[0].state) || '',
        zipCode: (user && Array.isArray(user.addresses) && user.addresses[0] && user.addresses[0].zipCode) || '',
        country: (user && Array.isArray(user.addresses) && user.addresses[0] && user.addresses[0].country) || '',
        phone: ''
    }));

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProceedToPayment = async () => {
        try {
            if (!address.name || !address.phone || !address.street || !address.city || !address.zipCode || !address.country) {
                alert('Please fill in all shipping details');
                return;
            }

            const response = await createOrder(address);
            console.log('Order created for payment:', response);
            if (response.clientSecret && response.orderId) {
                setClientSecret(response.clientSecret);
                setOrderId(response.orderId);
                setStep(2); 
            } else {
                alert('Failed to initialize payment. Try again.');
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Failed to initialize order. Please try again.');
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            await confirmOrder(orderId, paymentIntentId);
            await clearCart();
            setShowConfirmation(true);
            setTimeout(() => {
                setShowConfirmation(false);
                navigate('/shop');
            }, 3000);
        } catch (error) {
            console.error('Payment confirmation error', error);
            alert('Payment succeeded but confirmation failed. Please contact support.');
        }
    };

    return (
        <div className="container" style={{ padding: '28px 20px', maxWidth: 1100 }}>
            {showConfirmation ? (
                <div className="order-confirmation" style={{ background: 'white', padding: 36, borderRadius: 12, boxShadow: 'var(--shadow)' }}>
                    <div className="tick-mark">✓</div>
                    <h2>Order Placed Successfully!</h2>
                    <p style={{ color: 'var(--muted)' }}>Thanks — the order was placed and saved to the user's account.</p>
                </div>
            ) : (
                <div className="cart-page">
                    <div>
                        <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
                            <h2 style={{ margin: 0 }}>Place your order</h2>
                            <p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Review items, add a shipping address and place the order.</p>
                        </div>

                        <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
                            <h3 style={{ marginTop: 0 }}>Customer</h3>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(180deg,#f6fbff,#faf8f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06121a" strokeWidth="1.4"><circle cx="12" cy="8" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800 }}>{user?.name}</div>
                                    <div style={{ color: 'var(--muted)' }}>{user?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
                            <h3 style={{ marginTop: 0 }}>Shipping address</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ gridColumn: '1 / -1' }} className="auth-field">
                                    <label className="field-label">Full Name</label>
                                    <input className="auth-input" name="name" value={address.name} onChange={handleAddressChange} placeholder="Receiver Full Name" />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">Street</label>
                                    <input className="auth-input" name="street" value={address.street} onChange={handleAddressChange} />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">City</label>
                                    <input className="auth-input" name="city" value={address.city} onChange={handleAddressChange} />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">State</label>
                                    <input className="auth-input" name="state" value={address.state} onChange={handleAddressChange} />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">ZIP</label>
                                    <input className="auth-input" name="zipCode" value={address.zipCode} onChange={handleAddressChange} />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">Country</label>
                                    <input className="auth-input" name="country" value={address.country} onChange={handleAddressChange} />
                                </div>
                                <div className="auth-field">
                                    <label className="field-label">Phone</label>
                                    <input className="auth-input" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Contact Number" />
                                </div>
                            </div>
                        </div>

                        {step === 1 ? (
                            <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow)' }}>
                                <h3 style={{ marginTop: 0 }}>Order items</h3>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {cartItems.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderRadius: 8, background: '#fafafa' }}>
                                            <div>
                                                <div style={{ fontWeight: 800 }}>{item.name}</div>
                                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{item.quantity} × ₹{item.price}</div>
                                            </div>
                                            <div style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: 'var(--shadow)', marginTop: 16 }}>
                                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Payment Information</h3>
                                {clientSecret && (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <PaymentForm onPaymentSuccess={handlePaymentSuccess} clientSecret={clientSecret} />
                                    </Elements>
                                )}
                            </div>
                        )}
                    </div>

                    <aside className="cart-summary">
                        <div className="summary-card">
                            <h3>Summary</h3>
                            <div className="summary-row"><span>Items</span><span>{cartItems.length}</span></div>
                            <div className="summary-row total"><strong>Total</strong><strong>₹{totalAmount}</strong></div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                {step === 1 && (
                                    <button className="btn-cta" onClick={handleProceedToPayment} disabled={!address.name || !address.street || !address.city || !address.zipCode || !address.country || !address.phone}>
                                        Proceed to Payment
                                    </button>
                                )}
                                <button className="btn btn-ghost" onClick={() => navigate('/cart')}>Edit cart</button>
                            </div>

                            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
                                {step === 1 ? 'Please review your shipping details carefully.' : 'Payment is secured by Stripe.'}
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default PlaceOrder;
