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

    // Prepare preprocessed data for Glassdoor scraper
    const preprocessedData = {
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
      email: user_email,
      platform: 'glassdoor'
    };

    console.log('Glassdoor data preprocessed successfully');

    // Return preprocessed data without calling webhook
    return res.status(200).json({
      success: true,
      message: 'Data preprocessed successfully',
      platform: 'glassdoor',
      data: preprocessedData
    });

  } catch (error) {
    console.error('Error in Glassdoor scraper:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
