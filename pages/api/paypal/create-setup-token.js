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
 * Create PayPal setup token for recurring payments
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
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
    } = req.body;

    // Validate required fields
    if (!userId || !email || !amount || !planName) {
      return res.status(400).json({
        error: 'Missing required fields: userId, email, amount, planName',
      });
    }

    // Create payment record in database
    const orderNumber = `FGC-PP-${Date.now()}-${userId.substring(0, 8)}`;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: currency,
        payment_method: 'paypal',
        status: 'pending',
        order_number: orderNumber,
        plan: planName.toLowerCase(),
        metadata: {
          email,
          firstName,
          lastName,
          address,
          city,
          state,
          country,
          phone,
          paymentType: 'recurring',
          initiatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return res.status(500).json({ error: 'Failed to create payment record' });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Determine billing cycle based on plan
    const billingCycles = [
      {
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 12,
        pricing_scheme: {
          fixed_price: {
            value: amount.toString(),
            currency_code: currency,
          },
        },
      },
    ];

    // Create setup token with PayPal
    const setupTokenPayload = {
      payment_source: {
        paypal: {
          description: `${planName} Plan - FALCON Global Consulting`,
          usage_pattern: 'RECURRING',
          usage_type: 'MERCHANT',
          customer_type: 'CONSUMER',
          permit_multiple_payment_tokens: false,
          billing_plan: {
            name: `${planName} Subscription`,
            description: `Monthly subscription for ${planName} plan`,
            billing_cycles: billingCycles,
            payment_preferences: {
              auto_bill_outstanding: true,
              setup_fee: {
                value: amount.toString(),
                currency_code: currency,
              },
              setup_fee_failure_action: 'CANCEL',
              payment_failure_threshold: 3,
            },
          },
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'FALCON Global Consulting',
            locale: 'en-US',
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paypal/callback?paymentId=${payment.id}&orderNumber=${orderNumber}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding-new?step=3&payment=cancelled`,
          },
        },
      },
    };

    const setupTokenResponse = await fetch(`${PAYPAL_API_BASE}/v3/vault/setup-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': orderNumber,
      },
      body: JSON.stringify(setupTokenPayload),
    });

    const setupTokenData = await setupTokenResponse.json();

    if (!setupTokenResponse.ok) {
      console.error('PayPal setup token error:', setupTokenData);
      return res.status(500).json({
        error: 'Failed to create PayPal setup token',
        details: setupTokenData,
      });
    }

    // Update payment record with setup token
    await supabase
      .from('payments')
      .update({
        metadata: {
          ...payment.metadata,
          setupTokenId: setupTokenData.id,
          setupTokenStatus: setupTokenData.status,
        },
      })
      .eq('id', payment.id);

    // Get approval URL
    const approvalLink = setupTokenData.links?.find(link => link.rel === 'approve');

    return res.status(200).json({
      success: true,
      setupTokenId: setupTokenData.id,
      paymentId: payment.id,
      orderNumber: orderNumber,
      approvalUrl: approvalLink?.href,
      paymentData: setupTokenData,
    });

  } catch (error) {
    console.error('Error creating PayPal setup token:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
