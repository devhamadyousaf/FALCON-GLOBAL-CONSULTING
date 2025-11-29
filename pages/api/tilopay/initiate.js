import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TILOPAY_API_KEY = process.env.TILOPAY_API_KEY;
const TILOPAY_API_USER = process.env.TILOPAY_API_USER;
const TILOPAY_API_PASSWORD = process.env.TILOPAY_API_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      amount,
      planName,
      email,
      firstName,
      lastName,
      currency = 'USD',
      address = '',
      city = '',
      state = '',
      country = 'CR',
      phone = ''
    } = req.body;

    // Validate required fields
    if (!userId || !amount || !planName || !email || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, planName, email, firstName, lastName'
      });
    }

    // Validate API credentials
    if (!TILOPAY_API_KEY || !TILOPAY_API_USER || !TILOPAY_API_PASSWORD) {
      console.error('❌ Tilopay API credentials not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Generate unique order number
    const orderNumber = `FGC-${Date.now()}-${userId.substring(0, 8)}`;

    // Create payment record in database
    const { data: paymentRecord, error: dbError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: currency,
        plan: planName,
        payment_method: 'tilopay',
        status: 'pending',
        order_number: orderNumber,
        order_id: orderNumber, // Also set order_id for consistency with existing schema
        metadata: {
          initiated_at: new Date().toISOString(),
          email,
          firstName,
          lastName,
          planName
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error creating payment record:', dbError);

      // Check if error is due to missing columns
      if (dbError.message && dbError.message.includes('order_number')) {
        return res.status(500).json({
          error: 'Database migration required',
          message: 'Please run the SQL migration in RUN_THIS_FIRST.md to add required columns (order_number, tilopay_reference, plan)',
          details: dbError.message
        });
      }

      return res.status(500).json({
        error: 'Failed to create payment record',
        message: dbError.message || 'Database error occurred'
      });
    }

    // Prepare Tilopay initialization data
    const tilopayConfig = {
      token: TILOPAY_API_KEY,
      currency: currency,
      language: 'en',
      amount: parseFloat(amount),
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: address || 'N/A',
      billToAddress2: '',
      billToCity: city || 'N/A',
      billToState: state || '',
      billToZipPostCode: '',
      billToCountry: country,
      billToTelephone: phone || '',
      billToEmail: email,
      orderNumber: orderNumber,
      capture: 1,
      redirect: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tilopay/callback`,
      subscription: 0,
      hashVersion: 'V2',
      returnData: Buffer.from(JSON.stringify({
        userId: userId,
        paymentId: paymentRecord.id,
        planName: planName
      })).toString('base64')
    };

    console.log('✅ Payment initiated:', {
      orderId: orderNumber,
      amount: amount,
      plan: planName,
      userId: userId
    });

    // Return configuration for client-side SDK
    return res.status(200).json({
      success: true,
      paymentId: paymentRecord.id,
      orderNumber: orderNumber,
      tilopayConfig: tilopayConfig,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('❌ Error initiating Tilopay payment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
