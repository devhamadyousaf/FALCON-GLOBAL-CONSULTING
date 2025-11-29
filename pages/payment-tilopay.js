import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

export default function PaymentTilopay() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { onboardingData, markStepCompleted, setCurrentStep } = useOnboarding();
  const { plan: planParam } = router.query;

  const [loading, setLoading] = useState(false);
  const [tilopayLoaded, setTilopayLoaded] = useState(false);
  const [initResponse, setInitResponse] = useState(null);
  const [formRendered, setFormRendered] = useState(false);

  const plans = {
    silver: { name: 'Silver', price: 299, amount: '$299' },
    gold: { name: 'Gold', price: 699, amount: '$699' },
    diamond: { name: 'Diamond', price: 1599, amount: '$1,599' }
  };

  const selectedPlan = plans[planParam?.toLowerCase()];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load Tilopay SDK and initialize - EXACTLY like test-tilopay-minimal.html
  useEffect(() => {
    if (!selectedPlan || tilopayLoaded) return;

    // Load SDK
    const script = document.createElement('script');
    script.src = `https://app.tilopay.com/sdk/v2/sdk_tpay.min.js`;
    script.async = true;
    script.onload = () => {
      console.log('✅ Tilopay SDK loaded');
      setTilopayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Tilopay SDK');
      alert('Payment system failed to load. Please refresh.');
    };
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src*="tilopay.com/sdk"]');
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, [selectedPlan, tilopayLoaded]);

  // Mark form as rendered after first render
  useEffect(() => {
    setFormRendered(true);
  }, []);

  // Initialize Tilopay when SDK loads - EXACTLY like test file (DOMContentLoaded)
  useEffect(() => {
    if (!tilopayLoaded || !selectedPlan || initResponse || !formRendered) return;

    // Ensure DOM is fully ready - check for form elements
    const checkDOMReady = () => {
      const methodSelect = document.getElementById("tlpy_payment_method");
      const cardInput = document.getElementById("tlpy_cc_number");
      return methodSelect && cardInput;
    };

    const initializeTilopay = async () => {
      try {
        // Wait for DOM to be ready - EXACTLY like DOMContentLoaded
        if (!checkDOMReady()) {
          console.log('⏳ DOM not ready, waiting...');
          setTimeout(initializeTilopay, 100);
          return;
        }

        console.log('✅ DOM ready, starting initialization');
        console.log('🔄 Getting SDK token from Tilopay API...');

        // Get SDK token from backend
        const tokenResponse = await fetch('/api/tilopay/get-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedPlan.price,
            currency: 'USD',
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

        // Get user details
        const personalDetails = onboardingData?.personalDetails || {};
        const fullName = personalDetails.fullName || user?.user_metadata?.full_name || 'Customer User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Initialize Tilopay SDK - EXACTLY like test-tilopay-minimal.html
        // Using CR (Costa Rica) billing address like test file for compatibility

        // Prepare returnData with user/payment info for callback
        const returnData = {
          userId: user?.id,
          planName: selectedPlan.name.toLowerCase(),
          amount: selectedPlan.price
        };
        // Browser-compatible base64 encoding
        const returnDataEncoded = btoa(JSON.stringify(returnData));

        const initialize = await window.Tilopay.Init({
          token: TILOPAY_TOKEN,
          currency: "USD",
          language: "en",
          amount: selectedPlan.price,
          billToFirstName: firstName,
          billToLastName: lastName,
          billToAddress: personalDetails.address?.street || "San Jose",
          billToAddress2: "",
          billToCity: personalDetails.address?.city || "San Jose",
          billToState: personalDetails.address?.state || "SJ",
          billToZipPostCode: personalDetails.address?.zip || "10101",
          billToCountry: "CR", // HARDCODED to CR like test file - Tilopay requirement
          billToTelephone: personalDetails.telephone || "+50688888888",
          billToEmail: personalDetails.email || user?.email || "customer@example.com",
          orderNumber: "sdk-" + Date.now(),
          capture: 1,
          redirect: window.location.origin + "/onboarding-new?payment=success",
          returnData: returnDataEncoded, // Pass user data for callback
          subscription: 0,
          hashVersion: "V2"
        });

        console.log('✅ Tilopay Init Response:', initialize);
        setInitResponse(initialize);

        if (!initialize) {
          throw new Error('Initialize returned null or undefined');
        }

        if (!initialize.methods || initialize.methods.length === 0) {
          throw new Error('No payment methods available. Please contact support.');
        }

        // Load payment methods and cards - EXACTLY like test file
        await loadPaymentMethodsOptions(initialize.methods);
        await loadCardOptions(initialize.cards || []);

        console.log(`✅ Success! Found ${initialize.methods.length} payment method(s)`);

        // Setup payment method change handler - EXACTLY like test file
        setupPaymentMethodHandler();

      } catch (error) {
        console.error('❌ Initialization Error:', error);
        alert('Failed to initialize payment: ' + error.message);
      }
    };

    // Start initialization - will wait for DOM if needed
    initializeTilopay();
  }, [tilopayLoaded, selectedPlan, initResponse, onboardingData, user, formRendered]);

  // Load payment methods - EXACTLY like test file
  const loadPaymentMethodsOptions = async (methods) => {
    console.log('📋 Loading payment methods:', methods);
    const select = document.getElementById("tlpy_payment_method");
    if (!select) return;

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

  // Load saved cards - EXACTLY like test file
  const loadCardOptions = async (cards) => {
    console.log('💳 Loading saved cards:', cards);
    const select = document.getElementById("tlpy_saved_cards");
    if (!select) return;

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

  // Setup payment method handler - EXACTLY like test file
  const setupPaymentMethodHandler = () => {
    const methodSelect = document.getElementById("tlpy_payment_method");
    if (!methodSelect) return;

    methodSelect.onchange = async function (e) {
      const method = document.getElementById("tlpy_payment_method").value;
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
          await setYappyPhone();
        } else if (tlpy_phone_number_div) {
          tlpy_phone_number_div.style.display = 'none';
        }
      }
    };
  };

  // Yappy phone handler - EXACTLY like test file
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

  // Process payment - EXACTLY like test file
  const processPayment = async () => {
    const method = document.getElementById("tlpy_payment_method").value;

    if (!method) {
      alert('Please select a payment method');
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Starting payment...');

      const payment = await window.Tilopay.startPayment();

      console.log('💰 Payment Response:', payment);
      console.log('💰 Payment Response Type:', typeof payment);
      console.log('💰 Payment Properties:', Object.keys(payment || {}));

      // Tilopay SDK may redirect before returning a response
      // If we get here, check the response format

      // Check if response contains an error message
      if (payment && payment.message && !payment.success && !payment.code) {
        // This is an error response from Tilopay
        console.error('❌ Tilopay Error:', payment.message);
        alert(payment.message);
        setLoading(false);
        return; // Don't throw, just return
      }
      // Check if payment was successful (immediate response)
      else if (payment && (payment.success || payment.status === 'approved' || payment.code === 1 || payment.code === '1')) {
        console.log('✅ Payment Successful (immediate)!');
        // Payment processed without redirect - mark complete
        await markStepCompleted(3);
        await setCurrentStep(4);
        setTimeout(() => {
          router.push('/onboarding-new?step=4&payment=success');
        }, 1000);
      }
      // Check if payment requires redirect (3DS or external)
      else if (payment && payment.redirect_url) {
        console.log('↗️ Redirecting to:', payment.redirect_url);
        // Don't show error - this is expected behavior
        window.location.href = payment.redirect_url;
      }
      // Check for explicit error status
      else if (payment && (payment.error || payment.status === 'failed' || payment.status === 'error' || payment.code === 0)) {
        const errorMsg = payment.message || payment.description || payment.error || 'Payment failed';
        console.error('❌ Payment Failed:', errorMsg);
        alert('Payment Failed: ' + errorMsg);
        setLoading(false);
        return; // Don't throw, just return
      }
      // If payment is null/undefined, Tilopay probably already redirected
      else if (!payment || payment === null || payment === undefined) {
        console.log('⏳ Payment processing - waiting for redirect...');
        // Tilopay SDK handles redirect internally - do nothing
        // Don't show error alert
      }
      // Unknown response - might be processing or about to redirect
      else {
        console.log('⏳ Unexpected payment response:', payment);

        // If there's a message but no success indicator, treat as error
        if (payment.message) {
          console.error('❌ Payment Error:', payment.message);
          alert(payment.message);
          setLoading(false);
          return; // Don't throw, just return
        }

        // Otherwise, assume Tilopay is handling the redirect internally
        // Don't show error - just keep loading state while redirect happens
        console.log('⏳ Waiting for Tilopay to process payment...');
      }
    } catch (error) {
      console.error('❌ Payment Error:', error);
      // Only show alert for real errors, not for redirect scenarios
      if (error.message && !error.message.includes('redirect')) {
        alert('Payment Failed: ' + error.message);
      }
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Plan</h1>
          <button
            onClick={() => router.push('/onboarding-new?step=3')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen desert-sand-bg-subtle py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/onboarding-new?step=3')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Plans
          </button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            Complete Your Payment
          </h1>
          <p className="text-gray-600">Secure payment powered by Tilopay</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2" style={{ borderColor: 'rgba(187, 40, 44, 0.2)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Selected Plan:</span>
              <span className="font-bold text-lg" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                {selectedPlan.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Amount:</span>
              <span className="font-bold text-3xl" style={{ color: 'rgba(187, 40, 44, 1)' }}>
                {selectedPlan.amount} USD
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form - EXACTLY like test-tilopay-minimal.html */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2" style={{ borderColor: 'rgba(187, 40, 44, 0.2)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'rgba(3, 50, 83, 1)' }}>
            Payment Details
          </h2>

          {/* Tilopay Form Container - EXACTLY like test file */}
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
              >
                <option value="">Select payment method</option>
              </select>
            </div>

            {/* Card Payment Inputs */}
            <div id="tlpy_card_payment_div">
              {/* Saved Cards */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                  Saved Cards
                </label>
                <select
                  id="tlpy_saved_cards"
                  name="tlpy_saved_cards"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select a saved card</option>
                </select>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(3, 50, 83, 1)' }}>
                  Card Number <span style={{ color: 'rgba(187, 40, 44, 1)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="tlpy_cc_number"
                  name="tlpy_cc_number"
                  placeholder="4111 1111 1111 1111"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Expiration and CVV */}
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
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
                />
              </div>
            </div>
          </div>
          {/* End payFormTilopay */}

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
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(187, 40, 44, 0.9), rgba(187, 40, 44, 1))',
              boxShadow: '0 4px 15px 0 rgba(187, 40, 44, 0.3)'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Pay {selectedPlan.amount}</span>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 256-bit SSL encrypted payment powered by Tilopay
          </p>
        </div>
      </div>
    </div>
  );
}
