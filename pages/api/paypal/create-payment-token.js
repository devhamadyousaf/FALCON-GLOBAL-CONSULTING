import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * Create payment method token after buyer approval
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { setupTokenId, paymentId } = req.body;

    if (!setupTokenId || !paymentId) {
      return res.status(400).json({
        error: 'Missing required fields: setupTokenId, paymentId',
      });
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create payment method token
    const paymentTokenPayload = {
      payment_source: {
        token: {
          id: setupTokenId,
          type: 'SETUP_TOKEN',
        },
      },
    };

    const paymentTokenResponse = await fetch(`${PAYPAL_API_BASE}/v3/vault/payment-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${payment.order_number}-token`,
      },
      body: JSON.stringify(paymentTokenPayload),
    });

    const paymentTokenData = await paymentTokenResponse.json();

    if (!paymentTokenResponse.ok) {
      console.error('PayPal payment token error:', paymentTokenData);
      return res.status(500).json({
        error: 'Failed to create PayPal payment token',
        details: paymentTokenData,
      });
    }

    // Update payment record with payment token
    await supabase
      .from('payments')
      .update({
        transaction_id: paymentTokenData.id,
        paypal_reference: paymentTokenData.id,
        metadata: {
          ...payment.metadata,
          paymentTokenId: paymentTokenData.id,
          paymentTokenStatus: paymentTokenData.status,
          customerId: paymentTokenData.customer?.id,
          paymentSourceDetails: paymentTokenData.payment_source,
        },
      })
      .eq('id', paymentId);

    return res.status(200).json({
      success: true,
      paymentTokenId: paymentTokenData.id,
      paymentId: payment.id,
      tokenData: paymentTokenData,
    });

  } catch (error) {
    console.error('Error creating PayPal payment token:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
