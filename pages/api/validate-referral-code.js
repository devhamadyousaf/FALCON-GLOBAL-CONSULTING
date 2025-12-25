import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Referral code is required' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Look up the referral code (case-insensitive)
    const { data, error } = await supabase
      .from('referral_codes')
      .select('code, discount_percentage')
      .ilike('code', code)
      .single();

    if (error || !data) {
      return res.status(200).json({
        success: false,
        valid: false,
        message: 'Invalid referral code'
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      code: data.code,
      discountPercentage: data.discount_percentage,
      message: `${data.discount_percentage}% discount applied!`
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
