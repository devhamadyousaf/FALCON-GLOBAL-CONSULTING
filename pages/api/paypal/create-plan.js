import { makeRequest } from '../../../lib/paypal-sdk';

/**
 * Create PayPal Billing Plan
 * Creates a subscription plan that can be used with PayPal buttons
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, amount, currency = 'USD', description } = req.body;

    if (!planName || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: planName, amount',
      });
    }

    // Create billing plan
    const planData = {
      product_id: `${planName.toUpperCase()}_PLAN`,
      name: `${planName} Plan - FALCON Global Consulting`,
      description: description || `Monthly subscription for ${planName} plan`,
      status: 'ACTIVE',
      billing_cycles: [
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
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: amount.toString(),
          currency_code: currency,
        },
        setup_fee_failure_action: 'CANCEL',
        payment_failure_threshold: 3,
      },
    };

    // Create plan via PayPal API
    const plan = await makeRequest('POST', '/v1/billing/plans', planData);

    return res.status(200).json({
      success: true,
      planId: plan.id,
      plan: plan,
    });

  } catch (error) {
    console.error('Error creating PayPal plan:', error);
    return res.status(500).json({
      error: 'Failed to create PayPal plan',
      message: error.message,
    });
  }
}
