import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import UnifiedPaymentGateway from '../components/UnifiedPaymentGateway';
import { PayPalSDKProvider } from '../components/PayPalSDKProvider';
import { useOnboarding } from '../context/OnboardingContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Unified Payment Page for Onboarding
 * Supports PayPal (primary) and Tilopay (fallback)
 */
export default function UnifiedPaymentPage() {
  const router = useRouter();
  const { plan } = router.query;
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [originalAmount, setOriginalAmount] = useState(0);
  const [discountedAmount, setDiscountedAmount] = useState(0);

  // Plan pricing configuration
  const plans = {
    silver: { name: 'Silver', amount: 299, description: 'Career Consultation Package' },
    gold: { name: 'Gold', amount: 699, description: 'Full Relocation Assistance' },
    diamond: { name: 'Diamond', amount: 1599, description: 'End-to-End Recruitment Service' },
    'diamond-plus': { name: 'Diamond+', amount: 2999, description: 'Custom Enterprise Solution' },
  };

  useEffect(() => {
    initializePayment();
  }, [plan]);

  const initializePayment = async () => {
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated:', userError);
        router.push('/login?redirect=/payment-unified?plan=' + (plan || 'silver'));
        return;
      }

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Get or create onboarding data
      let { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboardingError && onboardingError.code === 'PGRST116') {
        // Create new onboarding record if it doesn't exist
        const { data: newOnboarding, error: createError } = await supabase
          .from('onboarding_data')
          .insert({
            user_id: user.id,
            step: 3,
            personal_info: {},
            business_info: {},
            payment_completed: false,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating onboarding:', createError);
        } else {
          onboarding = newOnboarding;
        }
      }

      // Set user data
      const personalDetails = onboarding?.personal_details || {};
      const address = personalDetails?.address || {};
      
      setUserData({
        id: user.id,
        email: user.email || personalDetails?.email,
        fullName: personalDetails?.fullName || profile?.full_name || '',
        firstName: personalDetails?.fullName?.split(' ')[0] || profile?.full_name?.split(' ')[0] || '',
        lastName: personalDetails?.fullName?.split(' ').slice(1).join(' ') || profile?.full_name?.split(' ').slice(1).join(' ') || '',
        phone: personalDetails?.telephone || profile?.phone || '',
        telephone: personalDetails?.telephone || profile?.phone || '',
        address: address?.street || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
        country: address?.country || profile?.country || '',
      });

      // Set plan details
      const selectedPlan = plan?.toLowerCase() || 'silver';
      const planData = plans[selectedPlan] || plans.silver;
      setPlanDetails(planData);
      setOriginalAmount(planData.amount);
      setDiscountedAmount(planData.amount);

    } catch (error) {
      console.error('Error initializing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) {
      setCodeError('Please enter a referral code');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    try {
      const response = await fetch('/api/validate-referral-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: referralCode.trim().toUpperCase() })
      });

      const result = await response.json();

      if (result.valid) {
        const discount = (originalAmount * result.discountPercentage) / 100;
        const newAmount = originalAmount - discount;

        setReferralDiscount({
          code: result.code,
          percentage: result.discountPercentage,
          discountAmount: discount
        });
        setDiscountedAmount(newAmount);
        setCodeError('');
      } else {
        setCodeError('Invalid referral code');
        setReferralDiscount(null);
        setDiscountedAmount(originalAmount);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setCodeError('Error validating code. Please try again.');
      setReferralDiscount(null);
      setDiscountedAmount(originalAmount);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleRemoveReferralCode = () => {
    setReferralCode('');
    setReferralDiscount(null);
    setCodeError('');
    setDiscountedAmount(originalAmount);
  };

  const handlePaymentSuccess = async (data) => {
    console.log('Payment successful:', data);

    try {
      // Update onboarding context
      await updateOnboardingData({
        payment_completed: true,
        payment_details: {
          plan: planDetails.name.toLowerCase(),
          amount: discountedAmount,
          originalAmount: originalAmount,
          currency: 'USD',
          gateway: data.gateway,
          transactionId: data.transactionId || data.captureId,
          orderNumber: data.orderNumber,
          referralCode: referralDiscount?.code || null,
          discountPercentage: referralDiscount?.percentage || 0,
          discountAmount: referralDiscount?.discountAmount || 0,
          timestamp: new Date().toISOString(),
        },
      });

      // Redirect to next onboarding step
      router.push('/onboarding-new?step=4&payment=success&code=1');
    } catch (error) {
      console.error('Error updating onboarding data:', error);
      // Still redirect even if update fails
      router.push('/onboarding-new?step=4&payment=success&code=1');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Stay on payment page, let user retry or switch gateway
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!userData || !planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Payment</h2>
          <p className="text-gray-600 mb-6">Please try again or contact support.</p>
          <button
            onClick={() => router.push('/onboarding-new?step=3')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayPalSDKProvider
      clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
      currency="USD"
      intent="subscription"
    >
      <Head>
        <title>Payment - {planDetails.name} Plan | FALCON Global Consulting</title>
        <meta name="description" content="Complete your payment to continue with FALCON Global Consulting" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              Subscribe to the {planDetails.name} plan to continue your onboarding
            </p>
          </div>

          {/* Plan Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {planDetails.name} Plan
                </h2>
                <p className="text-gray-600">{planDetails.description}</p>
              </div>
              <div className="text-right">
                {referralDiscount ? (
                  <>
                    <div className="text-lg text-gray-400 line-through">
                      ${originalAmount}
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      ${discountedAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      {referralDiscount.percentage}% OFF Applied!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-blue-600">
                      ${planDetails.amount}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </>
                )}
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="border-t pt-4 mt-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Have a Referral Code?</h3>
              {!referralDiscount ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., ABC123)"
                    maxLength={5}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    disabled={validatingCode}
                  />
                  <button
                    onClick={handleApplyReferralCode}
                    disabled={validatingCode || !referralCode.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {validatingCode ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-900">Code "{referralDiscount.code}" Applied</p>
                      <p className="text-sm text-green-700">
                        You're saving ${referralDiscount.discountAmount.toFixed(2)} ({referralDiscount.percentage}% off)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveReferralCode}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              {codeError && (
                <p className="text-red-600 text-sm mt-2">{codeError}</p>
              )}
            </div>

            {/* User Info */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {userData.firstName} {userData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{userData.email}</span>
                </div>
                {userData.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">{userData.phone}</span>
                  </div>
                )}
                {userData.country && (
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <span className="ml-2 text-gray-900">{userData.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Gateway Component */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <UnifiedPaymentGateway
              userId={userData.id}
              email={userData.email}
              firstName={userData.firstName}
              lastName={userData.lastName}
              amount={discountedAmount}
              planName={planDetails.name}
              currency="USD"
              address={userData.address}
              city={userData.city}
              state={userData.state}
              country={userData.country}
              phone={userData.phone}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/onboarding-new?step=3')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Plan Selection
            </button>
          </div>
        </div>
      </div>
    </PayPalSDKProvider>
  );
}
