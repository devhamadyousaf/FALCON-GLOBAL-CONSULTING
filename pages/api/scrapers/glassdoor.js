export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Glassdoor Scraper API Called ===');
    console.log('Request body:', req.body);

    const {
      user_email,
      keywords,
      location,
      limit = 10,
      baseUrl = 'https://www.glassdoor.com',
      includeNoSalaryJob = false,
      remoteWorkType = false,
      remote
    } = req.body;

    // Validate required fields
    if (!user_email || !keywords || !location) {
      console.error('Validation failed:', { user_email, keywords, location });
      return res.status(400).json({
        error: 'Missing required fields: user_email, keywords, and location are required'
      });
    }

    // Prepare webhook data for Glassdoor scraper
    const webhookData = {
      baseUrl,
      includeNoSalaryJob,
      keyword: keywords,
      location,
      maxItems: parseInt(limit),
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']
      },
      remoteWorkType: remote === 'remote' || remoteWorkType,
      email: user_email
    };

    // Send to n8n webhook
    const webhookUrl = 'https://etgstkql.rcld.app/webhook/04184337-755f-4fe6-9e61-2e9a513f58aa';

    console.log('Sending to Glassdoor webhook:', webhookUrl);
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

    console.log('Glassdoor scraping initiated successfully');

    return res.status(200).json({
      success: true,
      message: 'Job scraping initiated successfully',
      platform: 'glassdoor',
      data: webhookResult
    });

  } catch (error) {
    console.error('Error in Glassdoor scraper:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
