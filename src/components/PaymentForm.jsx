import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function PaymentForm({ onPaymentSuccess, clientSecret }) {
    const stripe = useStripe();
    const elements = useElements();

    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
          
            return;
        }

        setProcessing(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
               
            },
            redirect: 'if_required'
        });

        if (stripeError) {
            setError(stripeError.message);
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onPaymentSuccess(paymentIntent.id);
        } else {
            setError('An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <PaymentElement />
            {error && (
                <div style={{ color: '#9a1f1f', background: '#fff1f0', padding: '10px', borderRadius: '8px', marginTop: '16px', fontWeight: 600 }}>
                    {error}
                </div>
            )}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="btn-cta"
                style={{ width: '100%', marginTop: '24px' }}
            >
                {processing ? 'Processing...' : 'Pay now'}
            </button>
        </form>
    );
}
