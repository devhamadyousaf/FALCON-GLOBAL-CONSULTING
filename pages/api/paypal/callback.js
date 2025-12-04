import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * PayPal callback handler for recurring payments
 * Handles return from PayPal approval flow
 */
export default async function handler(req, res) {
  try {
    const { token, paymentId, orderNumber } = req.query;

    console.log('PayPal callback received:', { token, paymentId, orderNumber });

    if (!token || !paymentId) {
      console.error('Missing required parameters');
      return res.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=failed&error=missing_params`
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment record not found:', paymentError);
      return res.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=failed&error=payment_not_found`
      );
    }

    // Create payment method token by calling our endpoint
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const createTokenResponse = await fetch(`${siteUrl}/api/paypal/create-payment-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setupTokenId: token,
        paymentId: payment.id,
      }),
    });

    const tokenResult = await createTokenResponse.json();

    if (!createTokenResponse.ok || !tokenResult.success) {
      console.error('Failed to create payment token:', tokenResult);
      return res.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=failed&error=token_creation_failed`
      );
    }

    // Now capture the initial payment
    const captureResponse = await fetch(`${siteUrl}/api/paypal/capture-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: payment.id,
        paymentTokenId: tokenResult.paymentTokenId,
        amount: payment.amount,
        currency: payment.currency,
      }),
    });

    const captureResult = await captureResponse.json();

    if (!captureResponse.ok || !captureResult.success) {
      console.error('Failed to capture payment:', captureResult);

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          metadata: {
            ...payment.metadata,
            captureError: captureResult.error || 'Capture failed',
            captureDetails: captureResult.details,
          },
        })
        .eq('id', payment.id);

      return res.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=failed&error=capture_failed`
      );
    }

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          captureId: captureResult.captureId,
          orderId: captureResult.orderId,
          paymentTokenId: tokenResult.paymentTokenId,
          completedAt: new Date().toISOString(),
        },
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment status:', updateError);
    }

    // Update onboarding data
    const { error: onboardingError } = await supabase
      .from('onboarding_data')
      .update({
        payment_completed: true,
        payment_details: {
          plan: payment.plan,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: 'paypal',
          transactionId: captureResult.captureId,
          orderNumber: payment.order_number,
          paymentTokenId: tokenResult.paymentTokenId,
          timestamp: new Date().toISOString(),
        },
      })
      .eq('user_id', payment.user_id);

    if (onboardingError) {
      console.error('Failed to update onboarding data:', onboardingError);
    }

    // Redirect to success page
    return res.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=4&payment=success&code=1`
    );

  } catch (error) {
    console.error('PayPal callback error:', error);
    return res.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=failed&error=server_error`
    );
  }
}
