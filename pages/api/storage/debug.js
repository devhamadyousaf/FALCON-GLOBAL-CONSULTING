import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bucket = 'cvs' } = req.query;

    console.log('🔍 Debugging storage structure for bucket:', bucket);

    // List everything at root
    const { data: rootFiles, error: rootError } = await supabaseAdmin
      .storage
      .from(bucket)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (rootError) {
      return res.status(500).json({ 
        error: 'Failed to list root',
        details: rootError 
      });
    }

    const structure = {
      bucket,
      rootItems: rootFiles.map(f => ({
        name: f.name,
        id: f.id,
        metadata: f.metadata,
        created_at: f.created_at,
        isFolder: f.id?.endsWith('/') || !f.metadata
      }))
    };

    // For each folder, list contents
    const folders = rootFiles.filter(f => !f.metadata || f.id?.endsWith('/'));
    
    for (const folder of folders) {
      if (folder.name && folder.name !== '.emptyFolderPlaceholder') {
        const { data: folderContents, error: folderError } = await supabaseAdmin
          .storage
          .from(bucket)
          .list(folder.name, {
            limit: 50
          });

        if (!folderError && folderContents) {
          structure[`folder_${folder.name}`] = folderContents.map(f => ({
            name: f.name,
            id: f.id,
            path: `${folder.name}/${f.name}`,
            size: f.metadata?.size
          }));
        }
      }
    }

    console.log('📊 Storage structure:', JSON.stringify(structure, null, 2));

    return res.status(200).json(structure);

  } catch (error) {
    console.error('Debug storage error:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}
