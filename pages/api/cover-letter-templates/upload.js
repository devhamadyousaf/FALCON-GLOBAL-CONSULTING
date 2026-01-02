import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, name, fileData, fileName, mimeType } = req.body;

    if (!userId || !name || !fileData || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate PDF mime type
    if (!mimeType || mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Convert base64 to buffer
    const base64Data = fileData.split(',')[1] || fileData;
    const buffer = Buffer.from(base64Data, 'base64');
    const fileSize = buffer.length;

    // Check file size (max 5MB)
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cover-letters')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    // Create template record
    const templateData = {
      user_id: userId,
      name,
      type: 'pdf',
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      is_active: true
    };

    const { data: template, error: dbError } = await supabase
      .from('cover_letter_templates')
      .insert([templateData])
      .select()
      .single();

    if (dbError) {
      console.error('Error creating template record:', dbError);
      // Try to cleanup uploaded file
      await supabase.storage.from('cover-letters').remove([filePath]);
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(201).json({ template });
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
