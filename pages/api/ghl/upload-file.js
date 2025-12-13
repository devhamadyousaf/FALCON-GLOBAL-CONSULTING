/**
 * GoHighLevel File Upload API
 * Uploads a file to GHL Media Library
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
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName || !fileType) {
      return res.status(400).json({
        error: 'Missing required fields: fileData, fileName, and fileType',
      });
    }

    // GoHighLevel API configuration
    const GHL_API_KEY = process.env.GHL_API_KEY || 'pit-7db6969b-6100-4f52-853e-f51bf76356c2';
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_LOCATION_ID) {
      return res.status(500).json({
        error: 'GoHighLevel Location ID not configured',
      });
    }

    console.log('📎 Uploading file to GHL:', fileName);

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');

    // Create FormData for file upload
    const FormData = require('form-data');
    const formData = new FormData();

    // GHL expects 'file' field for direct file upload
    formData.append('file', buffer, {
      filename: fileName,
      contentType: fileType,
    });

    // Add locationId to the form data
    formData.append('locationId', GHL_LOCATION_ID);

    console.log('📤 Uploading to GHL with locationId:', GHL_LOCATION_ID);

    // Use axios for better FormData handling
    const axios = require('axios');

    const uploadResponse = await axios.post(
      'https://services.leadconnectorhq.com/medias/upload-file',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const uploadData = uploadResponse.data;
    console.log('📥 GHL Upload Response:', uploadData);

    // Extract file URL from response
    let fileUrl = null;
    if (uploadData.fileUrl) {
      fileUrl = uploadData.fileUrl;
    } else if (uploadData.url) {
      fileUrl = uploadData.url;
    } else if (uploadData.uploadedUrl) {
      fileUrl = uploadData.uploadedUrl;
    }

    if (!fileUrl) {
      console.error('❌ No file URL in response:', uploadData);
      return res.status(500).json({
        error: 'File uploaded but no URL returned',
        details: uploadData,
      });
    }

    console.log('✅ File uploaded successfully:', fileUrl);

    return res.status(200).json({
      success: true,
      fileUrl: fileUrl,
      message: 'File uploaded successfully',
    });

  } catch (error) {
    console.error('❌ Error uploading file:', error);

    // Handle axios errors
    if (error.response) {
      console.error('❌ GHL API Error Response:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Failed to upload file to GHL',
        details: error.response.data,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
