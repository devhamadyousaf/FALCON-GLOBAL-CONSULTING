export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Bayt Scraper API Called ===');
    console.log('Request body:', req.body);

    const {
      user_email,
      keywords,
      location,
      limit = 10,
      remote = 'remote',
      sort = 'relevant'
    } = req.body;

    // Validate required fields
    if (!user_email || !keywords || !location) {
      console.error('Validation failed:', { user_email, keywords, location });
      return res.status(400).json({
        error: 'Missing required fields: user_email, keywords, and location are required'
      });
    }

    // Prepare webhook data (n8n handles the scraping)
    const webhookData = {
      email: user_email,
      keywords,
      limit: parseInt(limit),
      location,
      remote,
      sort,
      platform: 'bayt'
    };

    // Send to n8n webhook
    const webhookUrl = 'https://etgstkql.rcld.app/webhook/5ab28852-8ba9-4fac-a012-ea4f0cc433d0';

    console.log('Sending to Bayt webhook:', webhookUrl);
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', webhookResponse.status);
      return res.status(500).json({
        error: 'Failed to initiate job scraping',
        details: `Webhook returned status ${webhookResponse.status}`
      });
    }

    const responseText = await webhookResponse.text();
    console.log('Webhook response:', responseText);

    let webhookResult = {};
    try {
      webhookResult = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse webhook response:', e);
      webhookResult = { message: responseText };
    }

    console.log('Bayt scraping initiated successfully');

    return res.status(200).json({
      success: true,
      message: 'Job scraping initiated successfully',
      platform: 'bayt',
      data: webhookResult
    });

  } catch (error) {
    console.error('Error in Bayt scraper:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
