export default async function handler(req, res) {
  console.log('=== Gmail Connect Started ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.query;
    console.log('User email:', email);

    if (!email) {
      console.log('❌ Email missing');
      return res.status(400).json({ error: 'Email is required' });
    }

    // Gmail OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;
    
    console.log('OAuth Config:');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);
    
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    console.log('- Scopes:', scopes);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: email, // Pass user email in state
    })}`;

    console.log('✅ Auth URL generated');
    console.log('Full URL:', authUrl);
    console.log('=== Gmail Connect Completed ===');
    
    return res.status(200).json({ success: true, authUrl });
  } catch (error) {
    console.error('❌ Gmail connect error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to generate auth URL',
      details: error.message 
    });
  }
}
