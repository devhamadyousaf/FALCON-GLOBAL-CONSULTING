import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  console.log('=== Gmail Callback Started ===');
  console.log('Method:', req.method);
  console.log('Full URL:', req.url);
  console.log('Query params:', req.query);
  
  if (req.method !== 'GET') {
    console.log('❌ Method not allowed');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state: userEmail, error } = req.query;
    
    console.log('Parsed params:');
    console.log('- Code:', code ? `${code.substring(0, 20)}...` : 'MISSING');
    console.log('- User Email (state):', userEmail || 'MISSING');
    console.log('- Error:', error || 'none');

    if (error) {
      console.log('❌ OAuth error received:', error);
      return res.redirect(`/dashboard/customer?gmail_error=${error}`);
    }

    if (!code || !userEmail) {
      console.log('❌ Missing required parameters');
      console.log('- Code present:', !!code);
      console.log('- User email present:', !!userEmail);
      return res.redirect('/dashboard/customer?gmail_error=missing_code');
    }

    // Exchange code for tokens
    const clientId = '76237042709-h892133umqi54o5cnbq56tgdsl5ojglk.apps.googleusercontent.com';
    const clientSecret = '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';
    const redirectUri = 'http://localhost:3000/api/gmail/callback';

    console.log('🔄 Exchanging code for tokens...');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', tokenResponse.ok ? '✅ Success' : '❌ Failed');
    
    if (!tokenResponse.ok) {
      console.error('❌ Token exchange error details:', JSON.stringify(tokens, null, 2));
      return res.redirect(`/dashboard/customer?gmail_error=token_exchange_failed&details=${tokens.error || 'unknown'}`);
    }
    
    console.log('✅ Tokens received successfully');
    console.log('- Access token:', tokens.access_token ? 'present' : 'MISSING');
    console.log('- Refresh token:', tokens.refresh_token ? 'present' : 'MISSING');
    console.log('- Expires in:', tokens.expires_in);

    // Get user's Gmail address
    console.log('🔄 Fetching user info...');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    console.log('✅ User info received:', userInfo.email);

    // Save tokens to database
    console.log('🔄 Saving to database...');
    console.log('- User email:', userEmail);
    console.log('- Gmail address:', userInfo.email);
    
    const { data, error: dbError } = await supabaseAdmin
      .from('gmail_accounts')
      .upsert({
        user_email: userEmail,
        gmail_address: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_email'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', JSON.stringify(dbError, null, 2));
      return res.redirect(`/dashboard/customer?gmail_error=db_save_failed&details=${dbError.message}`);
    }

    console.log('✅ Gmail account connected successfully:', data);
    console.log('=== Gmail Callback Completed Successfully ===');
    
    // Redirect with tokens in URL parameters (will be removed from history immediately)
    const redirectUrl = `/dashboard/customer?gmail_success=true&access_token=${encodeURIComponent(tokens.access_token)}&refresh_token=${encodeURIComponent(tokens.refresh_token)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Gmail callback error:', error);
    console.error('Error stack:', error.stack);
    return res.redirect(`/dashboard/customer?gmail_error=callback_failed&details=${error.message}`);
  }
}
