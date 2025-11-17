import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name ('documents', 'cvs', 'cover-letters', 'avatars')
 * @param {string} userId - The user ID (for folder organization)
 * @param {string} folder - Optional subfolder within user's folder
 * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
 */
export const uploadFile = async (file, bucket, userId, folder = '') => {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!userId) {
      return { success: false, error: 'User ID required for file upload' };
    }

    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename to prevent overwriting
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop().toLowerCase();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\s+/g, '_');
    const baseFileName = sanitizedName.substring(0, sanitizedName.lastIndexOf('.')) || sanitizedName;
    const fileName = `${baseFileName}_${timestamp}_${randomString}.${fileExt}`;

    // Construct file path: userId/folder/filename
    const folderPath = folder ? `${userId}/${folder}` : userId;
    const filePath = `${folderPath}/${fileName}`;

    console.log(`📤 Uploading file to ${bucket}/${filePath}`);

    // Upload file with proper content type
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ File uploaded successfully:', filePath);

    // Get public URL (for public buckets like 'avatars')
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: filePath,
      url: publicUrl,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('❌ Exception in uploadFile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload multiple files at once
 * @param {File[]} files - Array of files to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} userId - The user ID
 * @param {string} folder - Optional subfolder
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFiles = async (files, bucket, userId, folder = '') => {
  const uploadPromises = files.map(file => uploadFile(file, bucket, userId, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - The file path to delete
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFile = async (filePath, bucket) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in deleteFile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a signed URL for a private file (valid for 1 hour)
 * @param {string} filePath - The file path
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{success: boolean, signedUrl?: string, error?: string}>}
 */
export const getSignedUrl = async (filePath, bucket) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (error) {
    console.error('Exception in getSignedUrl:', error);
    return { success: false, error: error.message };
  }
};

/**
 * List all files in a user's folder
 * @param {string} userId - The user ID
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - Optional subfolder
 * @returns {Promise<{success: boolean, files?: Array, error?: string}>}
 */
export const listUserFiles = async (userId, bucket, folder = '') => {
  try {
    const folderPath = folder ? `${userId}/${folder}` : userId;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath);

    if (error) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    console.error('Exception in listUserFiles:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save document metadata to database after upload
 * @param {string} userId - The user ID
 * @param {Object} fileData - File metadata from upload
 * @param {string} documentType - Type of document ('passport', 'cv', 'certificate', etc.)
 * @returns {Promise<{success: boolean, document?: Object, error?: string}>}
 */
export const saveDocumentMetadata = async (userId, fileData, documentType) => {
  try {
    console.log(`💾 Attempting to save metadata for ${documentType}...`);
    console.log('Metadata to save:', {
      user_id: userId,
      document_type: documentType,
      file_name: fileData.originalName,
      file_path: fileData.path,
      file_size: fileData.size,
      mime_type: fileData.type
    });

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        file_name: fileData.originalName,
        file_path: fileData.path,
        file_size: fileData.size,
        mime_type: fileData.type,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }

    console.log('✅ Metadata saved successfully:', data);
    return { success: true, document: data };
  } catch (error) {
    console.error('❌ Exception in saveDocumentMetadata:', error);
    console.error('Exception details:', error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * Upload document with metadata (combines upload + save metadata)
 * @param {File} file - The file to upload
 * @param {string} userId - The user ID
 * @param {string} documentType - Type of document
 * @param {string} bucket - The storage bucket (defaults to 'documents')
 * @returns {Promise<{success: boolean, document?: Object, filePath?: string, error?: string}>}
 */
export const uploadDocument = async (file, userId, documentType, bucket = 'documents') => {
  try {
    console.log(`📋 Starting upload for ${documentType}...`);
    
    // Upload file to storage
    const uploadResult = await uploadFile(file, bucket, userId, documentType);

    if (!uploadResult.success) {
      console.error(`❌ Upload failed for ${documentType}:`, uploadResult.error);
      return uploadResult;
    }

    console.log(`✅ File uploaded, saving metadata for ${documentType}...`);

    // Save metadata to database (removed timeout to prevent stuck uploads)
    const metadataResult = await saveDocumentMetadata(userId, uploadResult, documentType);

    if (!metadataResult.success) {
      console.error(`❌ Metadata save failed for ${documentType}:`, metadataResult.error);
      console.error(`🔧 LIKELY CAUSE: Database RLS policies not fixed yet!`);
      console.error(`🔧 SOLUTION: Run COMPLETE-FIX-INFINITE-RECURSION.sql in Supabase`);
      
      // Rollback: delete the uploaded file
      console.log(`🔄 Rolling back file upload...`);
      await deleteFile(uploadResult.path, bucket);
      return metadataResult;
    }

    console.log(`✅ ${documentType} uploaded and saved successfully!`);

    return {
      success: true,
      document: metadataResult.document,
      fileUrl: uploadResult.url,
      filePath: uploadResult.path
    };
  } catch (error) {
    console.error(`❌ Exception in uploadDocument for ${documentType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
      filePath: uploadResult.path
    };
  } catch (error) {
    console.error(`❌ Exception in uploadDocument for ${documentType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all documents for a user from database
 * @param {string} userId - The user ID
 * @param {string} documentType - Optional filter by document type
 * @returns {Promise<{success: boolean, documents?: Array, error?: string}>}
 */
export const getUserDocuments = async (userId, documentType = null) => {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get documents error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, documents: data };
  } catch (error) {
    console.error('Exception in getUserDocuments:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download a file from storage
 * @param {string} filePath - The file path
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>}
 */
export const downloadFile = async (filePath, bucket) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, blob: data };
  } catch (error) {
    console.error('Exception in downloadFile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, error?: string}}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    required = true
  } = options;

  if (!file && required) {
    return { valid: false, error: 'File is required' };
  }

  if (!file && !required) {
    return { valid: true };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

// Export bucket names as constants
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  CVS: 'cvs',
  COVER_LETTERS: 'cover-letters',
  AVATARS: 'avatars'
};

// Export document types as constants
export const DOCUMENT_TYPES = {
  PASSPORT: 'passport',
  CV: 'cv',
  CERTIFICATE: 'certificate',
  EXPERIENCE: 'experience',
  JOB_OFFER: 'job_offer',
  OTHER: 'other'
};
