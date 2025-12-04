import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PayPalSubscriptionButtons from './PayPalSubscriptionButtons';

/**
 * PayPal Recurring Payment Component (SDK-based)
 * Handles recurring subscription payments with PayPal JavaScript SDK
 */
const PayPalRecurringPayment = ({
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
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState(null);
  const [error, setError] = useState(null);

  // Plan IDs mapping (you'll need to create these plans in PayPal or via API)
  const PLAN_IDS = {
    silver: process.env.NEXT_PUBLIC_PAYPAL_PLAN_SILVER || 'create_via_api',
    gold: process.env.NEXT_PUBLIC_PAYPAL_PLAN_GOLD || 'create_via_api',
    diamond: process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIAMOND || 'create_via_api',
    'diamond+': process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIAMOND_PLUS || 'create_via_api',
  };

  /**
   * Initialize or create PayPal plan
   */
  useEffect(() => {
    initializePlan();
  }, []);

  const initializePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const planKey = planName.toLowerCase();
      let existingPlanId = PLAN_IDS[planKey];

      // If plan doesn't exist, create it dynamically
      if (existingPlanId === 'create_via_api') {
        console.log('📝 Creating PayPal plan dynamically...');

        const response = await fetch('/api/paypal/create-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planName,
            amount,
            currency,
            description: `Monthly subscription for ${planName} plan`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create PayPal plan');
        }

        existingPlanId = data.planId;
        console.log('✅ PayPal plan created:', existingPlanId);
      }

      setPlanId(existingPlanId);
      console.log('✅ Using PayPal plan:', existingPlanId);

    } catch (error) {
      console.error('❌ Error initializing PayPal plan:', error);
      setError(error.message);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle subscription success
   */
  const handleSuccess = (data) => {
    console.log('✅ PayPal subscription successful:', data);

    if (onSuccess) {
      onSuccess({
        gateway: 'paypal',
        subscriptionId: data.subscriptionId,
        paymentId: data.paymentId,
        orderNumber: data.orderNumber,
        transactionId: data.subscriptionId,
        captureId: data.subscriptionId,
      });
    }

    // Redirect to next onboarding step
    router.push('/onboarding-new?step=4&payment=success&code=1');
  };

  /**
   * Handle subscription error
   */
  const handleError = (errorMessage) => {
    console.error('❌ PayPal subscription error:', errorMessage);
    setError(errorMessage);

    if (onError) {
      onError(errorMessage);
    }
  };

  /**
   * Handle subscription cancellation
   */
  const handleCancel = () => {
    console.log('⚠️ User cancelled PayPal subscription');
  };

  /**
   * Retry initialization
   */
  const handleRetry = () => {
    initializePlan();
  };

  return (
    <div className="paypal-recurring-payment">
      {/* Plan Summary */}
      <div className="plan-summary mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Subscription Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing:</span>
            <span className="font-medium">Monthly Recurring</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-lg">
              ${parseFloat(amount).toFixed(2)} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Setup Fee:</span>
            <span className="font-medium">
              ${parseFloat(amount).toFixed(2)} {currency}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-900 font-semibold">Total Today:</span>
              <span className="text-xl font-bold text-blue-600">
                ${parseFloat(amount).toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="subscription-details mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Recurring Subscription</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ You'll be charged ${parseFloat(amount).toFixed(2)} {currency} today as setup fee</li>
          <li>✓ Then ${parseFloat(amount).toFixed(2)} {currency} per month for 12 months</li>
          <li>✓ Cancel anytime from your PayPal account</li>
          <li>✓ Automatic renewal on the same day each month</li>
          <li>✓ Manage your subscription in PayPal settings</li>
        </ul>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing PayPal subscription...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-state mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Payment Error</h4>
            <p className="text-sm text-red-800 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Payment
            </button>
          </div>
        </div>
      )}

      {/* PayPal Subscription Buttons (SDK-based) */}
      {!loading && !error && planId && (
        <div className="mb-6">
          <PayPalSubscriptionButtons
            planId={planId}
            userId={userId}
            planName={planName}
            amount={amount}
            email={email}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* What happens next */}
      <div className="what-happens-next mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
          <li>Click the PayPal button above to start subscription</li>
          <li>Log in to your PayPal account (or create one)</li>
          <li>Review and approve the recurring billing agreement</li>
          <li>Your subscription will be activated immediately</li>
          <li>Continue with your onboarding process</li>
        </ol>
      </div>

      {/* Benefits */}
      <div className="benefits mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">PayPal Benefits</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>🔒 Secure payment processing</li>
          <li>💳 No need to enter card details</li>
          <li>📱 Works on all devices</li>
          <li>⚙️ Easy subscription management</li>
          <li>🛡️ Buyer protection included</li>
        </ul>
      </div>

      {/* Customer Support */}
      <div className="customer-support mt-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600 mb-3">
          If you encounter any issues with PayPal payment, our support team is here to help.
        </p>
        <div className="flex space-x-3">
          <a
            href="mailto:support@falconglobal.com"
            className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Email Support
          </a>
          <button
            onClick={() => onError && onError('User requested alternative payment')}
            className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
          >
            Use Alternative Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayPalRecurringPayment;
