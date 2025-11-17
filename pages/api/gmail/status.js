import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('gmail_accounts')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch Gmail status' });
    }

    // Check if token is expired
    const tokenExpiresAt = data?.token_expires_at ? new Date(data.token_expires_at) : null;
    const isExpired = tokenExpiresAt ? tokenExpiresAt < new Date() : false;

    return res.status(200).json({
      success: true,
      connected: !!data,
      gmailAddress: data?.gmail_address,
      id: data?.id,
      access_token: data?.access_token,
      refresh_token: data?.refresh_token,
      token_expires_at: data?.token_expires_at,
      isExpired: isExpired
    });
  } catch (error) {
    console.error('Gmail status error:', error);
    return res.status(500).json({ 
      error: 'Failed to check Gmail status',
      details: error.message 
    });
  }
}
