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
 * Capture payment using payment method token
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, paymentTokenId, amount, currency = 'USD' } = req.body;

    if (!paymentId || !paymentTokenId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: paymentId, paymentTokenId, amount',
      });
    }

    // Get payment record
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

    // Create order with payment token
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
          description: `${payment.plan} Plan - FALCON Global Consulting`,
          custom_id: payment.order_number,
          invoice_id: payment.order_number,
        },
      ],
      payment_source: {
        token: {
          id: paymentTokenId,
          type: 'PAYMENT_METHOD_TOKEN',
        },
      },
      application_context: {
        brand_name: 'FALCON Global Consulting',
        user_action: 'PAY_NOW',
      },
    };

    const createOrderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${payment.order_number}-capture`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await createOrderResponse.json();

    if (!createOrderResponse.ok) {
      console.error('PayPal create order error:', orderData);
      return res.status(500).json({
        error: 'Failed to create PayPal order',
        details: orderData,
      });
    }

    // Capture the order
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderData.id}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `${payment.order_number}-capture-confirm`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('PayPal capture error:', captureData);
      return res.status(500).json({
        error: 'Failed to capture PayPal payment',
        details: captureData,
      });
    }

    // Extract capture ID
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (!captureId) {
      console.error('No capture ID found in response:', captureData);
      return res.status(500).json({
        error: 'No capture ID returned from PayPal',
        details: captureData,
      });
    }

    return res.status(200).json({
      success: true,
      orderId: orderData.id,
      captureId: captureId,
      captureData: captureData,
      paymentId: payment.id,
    });

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
