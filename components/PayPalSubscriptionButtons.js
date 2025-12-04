import React, { useEffect, useRef, useState } from 'react';
import { usePayPalSDK } from './PayPalSDKProvider';

/**
 * PayPal Subscription Buttons Component
 * Renders PayPal subscription buttons using JavaScript SDK
 */
const PayPalSubscriptionButtons = ({
  planId,
  userId,
  planName,
  amount,
  email,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { isLoaded, isLoading, error: sdkError, paypal } = usePayPalSDK();
  const buttonContainerRef = useRef(null);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !paypal || !buttonContainerRef.current || buttonRendered) {
      return;
    }

    try {
      console.log('🎨 Rendering PayPal subscription buttons...');

      const buttons = paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        },

        // Create subscription
        createSubscription: function (data, actions) {
          console.log('📝 Creating PayPal subscription...');

          return actions.subscription.create({
            plan_id: planId,
            application_context: {
              brand_name: 'FALCON Global Consulting',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
            },
          });
        },

        // Handle approval
        onApprove: async function (data, actions) {
          console.log('✅ Subscription approved:', data);

          try {
            // Send subscription details to backend
            const response = await fetch('/api/paypal/create-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionID: data.subscriptionID,
                userId: userId,
                planName: planName,
                amount: amount,
                email: email,
              }),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Failed to process subscription');
            }

            console.log('✅ Subscription processed:', result);

            // Call success callback
            if (onSuccess) {
              onSuccess({
                subscriptionId: data.subscriptionID,
                orderId: data.orderID,
                paymentId: result.paymentId,
                orderNumber: result.orderNumber,
              });
            }
          } catch (error) {
            console.error('❌ Error processing subscription:', error);
            if (onError) {
              onError(error.message);
            }
          }
        },

        // Handle cancellation
        onCancel: function (data) {
          console.log('❌ Subscription cancelled:', data);
          if (onCancel) {
            onCancel();
          }
        },

        // Handle errors
        onError: function (err) {
          console.error('❌ PayPal button error:', err);
          if (onError) {
            onError(err.message || 'PayPal error occurred');
          }
        },
      });

      // Check if button can be rendered
      if (buttons.isEligible()) {
        buttons.render(buttonContainerRef.current).then(() => {
          console.log('✅ PayPal buttons rendered successfully');
          setButtonRendered(true);
        }).catch((err) => {
          console.error('❌ Failed to render PayPal buttons:', err);
          setRenderError(err.message);
          if (onError) {
            onError('Failed to render PayPal buttons');
          }
        });
      } else {
        console.error('❌ PayPal buttons not eligible');
        setRenderError('PayPal subscription buttons not available');
        if (onError) {
          onError('PayPal subscription buttons not available');
        }
      }
    } catch (error) {
      console.error('❌ Error setting up PayPal buttons:', error);
      setRenderError(error.message);
      if (onError) {
        onError(error.message);
      }
    }
  }, [isLoaded, paypal, buttonRendered, planId, userId, planName, amount, email, onSuccess, onError, onCancel]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PayPal...</p>
      </div>
    );
  }

  if (sdkError || renderError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-900 mb-2">PayPal Error</h4>
        <p className="text-sm text-red-800">{sdkError || renderError}</p>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      <div ref={buttonContainerRef} id="paypal-button-container"></div>
      {!buttonRendered && isLoaded && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Preparing PayPal buttons...
        </div>
      )}
    </div>
  );
};

export default PayPalSubscriptionButtons;
