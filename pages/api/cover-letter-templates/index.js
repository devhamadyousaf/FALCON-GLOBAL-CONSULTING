import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getTemplates(req, res);
      case 'POST':
        return await createTemplate(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Cover letter templates API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getTemplates(req, res) {
  const { userId, isAdmin } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let query = supabase
    .from('cover_letter_templates')
    .select(`
      *,
      user_email:profiles!cover_letter_templates_user_id_fkey(email, full_name)
    `)
    .order('created_at', { ascending: false });

  // If admin, get all templates; otherwise, get only user's templates
  if (isAdmin !== 'true') {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ error: error.message });
  }

  // Set caching headers for better performance
  // Cache for 60 seconds, but allow revalidation
  res.setHeader('Cache-Control', 'private, max-age=60, must-revalidate');
  res.setHeader('ETag', `W/"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`);
  
  return res.status(200).json({ templates: data });
}

async function createTemplate(req, res) {
  const { userId, name, type, content, filePath, fileName, fileSize, mimeType } = req.body;

  if (!userId || !name || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type === 'text' && !content) {
    return res.status(400).json({ error: 'Content is required for text templates' });
  }

  if (type === 'pdf' && !filePath) {
    return res.status(400).json({ error: 'File path is required for PDF templates' });
  }

  const templateData = {
    user_id: userId,
    name,
    type,
    content: type === 'text' ? content : null,
    file_path: type === 'pdf' ? filePath : null,
    file_name: type === 'pdf' ? fileName : null,
    file_size: type === 'pdf' ? fileSize : null,
    mime_type: type === 'pdf' ? mimeType : null,
    is_active: true
  };

  const { data, error } = await supabase
    .from('cover_letter_templates')
    .insert([templateData])
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ template: data });
}
