import React, { useState, useEffect } from 'react';

export default function TilopayPayment({
  userId,
  email,
  firstName,
  lastName,
  amount,
  planName,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showCardInputs, setShowCardInputs] = useState(true);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [tilopayConfig, setTilopayConfig] = useState(null);

  // Initialize Tilopay payment
  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tilopay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          firstName,
          lastName,
          amount,
          planName,
          currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setTilopayConfig(data.tilopayConfig);

      // Initialize Tilopay SDK
      if (window.Tilopay) {
        const initialize = await window.Tilopay.Init(data.tilopayConfig);
        setPaymentMethods(initialize.methods || []);
        setSavedCards(initialize.cards || []);
      } else {
        throw new Error('Tilopay SDK not loaded');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.message);
      setLoading(false);
      if (onError) onError(err);
    }
  };

  // Load Tilopay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://app.tilopay.com/sdk/v2/sdk_tpay.min.js?v=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      console.log('Tilopay SDK loaded');
      initiatePayment();
    };
    script.onerror = () => {
      setError('Failed to load Tilopay SDK');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle payment method change
  const handleMethodChange = async (e) => {
    const method = e.target.value;
    setSelectedMethod(method);

    if (method) {
      const splitMethods = method.split(':');
      const isYappy = splitMethods[1] === '18';

      setShowCardInputs(!isYappy);
      setShowPhoneInput(isYappy);

      if (isYappy && window.Tilopay) {
        await window.Tilopay.updateOptions({
          phoneYappy: ''
        });
      }
    }
  };

  // Handle phone number change for Yappy
  const handlePhoneChange = async (e) => {
    const phone = e.target.value;
    if (window.Tilopay) {
      await window.Tilopay.updateOptions({
        phoneYappy: phone
      });
    }
  };

  // Process payment
  const processPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.Tilopay) {
        throw new Error('Tilopay SDK not initialized');
      }

      const payment = await window.Tilopay.startPayment();

      if (payment.success || payment.status === 'approved') {
        if (onSuccess) onSuccess(payment);
      } else {
        throw new Error(payment.message || 'Payment failed');
      }

    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tilopay-payment-container">
      <style jsx>{`
        .tilopay-payment-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }
        select, input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        select:focus, input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .payment-summary {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .payment-summary h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #111827;
        }
        .payment-summary p {
          margin: 4px 0;
          color: #6b7280;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
          margin-left: 8px;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .button-group {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Payment Summary */}
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <p><strong>Plan:</strong> {planName}</p>
        <p><strong>Amount:</strong> {currency} ${amount}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Payment Form */}
      {!loading && tilopayConfig && (
        <>
          <div className="form-group">
            <label>Payment Method</label>
            <select
              id="tlpy_payment_method"
              value={selectedMethod}
              onChange={handleMethodChange}
              disabled={loading}
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Card Inputs */}
          {showCardInputs && (
            <>
              {savedCards.length > 0 && (
                <div className="form-group">
                  <label>Saved Cards</label>
                  <select id="tlpy_saved_cards">
                    <option value="">Select card</option>
                    {savedCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  id="tlpy_cc_number"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              <div className="form-group">
                <label>Expiration Date (MM/YY)</label>
                <input
                  type="text"
                  id="tlpy_cc_expiration_date"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  id="tlpy_cvv"
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </>
          )}

          {/* Phone Input for Yappy */}
          {showPhoneInput && (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                id="tlpy_phone_number"
                placeholder="+507 1234-5678"
                onChange={handlePhoneChange}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={processPayment}
              disabled={loading || !selectedMethod}
            >
              {loading && <span className="loading-spinner"></span>}
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            {onCancel && (
              <button
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && !tilopayConfig && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Initializing payment...</p>
        </div>
      )}
    </div>
  );
}
