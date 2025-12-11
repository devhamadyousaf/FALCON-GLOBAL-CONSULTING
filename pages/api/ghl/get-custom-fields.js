/**
 * Get Custom Fields from GoHighLevel
 * This helps us see the exact field IDs and keys that GHL expects
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const GHL_API_KEY = process.env.GHL_API_KEY || 'pit-7db6969b-6100-4f52-853e-f51bf76356c2';
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_LOCATION_ID) {
      return res.status(500).json({
        error: 'GHL_LOCATION_ID not configured',
      });
    }

    // Fetch custom fields from GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${GHL_LOCATION_ID}/customFields`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch custom fields from GHL',
        details: data,
      });
    }

    console.log('📋 Custom Fields from GHL:', JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: true,
      customFields: data,
    });

  } catch (error) {
    console.error('Error fetching GHL custom fields:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
