const TILOPAY_API_KEY = process.env.TILOPAY_API_KEY;
const TILOPAY_API_USER = process.env.TILOPAY_API_USER;
const TILOPAY_API_PASSWORD = process.env.TILOPAY_API_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'USD', orderNumber } = req.body;

    // Validate API credentials
    if (!TILOPAY_API_KEY || !TILOPAY_API_USER || !TILOPAY_API_PASSWORD) {
      console.error('❌ Tilopay API credentials not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    console.log('🔄 Requesting SDK token from Tilopay...');

    // Call Tilopay loginSdk API to get SDK token
    const response = await fetch('https://app.tilopay.com/api/v1/loginSdk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiuser: TILOPAY_API_USER,
        password: TILOPAY_API_PASSWORD,
        key: TILOPAY_API_KEY
      })
    });

    const data = await response.json();

    console.log('✅ SDK token response:', data);

    if (response.ok && data && data.access_token) {
      return res.status(200).json({
        success: true,
        token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      });
    } else {
      throw new Error('Invalid response from Tilopay API: ' + JSON.stringify(data));
    }

  } catch (error) {
    console.error('❌ Error getting Tilopay SDK token:', error.message);
    return res.status(500).json({
      error: 'Failed to get SDK token',
      message: error.message
    });
  }
}
