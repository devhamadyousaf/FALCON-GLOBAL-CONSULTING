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
      setPlanDetails(plans[selectedPlan] || plans.silver);

    } catch (error) {
      console.error('Error initializing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (data) => {
    console.log('Payment successful:', data);

    try {
      // Update onboarding context
      await updateOnboardingData({
        payment_completed: true,
        payment_details: {
          plan: planDetails.name.toLowerCase(),
          amount: planDetails.amount,
          currency: 'USD',
          gateway: data.gateway,
          transactionId: data.transactionId || data.captureId,
          orderNumber: data.orderNumber,
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
                <div className="text-3xl font-bold text-blue-600">
                  ${planDetails.amount}
                </div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
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
              amount={planDetails.amount}
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
