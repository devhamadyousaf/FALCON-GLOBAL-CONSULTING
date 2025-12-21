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
  const [tilopayLoaded, setTilopayLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [initStatus, setInitStatus] = useState('loading'); // 'loading', 'ready', 'error'

  // Load Tilopay SDK
  useEffect(() => {
    // Check if SDK is already loaded
    if (typeof window !== 'undefined' && window.Tilopay) {
      console.log('✅ Tilopay SDK already loaded');
      setTilopayLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="tilopay.com/sdk"]');
    if (existingScript) {
      existingScript.onload = () => {
        console.log('✅ Tilopay SDK loaded from existing script');
        setTilopayLoaded(true);
      };
      return;
    }

    // Load SDK
    console.log('📦 Loading Tilopay SDK...');
    const script = document.createElement('script');
    script.src = `https://app.tilopay.com/sdk/v2/sdk_tpay.min.js?v=${Date.now()}`;
    script.async = true;

    script.onload = () => {
      console.log('✅ Tilopay SDK loaded successfully');
      setTilopayLoaded(true);
    };

    script.onerror = (err) => {
      console.error('❌ Failed to load Tilopay SDK:', err);
      setError('Payment system failed to load. Please refresh the page.');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid re-loading
    };
  }, []);

  // Initialize Tilopay SDK when loaded - EXACTLY like test file
  useEffect(() => {
    if (tilopayLoaded && initStatus === 'loading' && amount) {
      // DOM is ready by the time this effect runs, init immediately
      initializeTilopay();
    }
  }, [tilopayLoaded, amount]);

  const initializeTilopay = async () => {
    try {
      setInitStatus('loading');
      setError(null);
      console.log('🔄 Getting SDK token from Tilopay API...');

      // Get SDK token from our backend
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

      // Safely extract user details with fallbacks
      const firstName = userDetails?.firstName || userDetails?.fullName?.split(' ')[0] || 'Customer';
      const lastName = userDetails?.lastName || userDetails?.fullName?.split(' ').slice(1).join(' ') || 'User';
      const address = userDetails?.address || userDetails?.street || 'N/A';
      const city = userDetails?.city || 'N/A';
      const state = userDetails?.state || '';
      const zip = userDetails?.zip || '00000';
      const country = userDetails?.country || 'CR';
      const phone = userDetails?.phone || userDetails?.telephone || '';
      const email = userDetails?.email || 'customer@example.com';

      // Initialize Tilopay SDK - EXACTLY like test-tilopay-minimal.html
      const initialize = await window.Tilopay.Init({
        token: TILOPAY_TOKEN,
        currency: currency,
        language: "en",
        amount: amount,
        billToFirstName: firstName,
        billToLastName: lastName,
        billToAddress: address,
        billToAddress2: "",
        billToCity: city,
        billToState: state,
        billToZipPostCode: zip,
        billToCountry: country,
        billToTelephone: phone,
        billToEmail: email,
        orderNumber: `order-${Date.now()}`,
        capture: 1,
        redirect: window.location.origin + "/onboarding-new?payment=success",
        subscription: 0,
        hashVersion: "V2"
      });

      console.log('✅ Tilopay initialized:', initialize);

      if (!initialize) {
        throw new Error('Tilopay initialization returned null');
      }

      if (!initialize.methods || initialize.methods.length === 0) {
        throw new Error(
          'No payment methods available. Please contact support at soporte@tilo.co'
        );
      }

      // Load payment methods and cards - EXACTLY like test file
      await loadPaymentMethodsOptions(initialize.methods);
      await loadCardOptions(initialize.cards || []);

      setPaymentMethods(initialize.methods || []);
      setSavedCards(initialize.cards || []);
      setInitStatus('ready');

      console.log(`✅ Success! Found ${initialize.methods.length} payment method(s)`);

      // Set up payment method change handler - EXACTLY like test file
      setupPaymentMethodHandler();

    } catch (err) {
      console.error('❌ Tilopay initialization error:', err);
      setError(err.message || 'Failed to initialize payment system');
      setInitStatus('error');
      if (onError) {
        onError(err);
      }
    }
  };

  // Populate payment methods dropdown - EXACTLY like test file
  const loadPaymentMethodsOptions = async (methods) => {
    console.log('📋 Loading payment methods:', methods);
    const select = document.getElementById("tlpy_payment_method");
    if (!select) return;

    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }

    methods.forEach(function (method) {
      const option = document.createElement("option");
      option.value = method.id;
      option.text = method.name;
      select.appendChild(option);
      console.log('  ➕ Added method:', method.name, '(' + method.id + ')');
    });
  };

  // Populate saved cards dropdown - EXACTLY like test file
  const loadCardOptions = async (cards) => {
    console.log('💳 Loading saved cards:', cards);
    const select = document.getElementById("tlpy_saved_cards");
    if (!select) return;

    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }

    if (!cards || cards.length === 0) {
      console.log('  ℹ️ No saved cards');
      return;
    }

    cards.forEach(function (card) {
      const option = document.createElement("option");
      option.value = card.id;
      option.text = card.name;
      select.appendChild(option);
      console.log('  ➕ Added card:', card.name);
    });
  };

  const setupPaymentMethodHandler = () => {
    // Payment method change handler - EXACTLY like test-tilopay-minimal.html
    const methodSelect = document.getElementById("tlpy_payment_method");
    if (!methodSelect) return;

    methodSelect.onchange = async function (e) {
      const method = document.getElementById("tlpy_payment_method").value;
      setSelectedPaymentMethod(method);

      if (method) {
        const splitMethods = method.split(':');
        const showInputs = (splitMethods[1] == '18'); // Yappy

        const tlpy_card_payment_div = document.getElementById("tlpy_card_payment_div");
        if (tlpy_card_payment_div && showInputs) {
          tlpy_card_payment_div.style.display = 'none';
        } else if (tlpy_card_payment_div) {
          tlpy_card_payment_div.style.display = 'block';
        }

        const tlpy_phone_number_div = document.getElementById("tlpy_phone_number_div");
        if (tlpy_phone_number_div && showInputs) {
          tlpy_phone_number_div.style.display = 'block';
          // Update phone yappy to process the payment
          await setYappyPhone();
        } else if (tlpy_phone_number_div) {
          tlpy_phone_number_div.style.display = 'none';
        }
      }
    };
  };

  // Function to update the yappy phone number - EXACTLY like test file
  const setYappyPhone = async () => {
    const phoneInput = document.getElementById("tlpy_phone_number");
    if (!phoneInput) return;

    phoneInput.onchange = async function () {
      const phone = document.getElementById("tlpy_phone_number").value;
      if (phone && window.Tilopay) {
        await window.Tilopay.updateOptions({
          phoneYappy: phone,
        });
      }
    };
  };

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
        if (onSuccess) {
          onSuccess(payment);
        }
      } else {
        throw new Error(payment.message || 'Payment failed');
      }
    } catch (err) {
      console.error('❌ Payment Error:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessing(false);
      if (onError) {
        onError(err);
      }
    }
  };

  // Show loading status while initializing
  if (initStatus === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: 'rgba(187, 40, 44, 1)' }}
        ></div>
        <p className="text-gray-600">Initializing payment system...</p>
      </div>
    );
  }

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
            value={selectedPaymentMethod}
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
