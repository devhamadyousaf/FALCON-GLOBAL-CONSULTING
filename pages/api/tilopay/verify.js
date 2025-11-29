import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, userId, orderNumber } = req.body;

    // Validate request
    if (!paymentId && !orderNumber) {
      return res.status(400).json({
        error: 'Missing required fields: paymentId or orderNumber'
      });
    }

    // Query payment record from database
    let query = supabaseAdmin.from('payments').select('*');

    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: payment, error: dbError } = await query.single();

    if (dbError || !payment) {
      console.error('❌ Payment not found:', dbError);
      return res.status(404).json({
        error: 'Payment not found',
        details: dbError?.message
      });
    }

    // Return payment status
    const response = {
      success: payment.status === 'completed',
      status: payment.status,
      paymentId: payment.id,
      amount: payment.amount,
      plan: payment.plan,
      orderNumber: payment.order_number,
      transactionId: payment.transaction_id,
      tilopayReference: payment.tilopay_reference,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    };

    // If payment is still pending and it's been more than 10 minutes, mark as abandoned
    const paymentAge = new Date() - new Date(payment.created_at);
    const tenMinutes = 10 * 60 * 1000;

    if (payment.status === 'pending' && paymentAge > tenMinutes) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'abandoned' })
        .eq('id', payment.id);

      response.status = 'abandoned';
      response.success = false;
    }

    console.log('🔍 Payment verification:', {
      paymentId: payment.id,
      status: response.status,
      amount: payment.amount
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
