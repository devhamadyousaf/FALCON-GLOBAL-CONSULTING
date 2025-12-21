import naukriCityMapping from '@/lib/naukri-city-mapping.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Naukri Scraper API Called ===');
    console.log('Request body:', req.body);

    const {
      user_email,
      keywords,
      cities = [],
      limit = 50,
      experience = 'all',
      freshness = 'all'
    } = req.body;

    // Validate required fields
    if (!user_email || !keywords || !Array.isArray(cities) || cities.length === 0) {
      console.error('Validation failed:', { user_email, keywords, cities });
      return res.status(400).json({
        error: 'Missing required fields: user_email, keywords, and cities array (with city names or codes) are required'
      });
    }

    // Convert city names to city codes
    const cityCodes = cities.map(city => {
      // If already a number/code, return as-is
      if (!isNaN(city)) {
        return String(city);
      }
      
      // Case-insensitive lookup
      const cityKey = Object.keys(naukriCityMapping).find(
        key => key.toLowerCase() === city.toLowerCase()
      );
      
      if (cityKey) {
        return naukriCityMapping[cityKey];
      }
      
      // If not found, check if it matches a country (e.g., "USA" -> "United States (USA)")
      if (city.toLowerCase() === 'usa' || city.toLowerCase() === 'united states') {
        return naukriCityMapping['United States (USA)'];
      }
      
      console.warn(`City not found in mapping: ${city}, using as-is`);
      return city;
    });

    console.log('Original cities:', cities);
    console.log('Converted city codes:', cityCodes);

    // Prepare webhook data (Naukri-specific format with city codes)
    const webhookData = {
      cities: cityCodes,
      experience: experience,
      freshness: freshness,
      keyword: keywords,
      maxJobs: parseInt(limit),
      email: user_email
    };

    // Send to n8n webhook
    const webhookUrl = 'https://etgstkql.rcld.app/webhook/017c1918-c18e-40cf-a49d-00aa83dfa303';

    console.log('Sending to Naukri webhook:', webhookUrl);
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

    console.log('Naukri scraping initiated successfully');

    return res.status(200).json({
      success: true,
      message: 'Job scraping initiated successfully',
      platform: 'naukri',
      citiesConverted: {
        input: cities,
        codes: cityCodes
      },
      data: webhookResult
    });

  } catch (error) {
    console.error('Error in Naukri scraper:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
