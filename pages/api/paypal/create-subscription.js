import { createClient } from '@supabase/supabase-js';
import { makeRequest } from '../../../lib/paypal-sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create PayPal Subscription
 * Called by JavaScript SDK after user approves
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      subscriptionID,
      userId,
      planName,
      amount,
      email,
    } = req.body;

    if (!subscriptionID || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: subscriptionID, userId',
      });
    }

    // Get subscription details from PayPal
    const subscription = await makeRequest(
      'GET',
      `/v1/billing/subscriptions/${subscriptionID}`
    );

    // Create payment record in database
    const orderNumber = `FGC-PP-SUB-${Date.now()}-${userId.substring(0, 8)}`;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: 'USD',
        payment_method: 'paypal',
        status: subscription.status === 'ACTIVE' ? 'completed' : 'pending',
        transaction_id: subscriptionID,
        paypal_reference: subscriptionID,
        order_number: orderNumber,
        plan: planName.toLowerCase(),
        paid_at: subscription.status === 'ACTIVE' ? new Date().toISOString() : null,
        metadata: {
          subscriptionId: subscriptionID,
          planId: subscription.plan_id,
          subscriberId: subscription.subscriber?.payer_id,
          email: email,
          billingInfo: subscription.billing_info,
          startTime: subscription.start_time,
          status: subscription.status,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return res.status(500).json({ error: 'Failed to create payment record' });
    }

    // Update onboarding data
    await supabase
      .from('onboarding_data')
      .update({
        payment_completed: true,
        payment_details: {
          plan: planName.toLowerCase(),
          amount: amount,
          currency: 'USD',
          paymentMethod: 'paypal',
          subscriptionId: subscriptionID,
          orderNumber: orderNumber,
          timestamp: new Date().toISOString(),
        },
      })
      .eq('user_id', userId);

    return res.status(200).json({
      success: true,
      paymentId: payment.id,
      subscriptionId: subscriptionID,
      orderNumber: orderNumber,
      subscription: subscription,
    });

  } catch (error) {
    console.error('Error processing subscription:', error);
    return res.status(500).json({
      error: 'Failed to process subscription',
      message: error.message,
    });
  }
}
