import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🔄 Refreshing token for:', email);

    // Get current refresh token from database
    const { data: gmailAccount, error: fetchError } = await supabaseAdmin
      .from('gmail_accounts')
      .select('refresh_token, gmail_address, id')
      .eq('user_email', email)
      .single();

    if (fetchError || !gmailAccount) {
      console.error('❌ No Gmail account found:', fetchError);
      return res.status(404).json({ error: 'Gmail account not found' });
    }

    if (!gmailAccount.refresh_token) {
      console.error('❌ No refresh token available');
      return res.status(400).json({ error: 'No refresh token available' });
    }

    console.log('🔑 Using refresh token to get new access token...');

    // Exchange refresh token for new access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: gmailAccount.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token refresh failed:', errorText);
      return res.status(400).json({
        error: 'Failed to refresh token',
        details: errorText
      });
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('❌ No access token in response');
      return res.status(400).json({ error: 'No access token received' });
    }

    // Calculate new expiry time (tokens.expires_in is in seconds)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    console.log('✅ New access token received, expires at:', expiresAt);

    // Update database with new access token
    const { error: updateError } = await supabaseAdmin
      .from('gmail_accounts')
      .update({
        access_token: tokens.access_token,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', email);

    if (updateError) {
      console.error('❌ Failed to update token in database:', updateError);
      return res.status(500).json({ error: 'Failed to save new token' });
    }

    console.log('✅ Token refreshed successfully');

    return res.status(200).json({
      success: true,
      access_token: tokens.access_token,
      expires_at: expiresAt.toISOString(),
      gmail_address: gmailAccount.gmail_address,
      gmail_account_id: gmailAccount.id,
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return res.status(500).json({
      error: 'Failed to refresh token',
      details: error.message
    });
  }
}
