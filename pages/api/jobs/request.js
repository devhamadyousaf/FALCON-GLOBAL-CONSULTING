export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Job Request API Called ===');
    console.log('Request body:', req.body);

    const { email, keywords, limit, location, remote, sort, platform, cities, experience, freshness } = req.body;

    // Validate required fields based on platform
    if (!email || !keywords) {
      console.error('Validation failed:', { email, keywords });
      return res.status(400).json({
        error: 'Missing required fields: email and keywords are required'
      });
    }

    // For non-Naukri platforms, location is required
    if (platform !== 'naukri' && !location) {
      console.error('Validation failed: location required for', platform);
      return res.status(400).json({
        error: 'Missing required field: location is required for this platform'
      });
    }

    // For Naukri, cities array is required
    if (platform === 'naukri' && (!cities || !Array.isArray(cities) || cities.length === 0)) {
      console.error('Validation failed: cities array required for Naukri');
      return res.status(400).json({
        error: 'Missing required field: cities array is required for Naukri platform'
      });
    }

    // Define webhook URLs for each platform
    const webhookUrls = {
      linkedin: 'https://etgstkql.rcld.app/webhook/9ce7564c-363b-477c-8c26-297e208d0806',
      indeed: 'https://etgstkql.rcld.app/webhook/2fb57d56-1fb1-4fef-ac15-fae2424f464b',
      naukri: 'https://etgstkql.rcld.app/webhook/017c1918-c18e-40cf-a49d-00aa83dfa303',
      glassdoor: 'https://etgstkql.rcld.app/webhook/04184337-755f-4fe6-9e61-2e9a513f58aa',
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

    // Prepare the request body for the webhook based on platform
    let webhookData;

    if (selectedPlatform === 'naukri') {
      // Naukri-specific format
      webhookData = {
        cities: cities, // Array of city codes
        experience: experience || 'all',
        freshness: freshness || 'all',
        keyword: keywords,
        maxJobs: parseInt(limit) || 50,
        email // Add email for identification
      };
    } else if (selectedPlatform === 'glassdoor') {
      // Glassdoor-specific format
      webhookData = {
        baseUrl: req.body.baseUrl || "https://www.glassdoor.com",
        includeNoSalaryJob: req.body.includeNoSalaryJob !== undefined ? req.body.includeNoSalaryJob : false,
        keyword: keywords,
        location: location,
        maxItems: parseInt(limit) || 10,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"]
        },
        remoteWorkType: remote === 'remote' ? true : false,
        email // Add email for identification
      };
    } else {
      // LinkedIn/Indeed format
      webhookData = {
        email,
        keywords,
        limit: parseInt(limit) || 10,
        location,
        remote: remote || 'remote',
        sort: sort || 'relevant',
        platform: selectedPlatform
      };
    }

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
