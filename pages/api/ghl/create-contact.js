/**
 * GoHighLevel (GHL) Contact Creation API
 * Creates a new contact in GHL from lead form submission
 *
 * Documentation: https://marketplace.gohighlevel.com/docs/ghl/contacts/create-contact/
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      currentCountry,
      jobTitle,
      willingToInvest,
      targetCountries,
      roleType,
      relocationType,
      timeline,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, phone',
      });
    }

    // GoHighLevel API configuration
    const GHL_API_KEY = process.env.GHL_API_KEY || 'pit-7db6969b-6100-4f52-853e-f51bf76356c2';
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID; // REQUIRED: Your GHL Location ID

    // Check if Location ID is configured
    if (!GHL_LOCATION_ID) {
      console.error('❌ GHL_LOCATION_ID not configured in environment variables');
      return res.status(500).json({
        error: 'GoHighLevel Location ID not configured. Please add GHL_LOCATION_ID to your environment variables.',
        hint: 'Find your Location ID in GHL Dashboard → Settings → Business Profile',
      });
    }

    const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

    // Prepare custom fields mapping
    const customFields = [];

    // Map form fields to GHL custom fields
    if (currentCountry) {
      customFields.push({
        key: 'current_country',
        field_value: currentCountry,
      });
    }

    if (jobTitle) {
      customFields.push({
        key: 'job_title',
        field_value: jobTitle,
      });
    }

    if (willingToInvest) {
      customFields.push({
        key: 'willing_to_invest',
        field_value: willingToInvest,
      });
    }

    if (targetCountries) {
      customFields.push({
        key: 'target_countries',
        field_value: targetCountries,
      });
    }

    if (roleType) {
      customFields.push({
        key: 'role_type',
        field_value: roleType,
      });
    }

    if (relocationType) {
      customFields.push({
        key: 'relocation_type',
        field_value: relocationType,
      });
    }

    if (timeline) {
      customFields.push({
        key: 'timeline',
        field_value: timeline,
      });
    }

    // Prepare GHL contact payload
    const contactPayload = {
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      locationId: GHL_LOCATION_ID, // REQUIRED: Location ID
      source: 'Lead Application Form',
      customFields: customFields,
      tags: [
        'Lead Form',
        'Website Application',
        willingToInvest === 'yes' ? 'Ready to Invest' : 'Needs Nurturing',
      ],
    };

    console.log('Creating GHL contact with payload:', JSON.stringify(contactPayload, null, 2));

    // Make request to GoHighLevel API
    const response = await fetch(GHL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28', // GHL API version
      },
      body: JSON.stringify(contactPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('GHL API Error:', responseData);

      // Provide helpful error messages
      let errorMessage = 'Failed to create contact in GoHighLevel';
      let errorHint = '';

      if (response.status === 403) {
        errorMessage = 'Access denied to GoHighLevel location';
        errorHint = 'Check that your GHL_LOCATION_ID is correct and the API key has access to this location.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid GoHighLevel API key';
        errorHint = 'Verify your GHL_API_KEY in environment variables.';
      }

      return res.status(response.status).json({
        error: errorMessage,
        hint: errorHint,
        details: responseData,
      });
    }

    console.log('✅ GHL Contact created successfully:', responseData);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Contact created successfully',
      contactId: responseData.contact?.id,
      data: responseData,
    });

  } catch (error) {
    console.error('Error creating GHL contact:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
