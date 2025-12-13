/**
 * GoHighLevel (GHL) Contact Creation API
 * Creates a new contact in GHL from lead form submission
 *
 * Documentation: https://marketplace.gohighlevel.com/docs/ghl/contacts/create-contact/
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set to 10MB to handle CV uploads
    },
  },
};

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
      cvFileUrl,
      currentCountry,
      jobTitle,
      yearsOfExperience,
      willingToInvest,
      targetCountries,
      englishLevel,
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

    // Step 1: Fetch custom fields to get their IDs
    console.log('📋 Fetching custom fields from GHL...');
    const customFieldsResponse = await fetch(
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

    const customFieldsData = await customFieldsResponse.json();

    if (!customFieldsResponse.ok) {
      console.error('❌ Failed to fetch custom fields:', customFieldsData);
      return res.status(500).json({
        error: 'Failed to fetch custom fields from GHL',
        details: customFieldsData,
      });
    }

    console.log('✅ Custom fields fetched:', JSON.stringify(customFieldsData, null, 2));

    // Create a map of field keys to field IDs
    const fieldKeyToId = {};
    if (customFieldsData.customFields && Array.isArray(customFieldsData.customFields)) {
      customFieldsData.customFields.forEach(field => {
        // GHL returns fieldKey as "contact.current_country"
        // We need to map both with and without the contact. prefix
        const fieldKey = field.fieldKey || field.key;

        // Store with contact. prefix (e.g., "contact.current_country")
        fieldKeyToId[fieldKey] = field.id;

        // Also store without prefix (e.g., "current_country")
        if (fieldKey && fieldKey.startsWith('contact.')) {
          const keyWithoutPrefix = fieldKey.replace('contact.', '');
          fieldKeyToId[keyWithoutPrefix] = field.id;
        }
      });
    }

    console.log('🗺️  Field Key to ID mapping:', fieldKeyToId);

    // Helper function to map form values to GHL display labels
    const mapValueToLabel = (field, value) => {
      const mappings = {
        willingToInvest: {
          'yes': 'Yes, I am aware and financially ready',
          'no': 'No, I am not in a position to invest',
          'maybe': 'Maybe, I need more information about costs',
        },
        englishLevel: {
          '1': '1 - No English skills',
          '2': '2 - Very basic',
          '3': '3 - Basic',
          '4': '4 - Elementary',
          '5': '5 - Intermediate',
          '6': '6 - Upper intermediate',
          '7': '7 - Advanced',
          '8': '8 - Very advanced',
          '9': '9 - Near native',
          '10': '10 - Native English speaker',
        },
        relocationType: {
          'alone': 'By myself',
          'with_family': 'With my family',
          'undecided': 'Not sure yet',
        },
        timeline: {
          '1-3_months': '1-3 months',
          '3-6_months': '3-6 months',
          '6-12_months': '6-12 months',
          '12+_months': '12+ months',
          'flexible': 'Flexible / Not sure',
        },
      };

      return mappings[field]?.[value] || value;
    };

    // Step 2: Prepare custom fields mapping using IDs
    // GHL requires custom field ID, not the key
    const customFields = [];

    // Helper to add custom field if ID exists
    const addCustomField = (fieldKey, value) => {
      const fieldId = fieldKeyToId[fieldKey];
      if (fieldId && value) {
        customFields.push({
          id: fieldId,
          field_value: value,
        });
      } else if (!fieldId) {
        console.warn(`⚠️  Custom field "${fieldKey}" not found in GHL`);
      }
    };

    // Question 5: Current Country
    addCustomField('current_country', currentCountry);

    // Question 6: Job Title
    addCustomField('job_title', jobTitle);

    // Question 7: Years of Experience
    addCustomField('years_of_experience', yearsOfExperience);

    // Question 8: Financial Investment (mapped to display label)
    addCustomField('financial_investment_readiness', mapValueToLabel('willingToInvest', willingToInvest));

    // Question 9: Target Countries
    addCustomField('target_countries', targetCountries);

    // Question 10: English Level (mapped to display label)
    addCustomField('english_level', mapValueToLabel('englishLevel', englishLevel));

    // Question 11: Role Type
    addCustomField('role_type', roleType);

    // Question 12: Relocation Type (mapped to display label)
    addCustomField('relocation_type', mapValueToLabel('relocationType', relocationType));

    // Question 13: Timeline (mapped to display label)
    addCustomField('expected_timeline', mapValueToLabel('timeline', timeline));

    // Add CV URL to custom fields if provided (already uploaded via /api/ghl/upload-file)
    if (cvFileUrl) {
      addCustomField('cv', cvFileUrl);
      console.log('📎 CV URL added to custom field "cv":', cvFileUrl);
    }

    // Prepare GHL contact payload
    const contactPayload = {
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      companyName: jobTitle, // Job Title saved as Company Name (standard GHL field)
      locationId: GHL_LOCATION_ID, // REQUIRED: Location ID
      source: 'Lead Application Form',
      customFields: customFields,
      tags: [
        'Lead Form',
        'Website Application',
        willingToInvest === 'yes' ? 'Ready to Invest' : 'Needs Nurturing',
        cvFileUrl ? 'CV Uploaded' : 'No CV',
      ],
    };

    console.log('🔍 DEBUG: Creating GHL contact');
    console.log('📊 Form Data Received:', { firstName, lastName, email, phone, jobTitle, currentCountry, yearsOfExperience, willingToInvest, targetCountries, englishLevel, roleType, relocationType, timeline });
    console.log('📤 Custom Fields Being Sent:', JSON.stringify(customFields, null, 2));
    console.log('📦 Full Payload:', JSON.stringify(contactPayload, null, 2));

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

    console.log('🔥 GHL API Response Status:', response.status);
    console.log('📥 GHL Response Data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ GHL API Error:', responseData);

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
