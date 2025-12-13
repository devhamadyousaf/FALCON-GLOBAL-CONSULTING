export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Job Request API Called ===');
    console.log('Request body:', req.body);

    const { email, keywords, limit, location, remote, sort, platform } = req.body;

    // Validate required fields
    if (!email || !keywords || !location) {
      console.error('Validation failed:', { email, keywords, location });
      return res.status(400).json({
        error: 'Missing required fields: email, keywords, and location are required'
      });
    }

    // Define webhook URLs for each platform
    const webhookUrls = {
      linkedin: 'https://etgstkql.rcld.app/webhook/9ce7564c-363b-477c-8c26-297e208d0806',
      indeed: 'https://etgstkql.rcld.app/webhook/2fb57d56-1fb1-4fef-ac15-fae2424f464b',
      naukri: 'https://etgstkql.rcld.app/webhook/naukri-webhook-id', // TODO: Add actual webhook URL
      bayt: 'https://etgstkql.rcld.app/webhook/bayt-webhook-id' // TODO: Add actual webhook URL
    };

    // Get the webhook URL based on platform
    const selectedPlatform = platform || 'linkedin';
    const webhookUrl = webhookUrls[selectedPlatform];

    if (!webhookUrl) {
      return res.status(400).json({
        error: `Invalid platform: ${selectedPlatform}`
      });
    }

    // Prepare the request body for the webhook
    const webhookData = {
      email,
      keywords,
      limit: parseInt(limit) || 10,
      location,
      remote: remote || 'remote',
      sort: sort || 'relevant',
      platform: selectedPlatform
    };

    console.log('Sending job request to webhook:', webhookData);
    console.log('Webhook URL:', webhookUrl);

    // Make the request to the external webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    console.log('Webhook response status:', response.status);

    // Try to get response text first
    const responseText = await response.text();
    console.log('Webhook response text:', responseText);

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.log('Response is not JSON, using text response');
      data = { message: responseText };
    }

    if (!response.ok) {
      console.error('Webhook error:', data);
      throw new Error(`Webhook returned ${response.status}: ${responseText}`);
    }

    console.log('Webhook success:', data);

    return res.status(200).json({ 
      success: true, 
      message: 'Job request submitted successfully',
      data 
    });

  } catch (error) {
    console.error('=== Error in job request API ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to submit job request',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
