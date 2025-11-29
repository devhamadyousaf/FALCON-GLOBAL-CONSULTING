import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Tilopay can send callback via POST body or GET query params
    const callbackData = req.method === 'POST' ? req.body : req.query;

    console.log('📥 Tilopay callback received:', {
      method: req.method,
      data: callbackData
    });

    // Extract callback parameters
    const {
      order,
      orderNumber,
      transaction_code,
      transaction_id,
      amount,
      status,
      message,
      returnData,
      authCode,
      brand,
      last4,
      payment_method
    } = callbackData;

    // Decode returnData
    let decodedData = {};
    if (returnData) {
      try {
        decodedData = JSON.parse(Buffer.from(returnData, 'base64').toString());
      } catch (e) {
        console.error('❌ Error decoding returnData:', e);
      }
    }

    const { userId, paymentId, planName } = decodedData;

    // Determine payment status
    const isApproved = status === 'approved' || status === '1' || status === 1;
    const isPending = status === 'pending' || status === '2' || status === 2;
    const isRejected = !isApproved && !isPending;

    const paymentStatus = isApproved ? 'completed' : isPending ? 'pending' : 'failed';

    console.log(`💳 Payment status: ${paymentStatus} for order ${orderNumber || order}`);

    // Update payment record
    if (paymentId) {
      const updateData = {
        status: paymentStatus,
        transaction_id: transaction_id || transaction_code,
        tilopay_reference: order || orderNumber,
        metadata: {
          ...callbackData,
          processed_at: new Date().toISOString()
        }
      };

      // Set paid_at timestamp if payment is completed
      if (isApproved) {
        updateData.paid_at = new Date().toISOString();
      }

      const { error: updateError } = await supabaseAdmin
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (updateError) {
        console.error('❌ Error updating payment record:', updateError);
      }
    }

    // If payment approved, update onboarding data
    if (isApproved && userId) {
      const { error: onboardingError } = await supabaseAdmin
        .from('onboarding_data')
        .update({
          payment_completed: true,
          payment_details: {
            plan: planName,
            amount: parseFloat(amount),
            currency: 'USD',
            timestamp: new Date().toISOString(),
            transactionId: transaction_id || transaction_code,
            orderNumber: orderNumber || order,
            paymentMethod: payment_method || brand,
            last4: last4,
            authCode: authCode
          }
        })
        .eq('user_id', userId);

      if (onboardingError) {
        console.error('❌ Error updating onboarding data:', onboardingError);
      } else {
        console.log('✅ Payment completed successfully for user:', userId);
      }
    }

    // Redirect user based on payment status - Step 4 is Call Scheduling
    const redirectUrl = isApproved
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/onboarding-new?step=4&payment=success`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/onboarding-new?step=3&payment=failed&message=${encodeURIComponent(message || 'Payment failed')}`;

    // If it's a webhook (POST), return JSON
    if (req.method === 'POST') {
      return res.status(200).json({
        success: isApproved,
        status: paymentStatus,
        message: message || 'Payment processed'
      });
    }

    // If it's a redirect (GET), redirect user
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('❌ Error processing Tilopay callback:', error);

    // Try to redirect to error page
    const errorUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/onboarding-new?step=4&payment=error`;

    if (req.method === 'GET') {
      return res.redirect(302, errorUrl);
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
