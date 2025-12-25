import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Create Supabase client with user token
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  // Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }

  // Get request data
  const {
    userId,
    planName,
    originalAmount,
    finalAmount,
    referralCode,
    discountPercentage,
    email
  } = req.body;

  // Validate required fields
  if (!userId || !planName) {
    return res.status(400).json({
      success: false,
      error: 'userId and planName are required'
    });
  }

  // Verify the authenticated user matches the userId
  if (user.id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'User ID mismatch'
    });
  }

  // Verify the final amount is truly $0 or very close to $0
  if (finalAmount > 0.01) {
    return res.status(400).json({
      success: false,
      error: 'Free plan activation only allowed for $0 or near-zero amounts'
    });
  }

  // Verify referral code exists if provided
  if (referralCode) {
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('code, discount_percentage')
      .ilike('code', referralCode)
      .single();

    if (codeError || !codeData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid referral code'
      });
    }

    // Verify the discount percentage matches
    if (codeData.discount_percentage !== discountPercentage) {
      return res.status(400).json({
        success: false,
        error: 'Referral code discount mismatch'
      });
    }
  }

  // Use service role key for database operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const timestamp = new Date().toISOString();

    // Step 1: Create payment record in payments table
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount: 0,
        currency: 'USD',
        payment_method: 'other',
        status: 'completed',
        plan: planName,
        paid_at: timestamp,
        metadata: {
          paymentType: 'FREE_PLAN',
          originalAmount: originalAmount || 0,
          referralCode: referralCode || null,
          discountPercentage: discountPercentage || null,
          isFree: true,
          email: email
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw paymentError;
    }

    console.log('✅ Payment record created:', paymentData.id);

    // Step 2: Update onboarding_data table to mark payment as completed
    // Using payment_details JSONB column to match existing Tilopay callback structure
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('onboarding_data')
      .update({
        payment_completed: true,
        payment_details: {
          plan: planName,
          amount: 0,
          originalAmount: originalAmount || 0,
          currency: 'USD',
          timestamp: timestamp,
          paymentMethod: 'FREE_PLAN',
          referralCode: referralCode || null,
          discountPercentage: discountPercentage || null,
          isFree: true,
          paymentId: paymentData.id
        }
      })
      .eq('user_id', userId)
      .select();

    if (updateError) {
      console.error('Error updating onboarding_data:', updateError);
      throw updateError;
    }

    // Log the free plan activation for audit trail
    console.log('✅ Free plan activated:', {
      userId,
      planName,
      originalAmount,
      referralCode,
      discountPercentage,
      paymentId: paymentData.id,
      timestamp
    });

    return res.status(200).json({
      success: true,
      message: 'Free plan activated successfully',
      data: {
        userId,
        planName,
        paymentAmount: 0,
        referralCode,
        discountPercentage,
        paymentId: paymentData.id
      }
    });
  } catch (error) {
    console.error('Error activating free plan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to activate free plan'
    });
  }
}
