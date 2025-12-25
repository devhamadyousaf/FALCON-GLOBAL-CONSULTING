import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper function to generate random 5-char alphanumeric code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req, res) {
  // Verify admin authentication
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

  // Verify user is admin
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  // Use service role key for actual operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // GET - Fetch all referral codes
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST - Create new referral code
  if (req.method === 'POST') {
    const { discountPercentage } = req.body;

    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Discount percentage must be between 0 and 100'
      });
    }

    try {
      // Generate unique code
      let code;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        code = generateReferralCode();

        // Check if code already exists
        const { data: existing } = await supabaseAdmin
          .from('referral_codes')
          .select('code')
          .eq('code', code)
          .single();

        if (!existing) break; // Code is unique
        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique code');
      }

      // Insert new referral code
      const { data, error } = await supabaseAdmin
        .from('referral_codes')
        .insert({
          code,
          discount_percentage: discountPercentage
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data,
        message: 'Referral code created successfully'
      });
    } catch (error) {
      console.error('Error creating referral code:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE - Delete referral code
  if (req.method === 'DELETE') {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Code is required' });
    }

    try {
      const { error } = await supabaseAdmin
        .from('referral_codes')
        .delete()
        .eq('code', code);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Referral code deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting referral code:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
