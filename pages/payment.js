import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

export default function PaymentPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { onboardingData, markStepCompleted, setCurrentStep } = useOnboarding();

  const [loading, setLoading] = useState(false);
  const [tilopayConfig, setTilopayConfig] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [tilopayLoaded, setTilopayLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Get plan from URL query
  const { plan: planParam } = router.query;

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

  // Load Tilopay SDK
  useEffect(() => {
    // Check if SDK is already loaded
    if (window.Tilopay) {
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
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Tilopay SDK:', error);
      setError('Payment system failed to load. Please check your internet connection and refresh the page.');
      setTilopayLoaded(false);
    };
    
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      const scriptToRemove = document.querySelector('script[src*="tilopay.com/sdk"]');
      if (scriptToRemove && document.body.contains(scriptToRemove)) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Initialize payment when SDK is loaded and plan is selected
  useEffect(() => {
    if (tilopayLoaded && selectedPlan && !tilopayConfig && user?.id) {
      initiatePayment();
    }
  }, [tilopayLoaded, selectedPlan, user?.id]);

  // Initialize Tilopay SDK after config is set and form is rendered
  useEffect(() => {
    const initializeTilopaySDK = async () => {
      if (!tilopayConfig || !tilopayLoaded || !window.Tilopay) {
        return;
      }

      // Wait for DOM elements to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      const paymentMethodElement = document.getElementById('tlpy_payment_method');
      const cardNumberElement = document.getElementById('tlpy_cc_number');

      if (!paymentMethodElement || !cardNumberElement) {
        console.error('Payment form elements not found in DOM');
        setError('Failed to initialize payment form. Please refresh the page.');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Initializing Tilopay SDK with config:', {
          token: tilopayConfig.token?.substring(0, 10) + '...',
          amount: tilopayConfig.amount,
          currency: tilopayConfig.currency,
          orderNumber: tilopayConfig.orderNumber
        });

        const initialize = await window.Tilopay.Init(tilopayConfig);
        
        console.log('✅ Tilopay initialized successfully:', initialize);
        
        if (initialize && initialize.methods) {
          setPaymentMethods(initialize.methods || []);
          setSavedCards(initialize.cards || []);
          setLoading(false);
        } else {
          throw new Error('Invalid response from Tilopay initialization');
        }
      } catch (sdkError) {
        console.error('❌ Tilopay SDK initialization error:', sdkError);
        setError('Failed to initialize payment form. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeTilopaySDK();
  }, [tilopayConfig, tilopayLoaded]);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user details from onboarding data or user profile
      const personalDetails = onboardingData?.personalDetails || {};
      const fullName = personalDetails.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const email = personalDetails.email || user?.email || 'customer@example.com';

      console.log('🔄 Initiating payment with:', {
        userId: user?.id,
        amount: selectedPlan?.price,
        planName: planParam,
        email,
        firstName,
        lastName
      });

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!selectedPlan || !selectedPlan.price) {
        throw new Error('Invalid plan selected');
      }

      const response = await fetch('/api/tilopay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: selectedPlan.price,
          planName: planParam.toLowerCase(),
          currency: 'USD',
          email: email,
          firstName: firstName,
          lastName: lastName,
          address: personalDetails.address?.street || 'N/A',
          city: personalDetails.address?.city || 'N/A',
          state: personalDetails.address?.state || '',
          country: personalDetails.address?.country || 'CR',
          phone: personalDetails.telephone || ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate payment');
      }

      console.log('✅ Payment initiated:', {
        paymentId: data.paymentId,
        orderNumber: data.orderNumber
      });
      
      setTilopayConfig(data.tilopayConfig);
    } catch (err) {
      console.error('❌ Error initiating payment:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = async (e) => {
    const method = e.target.value;
    setSelectedPaymentMethod(method);

    if (method) {
      const splitMethods = method.split(':');
      const isYappy = splitMethods[1] === '18';

      const cardDiv = document.getElementById('tlpy_card_payment_div');
      const phoneDiv = document.getElementById('tlpy_phone_number_div');

      if (cardDiv) cardDiv.style.display = isYappy ? 'none' : 'block';
      if (phoneDiv) {
        phoneDiv.style.display = isYappy ? 'block' : 'none';
        
        // Set up phone change listener for Yappy if shown
        if (isYappy) {
          const phoneInput = document.getElementById('tlpy_phone_number');
          if (phoneInput && window.Tilopay) {
            phoneInput.onchange = async function() {
              const phone = phoneInput.value;
              if (phone) {
                await window.Tilopay.updateOptions({ phoneYappy: phone });
              }
            };
          }
        }
      }
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!window.Tilopay) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting payment process...');
      const payment = await window.Tilopay.startPayment();
      console.log('💳 Payment response:', payment);

      // Check for successful payment
      if (payment && (payment.success || payment.status === 'approved' || payment.status === 'success')) {
        console.log('✅ Payment successful:', payment);

        // Wait for callback to process, then redirect
        setTimeout(async () => {
          await markStepCompleted(3);
          await setCurrentStep(4);
          router.push('/onboarding-new?step=4&payment=success');
        }, 2000);
      } else if (payment && payment.redirect_url) {
        // Handle redirect for some payment methods
        console.log('↗️ Redirecting to:', payment.redirect_url);
        window.location.href = payment.redirect_url;
      } else {
        throw new Error(payment?.message || payment?.error || 'Payment failed. Please check your card details and try again.');
      }
    } catch (err) {
      console.error('❌ Error processing payment:', err);
      setError(err.message || 'Payment failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
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

        {/* Payment Summary */}
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
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Customer:</span>
                <span>{onboardingData?.personalDetails?.email || user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        {tilopayConfig && tilopayLoaded ? (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-2 border-gray-100">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'rgba(3, 50, 83, 1)' }}>
              Payment Details
            </h2>

            {/* Tilopay Required Form Container */}
            <div className="payFormTilopay">
              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  id="tlpy_payment_method"
                  name="tlpy_payment_method"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saved Cards
                    </label>
                    <select
                      id="tlpy_saved_cards"
                      name="tlpy_saved_cards"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    id="tlpy_cc_number"
                    name="tlpy_cc_number"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration (MM/YY) *
                  </label>
                  <input
                    type="text"
                    id="tlpy_cc_expiration_date"
                    name="tlpy_cc_expiration_date"
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    id="tlpy_cvv"
                    name="tlpy_cvv"
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Phone Input for Yappy */}
            <div id="tlpy_phone_number_div" style={{ display: 'none' }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  id="tlpy_phone_number"
                  name="tlpy_phone_number"
                  placeholder="+507 1234-5678"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            </div>
            {/* End of payFormTilopay */}

            {/* Required container for 3DS process */}
            <div id="responseTilopay" className="mb-6"></div>

            {/* Features */}
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
              disabled={loading || !selectedPaymentMethod}
              className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(107, 114, 128, 1))'
                  : 'linear-gradient(135deg, rgba(187, 40, 44, 0.9), rgba(187, 40, 44, 1))',
                boxShadow: '0 4px 15px 0 rgba(187, 40, 44, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay {selectedPlan.amount}</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              🔒 256-bit SSL encrypted payment powered by Tilopay
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment system...</p>
          </div>
        )}
      </div>
    </div>
  );
}
