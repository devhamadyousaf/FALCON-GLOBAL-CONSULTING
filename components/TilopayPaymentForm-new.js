import { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

export default function TilopayPaymentForm({
  amount,
  currency = 'USD',
  planName,
  userDetails,
  onSuccess,
  onError
}) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [error, setError] = useState(null);

  // Load Tilopay SDK - same as test file
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="tilopay.com/sdk"]');
    if (existingScript || (typeof window !== 'undefined' && window.Tilopay)) {
      console.log('✅ Tilopay SDK already loaded');
      return;
    }

    console.log('📦 Loading Tilopay SDK...');
    const script = document.createElement('script');
    script.src = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';
    script.async = true;
    script.onload = () => console.log('✅ Tilopay SDK loaded');
    script.onerror = () => setError('Failed to load payment system');
    document.body.appendChild(script);
  }, []);

  // Initialize Tilopay when DOM is ready - EXACTLY like test file
  useEffect(() => {
    async function initializeTilopay() {
      try {
        console.log('🔄 DOM Ready, checking Tilopay SDK...');
        
        if (typeof window.Tilopay === 'undefined') {
          console.log('⏳ Tilopay SDK not ready, retrying...');
          setTimeout(initializeTilopay, 500);
          return;
        }

        console.log('🔄 Getting SDK token from Tilopay API...');

        // Get SDK token from backend
        const tokenResponse = await fetch('/api/tilopay/get-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            currency: currency,
            orderNumber: `order-${Date.now()}`
          })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.token) {
          throw new Error('Failed to get SDK token: ' + (tokenData.message || tokenData.error));
        }

        const TILOPAY_TOKEN = tokenData.token;
        console.log('✅ Got SDK token:', TILOPAY_TOKEN.substring(0, 20) + '...');

        console.log('🔄 Initializing Tilopay SDK...');

        // Initialize - EXACTLY like test file
        var initialize = await window.Tilopay.Init({
          token: TILOPAY_TOKEN,
          currency: currency,
          language: "en",
          amount: amount,
          billToFirstName: userDetails.firstName || "Customer",
          billToLastName: userDetails.lastName || "User",
          billToAddress: userDetails.address || "N/A",
          billToAddress2: "",
          billToCity: userDetails.city || "N/A",
          billToState: userDetails.state || "",
          billToZipPostCode: userDetails.zip || "00000",
          billToCountry: userDetails.country || "CR",
          billToTelephone: userDetails.phone || "",
          billToEmail: userDetails.email || "customer@example.com",
          orderNumber: `order-${Date.now()}`,
          capture: 1,
          redirect: window.location.origin + "/onboarding-new?payment=success",
          subscription: 0,
          hashVersion: "V2"
        });

        console.log('✅ Tilopay Init Response:', initialize);

        if (!initialize || !initialize.methods || initialize.methods.length === 0) {
          throw new Error('No payment methods available. Contact soporte@tilo.co');
        }

        // Set payment methods and cards
        setPaymentMethods(initialize.methods || []);
        setSavedCards(initialize.cards || []);

        console.log(`✅ Success! Found ${initialize.methods.length} payment method(s)`);

        // Payment method change handler - EXACTLY like test file
        document.getElementById("tlpy_payment_method").onchange = async function (e) {
          var method = document.getElementById("tlpy_payment_method").value;
          setSelectedPaymentMethod(method);
          
          if (method) {
            const splitMethods = method.split(':');
            const showInputs = (splitMethods[1] == '18');
            
            const tlpy_card_payment_div = document.getElementById("tlpy_card_payment_div");
            if (tlpy_card_payment_div && showInputs) {
              tlpy_card_payment_div.style.display = 'none';
            } else if (tlpy_card_payment_div) {
              tlpy_card_payment_div.style.display = 'block';
            }
            
            const tlpy_phone_number_div = document.getElementById("tlpy_phone_number_div");
            if (tlpy_phone_number_div && showInputs) {
              tlpy_phone_number_div.style.display = 'block';
              
              // Update phone yappy
              document.getElementById("tlpy_phone_number").onchange = async function () {
                var phone = document.getElementById("tlpy_phone_number").value;
                if (phone) {
                  await window.Tilopay.updateOptions({ phoneYappy: phone });
                }
              }
            } else if (tlpy_phone_number_div) {
              tlpy_phone_number_div.style.display = 'none';
            }
          }
        };

      } catch (error) {
        console.error('❌ Initialization Error:', error);
        setError(error.message || 'Failed to initialize payment system');
        if (onError) onError(error);
      }
    }

    // Start initialization after short delay
    const timer = setTimeout(initializeTilopay, 1000);
    return () => clearTimeout(timer);
  }, [amount, currency, userDetails]);

  const processPayment = async () => {
    if (!window.Tilopay) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('💳 Starting payment...');
      const payment = await window.Tilopay.startPayment();
      console.log('💰 Payment Response:', payment);

      if (payment.success || payment.status === 'approved') {
        console.log('✅ Payment Successful!');
        if (onSuccess) onSuccess(payment);
      } else {
        throw new Error(payment.message || 'Payment failed');
      }
    } catch (err) {
      console.error('❌ Payment Error:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessing(false);
      if (onError) onError(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100">
      <h3 className="text-xl font-bold mb-6" style={{ color: 'rgba(3, 50, 83, 1)' }}>
        Payment Details
      </h3>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tilopay Required Form Container */}
      <div className="payFormTilopay">
        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            Payment Method <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
          </label>
          <select
            id="tlpy_payment_method"
            name="tlpy_payment_method"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            disabled={processing}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        {/* Card Payment Inputs */}
        <div id="tlpy_card_payment_div">
          {savedCards.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                Saved Cards
              </label>
              <select
                id="tlpy_saved_cards"
                name="tlpy_saved_cards"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                disabled={processing}
              >
                <option value="">Select a saved card</option>
                {savedCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
              Card Number <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
            </label>
            <input
              type="text"
              id="tlpy_cc_number"
              name="tlpy_cc_number"
              placeholder="4111 1111 1111 1111"
              maxLength="19"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              disabled={processing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                Expiration (MM/YY) <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
              </label>
              <input
                type="text"
                id="tlpy_cc_expiration_date"
                name="tlpy_cc_expiration_date"
                placeholder="12/25"
                maxLength="5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                disabled={processing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                CVV <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
              </label>
              <input
                type="text"
                id="tlpy_cvv"
                name="tlpy_cvv"
                placeholder="123"
                maxLength="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                disabled={processing}
              />
            </div>
          </div>
        </div>

        {/* Phone Input for Yappy */}
        <div id="tlpy_phone_number_div" style={{ display: 'none' }}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
              Phone Number <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
            </label>
            <input
              type="text"
              id="tlpy_phone_number"
              name="tlpy_phone_number"
              placeholder="+507 1234-5678"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              disabled={processing}
            />
          </div>
        </div>
      </div>
      {/* End of payFormTilopay */}

      {/* Required container for 3DS process */}
      <div id="responseTilopay" className="mb-6"></div>

      {/* Security Badge */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start">
          <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">Secure Payment</p>
            <p className="text-xs text-green-700 mt-1">
              Your card information is encrypted and never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={processPayment}
        disabled={processing || !selectedPaymentMethod}
        className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: processing
            ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(107, 114, 128, 1))'
            : 'linear-gradient(135deg, rgba(187, 40, 44, 0.9), rgba(187, 40, 44, 1))',
          boxShadow: '0 4px 15px 0 rgba(187, 40, 44, 0.3)'
        }}
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay ${amount} {currency}</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        🔒 256-bit SSL encrypted payment powered by Tilopay
      </p>
    </div>
  );
}
