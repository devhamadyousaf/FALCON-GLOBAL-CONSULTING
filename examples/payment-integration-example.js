/**
 * Example: Integrating Tilopay Payment into Onboarding Flow
 *
 * This file demonstrates how to integrate the Tilopay payment component
 * into your existing onboarding flow (pages/onboarding-new.js)
 */

import { useState } from 'react';
import TilopayPayment from '../components/TilopayPayment';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

// Example 1: Using the TilopayPayment Component Directly
export function PaymentStepExample() {
  const { user } = useAuth();
  const { onboardingData, completePayment, setCurrentStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState('silver');

  // Plan pricing
  const plans = {
    silver: { name: 'Silver Plan', amount: 299, features: ['Basic support', '30-day processing'] },
    gold: { name: 'Gold Plan', amount: 699, features: ['Priority support', '14-day processing'] },
    diamond: { name: 'Diamond Plan', amount: 1599, features: ['Premium support', '7-day processing'] }
  };

  const handlePaymentSuccess = async (payment) => {
    console.log('Payment successful:', payment);

    // Update onboarding data
    await completePayment({
      plan: selectedPlan,
      amount: plans[selectedPlan].amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      transactionId: payment.transaction_id || payment.transactionCode,
      orderNumber: payment.orderNumber,
      paymentMethod: 'tilopay'
    });

    // Move to next step
    await setCurrentStep(5);

    // Show success message or redirect
    alert('Payment successful! Moving to next step...');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message}`);
  };

  const handleCancel = () => {
    // Go back to plan selection or previous step
    console.log('Payment cancelled');
  };

  return (
    <div className="payment-step">
      <h2>Complete Your Payment</h2>

      {/* Plan Summary */}
      <div className="plan-summary">
        <h3>Selected Plan: {plans[selectedPlan].name}</h3>
        <p className="amount">${plans[selectedPlan].amount} USD</p>
        <ul>
          {plans[selectedPlan].features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {/* Change Plan */}
      <div className="plan-selector">
        <label>Change Plan:</label>
        <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
          <option value="silver">Silver - $299</option>
          <option value="gold">Gold - $699</option>
          <option value="diamond">Diamond - $1,599</option>
        </select>
      </div>

      {/* Tilopay Payment Component */}
      <TilopayPayment
        userId={user.id}
        email={onboardingData.personalDetails?.email || user.email}
        firstName={onboardingData.personalDetails?.fullName?.split(' ')[0] || 'Customer'}
        lastName={onboardingData.personalDetails?.fullName?.split(' ').slice(1).join(' ') || ''}
        amount={plans[selectedPlan].amount}
        planName={selectedPlan}
        currency="USD"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handleCancel}
      />
    </div>
  );
}

// Example 2: Using Context Methods for Custom Implementation
export function CustomPaymentFlowExample() {
  const { user } = useAuth();
  const { initiateTilopayPayment, verifyPayment } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const startPayment = async () => {
    try {
      setLoading(true);

      // Initiate payment via API
      const response = await initiateTilopayPayment({
        amount: 299,
        planName: 'silver',
        currency: 'USD'
      });

      console.log('Payment initiated:', response);
      setPaymentId(response.paymentId);

      // Now you can use the tilopayConfig to initialize the SDK manually
      // Or redirect to a payment page
      // Example: window.location.href = `/payment?id=${response.paymentId}`;

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!paymentId) {
      alert('No payment to check');
      return;
    }

    try {
      setLoading(true);

      const status = await verifyPayment(paymentId);

      console.log('Payment status:', status);
      alert(`Payment Status: ${status.status}\nAmount: $${status.amount}`);

    } catch (error) {
      console.error('Error verifying payment:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-payment-flow">
      <h2>Custom Payment Flow</h2>

      <button onClick={startPayment} disabled={loading}>
        {loading ? 'Processing...' : 'Start Payment'}
      </button>

      {paymentId && (
        <div className="payment-info">
          <p>Payment ID: {paymentId}</p>
          <button onClick={checkPayment} disabled={loading}>
            Check Payment Status
          </button>
        </div>
      )}
    </div>
  );
}

// Example 3: Integration into Existing Onboarding Flow (Step 4)
export function OnboardingStep4WithTilopay() {
  const { user } = useAuth();
  const { onboardingData, markStepCompleted, setCurrentStep } = useOnboarding();
  const [paymentMode, setPaymentMode] = useState(false);

  // Get selected plan from previous step or context
  const selectedPlan = onboardingData.paymentDetails?.plan || 'silver';

  const planPricing = {
    silver: 299,
    gold: 699,
    diamond: 1599,
    'diamond+': 0 // Custom pricing
  };

  const handlePaymentSuccess = async (payment) => {
    console.log('✅ Payment successful:', payment);

    // Mark step as completed
    await markStepCompleted(4);

    // Move to next step
    await setCurrentStep(5);

    // Redirect or show success
    window.location.href = '/onboarding-new?step=5&payment=success';
  };

  if (!paymentMode) {
    return (
      <div className="payment-step">
        <h2>Step 4: Payment</h2>

        <div className="plan-summary">
          <h3>Your Selected Plan</h3>
          <p>Plan: <strong>{selectedPlan.toUpperCase()}</strong></p>
          <p>Amount: <strong>${planPricing[selectedPlan]} USD</strong></p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setPaymentMode(true)}
        >
          Proceed to Payment
        </button>
      </div>
    );
  }

  return (
    <div className="payment-step">
      <h2>Complete Your Payment</h2>

      <TilopayPayment
        userId={user.id}
        email={onboardingData.personalDetails?.email || user.email}
        firstName={onboardingData.personalDetails?.fullName?.split(' ')[0] || 'Customer'}
        lastName={onboardingData.personalDetails?.fullName?.split(' ').slice(1).join(' ') || ''}
        amount={planPricing[selectedPlan]}
        planName={selectedPlan}
        currency="USD"
        onSuccess={handlePaymentSuccess}
        onError={(error) => {
          console.error('Payment error:', error);
          alert(`Payment failed: ${error.message}`);
        }}
        onCancel={() => setPaymentMode(false)}
      />
    </div>
  );
}

// Example 4: Handling Payment Callback in Query Parameters
export function PaymentCallbackHandler() {
  const { useEffect } = require('react');
  const { useRouter } = require('next/router');
  const { verifyPayment } = useOnboarding();

  const router = useRouter();
  const { payment, step } = router.query;

  useEffect(() => {
    if (payment === 'success') {
      console.log('✅ Payment was successful!');
      // Show success message
      // The callback has already updated the database
    } else if (payment === 'failed') {
      console.log('❌ Payment failed');
      // Show error message
    }
  }, [payment]);

  return (
    <div>
      {payment === 'success' && (
        <div className="success-message">
          <h2>Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
        </div>
      )}

      {payment === 'failed' && (
        <div className="error-message">
          <h2>Payment Failed</h2>
          <p>Your payment could not be processed. Please try again.</p>
          <button onClick={() => router.push('/onboarding-new?step=4')}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// CSS Styles (add to your styles file or use Tailwind)
const styles = `
.payment-step {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.plan-summary {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.plan-summary .amount {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
  margin: 10px 0;
}

.plan-selector {
  margin: 20px 0;
}

.plan-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.plan-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  background: #d1fae5;
  border: 2px solid #10b981;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.error-message {
  background: #fee2e2;
  border: 2px solid #ef4444;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
`;

export default PaymentStepExample;
