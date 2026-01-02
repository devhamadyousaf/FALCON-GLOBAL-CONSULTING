import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await getTemplate(req, res, id);
      case 'PUT':
        return await updateTemplate(req, res, id);
      case 'DELETE':
        return await deleteTemplate(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Cover letter template API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getTemplate(req, res, id) {
  const { data, error } = await supabase
    .from('cover_letter_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Template not found' });
  }

  return res.status(200).json({ template: data });
}

async function updateTemplate(req, res, id) {
  const { name, content, isActive } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (content !== undefined) updateData.content = content;
  if (isActive !== undefined) updateData.is_active = isActive;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('cover_letter_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ template: data });
}

async function deleteTemplate(req, res, id) {
  // First, get the template to check if it has a file
  const { data: template, error: fetchError } = await supabase
    .from('cover_letter_templates')
    .select('file_path, type')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching template for deletion:', fetchError);
    return res.status(500).json({ error: fetchError.message });
  }

  // If it's a PDF, delete the file from storage
  if (template.type === 'pdf' && template.file_path) {
    const { error: storageError } = await supabase.storage
      .from('cover-letters')
      .remove([template.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with template deletion even if file deletion fails
    }
  }

  // Delete the template record
  const { error } = await supabase
    .from('cover_letter_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Template deleted successfully' });
}
