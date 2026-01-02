import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Import existing cover letter PDFs from storage into templates table
 * This is a one-time migration utility for existing PDFs
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // List all files in user's cover-letters folder
    const { data: files, error: listError } = await supabase.storage
      .from('cover-letters')
      .list(userId);

    if (listError) {
      console.error('Error listing files:', listError);
      return res.status(500).json({ error: listError.message });
    }

    if (!files || files.length === 0) {
      return res.status(200).json({ 
        message: 'No PDFs found to import',
        imported: 0
      });
    }

    const imported = [];
    const errors = [];

    for (const file of files) {
      // Skip if not a PDF
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        continue;
      }

      // Check if template already exists for this file
      const { data: existing } = await supabase
        .from('cover_letter_templates')
        .select('id')
        .eq('user_id', userId)
        .eq('file_path', `${userId}/${file.name}`)
        .single();

      if (existing) {
        console.log(`Template already exists for ${file.name}, skipping`);
        continue;
      }

      // Create template record
      const templateData = {
        user_id: userId,
        name: file.name.replace('.pdf', '').replace(/_/g, ' '),
        type: 'pdf',
        file_path: `${userId}/${file.name}`,
        file_name: file.name,
        file_size: file.metadata?.size || 0,
        mime_type: 'application/pdf',
        is_active: true
      };

      const { data: template, error: insertError } = await supabase
        .from('cover_letter_templates')
        .insert([templateData])
        .select()
        .single();

      if (insertError) {
        console.error(`Error importing ${file.name}:`, insertError);
        errors.push({ file: file.name, error: insertError.message });
      } else {
        imported.push(template);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Imported ${imported.length} PDFs as templates`,
      imported: imported.length,
      errors: errors.length,
      details: {
        templates: imported,
        errors
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ error: error.message });
  }
}
