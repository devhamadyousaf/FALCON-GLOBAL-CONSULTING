export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== LinkedIn Scraper API Called ===');
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

    // Prepare preprocessed data
    const preprocessedData = {
      email: user_email,
      keywords,
      limit: parseInt(limit),
      location,
      remote,
      sort,
      platform: 'linkedin'
    };

    console.log('LinkedIn data preprocessed successfully');

    // Return preprocessed data without calling webhook
    return res.status(200).json({
      success: true,
      message: 'Data preprocessed successfully',
      platform: 'linkedin',
      data: preprocessedData
    });

  } catch (error) {
    console.error('Error in LinkedIn scraper:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
