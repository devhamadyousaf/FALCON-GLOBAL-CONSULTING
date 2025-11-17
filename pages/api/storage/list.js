import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, bucket, email } = req.query;

    if ((!userId && !email) || !bucket) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing userId/email or bucket parameter' 
      });
    }

    // Validate bucket name
    if (!['cvs', 'cover-letters'].includes(bucket)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid bucket name. Must be "cvs" or "cover-letters"' 
      });
    }

    // Get the correct user ID from profiles table if email is provided
    let actualUserId = userId;
    
    if (email && !userId) {
      console.log('🔍 Looking up user ID from email:', email);
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.error('❌ Failed to get user ID from email:', profileError);
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      actualUserId = profile.id;
      console.log('✅ Found user ID:', actualUserId);
    }

    console.log(`📂 Listing files from bucket: ${bucket}, userId: ${actualUserId}`);

    // First, try listing from root to see structure
    const { data: rootFiles, error: rootError } = await supabaseAdmin
      .storage
      .from(bucket)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (rootError) {
      console.error(`Error listing root files from ${bucket}:`, rootError);
    } else {
      console.log(`📁 Found ${rootFiles.length} items at root level`);
      console.log('📁 Root items:', rootFiles.map(f => ({ name: f.name, id: f.id })));
    }

    // Try listing from user folder as well
    const { data: files, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .list(actualUserId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error(`Error listing files from ${bucket}/${actualUserId}:`, error);
      // If user folder doesn't exist or error, use root files
      if (rootFiles && !rootError) {
        console.log('⚠️ Using root files instead');
        const rootFileList = rootFiles
          .filter(file => file.name !== '.emptyFolderPlaceholder' && !file.id?.endsWith('/'))
          .map(file => {
            // Files at root level, just use the filename
            console.log(`📄 Root file: ${file.name}`);
            return {
              id: file.name, // Just the filename for root-level files
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at,
              updated_at: file.updated_at,
              path: file.name // Just filename for download
            };
          });
        
        return res.status(200).json({
          success: true,
          files: rootFileList
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    console.log(`📂 Raw files from ${bucket}/${actualUserId}:`, files.map(f => ({ id: f.id, name: f.name })));

    // Filter out folders (only return files)
    const fileList = files
      .filter(file => file.name !== '.emptyFolderPlaceholder' && !file.id?.endsWith('/'))
      .map(file => {
        // The full path for download is userId/filename
        const downloadPath = `${actualUserId}/${file.name}`;
        console.log(`📄 File mapping:`, {
          originalId: file.id,
          fileName: file.name,
          userId: actualUserId,
          downloadPath: downloadPath
        });
        return {
          id: downloadPath, // Use full path for download (userId/filename)
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          path: downloadPath // Full path for storage download
        };
      });

    console.log(`✅ Returning ${fileList.length} files with paths:`, fileList.map(f => f.path));

    return res.status(200).json({
      success: true,
      files: fileList
    });

  } catch (error) {
    console.error('Storage list error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
}
