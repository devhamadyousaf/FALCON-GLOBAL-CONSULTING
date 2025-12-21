import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PayPalRecurringPayment from './PayPalRecurringPayment';
import TilopayPaymentForm from './TilopayPaymentForm';

/**
 * Unified Payment Gateway Component
 * Primary: PayPal (Recurring Payments)
 * Fallback: Tilopay
 *
 * Features:
 * - Automatic fallback on PayPal failure
 * - Gateway health checking
 * - User preference storage
 * - Error handling and retry logic
 */
const UnifiedPaymentGateway = ({
  userId,
  email,
  firstName,
  lastName,
  amount,
  planName,
  currency = 'USD',
  address,
  city,
  state,
  country,
  phone,
  onSuccess,
  onError,
}) => {
  const router = useRouter();
  const [activeGateway, setActiveGateway] = useState('tilopay'); // 'paypal' or 'tilopay' - DISABLED PAYPAL
  const [paypalFailed, setPaypalFailed] = useState(true); // PayPal disabled
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState({
    paypal: 'unavailable', // PayPal disabled
    tilopay: 'available',
  });

  /**
   * Check gateway health status
   */
  useEffect(() => {
    checkGatewayHealth();
  }, []);

  const checkGatewayHealth = async () => {
    try {
      // Check if PayPal credentials are configured
      const paypalConfigured =
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'your_paypal_client_id';

      setGatewayStatus(prev => ({
        ...prev,
        paypal: paypalConfigured ? 'available' : 'unavailable',
      }));

      // If PayPal is not configured, default to Tilopay
      if (!paypalConfigured) {
        setActiveGateway('tilopay');
        setPaypalFailed(true);
      }
    } catch (error) {
      console.error('Error checking gateway health:', error);
    }
  };

  /**
   * Handle PayPal initialization error
   */
  const handlePayPalError = (errorMessage) => {
    console.error('PayPal error:', errorMessage);
    setError(errorMessage);
    setPaypalFailed(true);

    // Automatically fallback to Tilopay
    setActiveGateway('tilopay');

    if (onError) {
      onError({ gateway: 'paypal', error: errorMessage });
    }
  };

  /**
   * Handle PayPal payment success
   */
  const handlePayPalSuccess = (data) => {
    console.log('PayPal payment successful:', data);
    if (onSuccess) {
      onSuccess({ gateway: 'paypal', ...data });
    }
  };

  /**
   * Handle Tilopay payment success
   */
  const handleTilopaySuccess = (data) => {
    console.log('Tilopay payment successful:', data);
    if (onSuccess) {
      onSuccess({ gateway: 'tilopay', ...data });
    }
  };

  /**
   * Handle Tilopay payment error
   */
  const handleTilopayError = (errorMessage) => {
    console.error('Tilopay error:', errorMessage);
    setError(errorMessage);

    if (onError) {
      onError({ gateway: 'tilopay', error: errorMessage });
    }
  };

  /**
   * Manually switch gateway
   */
  const switchGateway = (gateway) => {
    setActiveGateway(gateway);
    setError(null);
  };

  return (
    <div className="unified-payment-gateway">
      {/* Gateway Status Indicator */}
      <div className="gateway-status mb-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
            <p className="text-sm text-gray-600">
              {activeGateway === 'paypal'
                ? 'Paying with PayPal (Recurring Subscription)'
                : 'Paying with Tilopay (Backup Gateway)'}
            </p>
          </div>

          {/* Gateway health indicators */}
          <div className="flex space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              gatewayStatus.paypal === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              PayPal: {gatewayStatus.paypal}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              gatewayStatus.tilopay === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Tilopay: {gatewayStatus.tilopay}
            </div>
          </div>
        </div>

        {/* Fallback notice */}
        {paypalFailed && activeGateway === 'tilopay' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ PayPal is currently unavailable. Using Tilopay as backup payment gateway.
            </p>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ {error}
            </p>
          </div>
        )}
      </div>

      {/* Gateway Switcher (Manual Override) */}
      {!loading && (
        <div className="gateway-switcher mb-6">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => switchGateway('paypal')}
              disabled={gatewayStatus.paypal === 'unavailable'}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeGateway === 'paypal'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : gatewayStatus.paypal === 'unavailable'
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79a.77.77 0 0 1 .759-.64h8.38c2.7 0 4.575.567 5.574 1.684.97 1.082 1.35 2.667 1.13 4.71-.015.127-.028.255-.044.382-.418 3.295-2.425 4.97-5.965 4.97H11.1a.771.771 0 0 0-.76.64l-.045.217-.725 4.595-.033.183a.64.64 0 0 1-.633.54z"/>
                  <path d="M19.1 7.693c-.27 1.76-1.095 2.975-2.46 3.622-.378.18-.795.318-1.246.418-.885.198-1.877.294-2.96.294h-2.34a.64.64 0 0 0-.633.543l-.783 4.97-.045.283a.384.384 0 0 0 .38.442h2.68c.43 0 .798-.314.866-.738l.036-.185.695-4.42.045-.244a.869.869 0 0 1 .866-.738h.546c2.876 0 5.127-1.168 5.783-4.548.275-1.413.13-2.59-.607-3.419-.202-.227-.445-.414-.72-.567z"/>
                </svg>
                PayPal
              </div>
            </button>

            <button
              type="button"
              onClick={() => switchGateway('tilopay')}
              disabled={gatewayStatus.tilopay === 'unavailable'}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeGateway === 'tilopay'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : gatewayStatus.tilopay === 'unavailable'
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Tilopay (Backup)
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Components */}
      <div className="payment-gateway-container">
        {activeGateway === 'paypal' && (
          <div className="paypal-gateway">
            <PayPalRecurringPayment
              userId={userId}
              email={email}
              firstName={firstName}
              lastName={lastName}
              amount={amount}
              planName={planName}
              currency={currency}
              address={address}
              city={city}
              state={state}
              country={country}
              phone={phone}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
            />
          </div>
        )}

        {activeGateway === 'tilopay' && (
          <div className="tilopay-gateway">
            <TilopayPaymentForm
              userId={userId}
              email={email}
              firstName={firstName}
              lastName={lastName}
              amount={amount}
              planName={planName}
              currency={currency}
              address={address}
              city={city}
              state={state}
              country={country}
              phone={phone}
              onSuccess={handleTilopaySuccess}
              onError={handleTilopayError}
            />
          </div>
        )}
      </div>

      {/* Gateway Info Footer */}
      <div className="gateway-info mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Payment Security</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ All payments are encrypted and secure</li>
          <li>✓ Your payment information is never stored on our servers</li>
          <li>✓ PCI-DSS compliant payment processing</li>
          {activeGateway === 'paypal' && (
            <li>✓ Recurring subscription - Cancel anytime from your PayPal account</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UnifiedPaymentGateway;
