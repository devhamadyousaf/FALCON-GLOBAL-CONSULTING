import { supabaseAdmin } from '../../../lib/supabase-server';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      jobIds, 
      email, 
      accessToken, 
      refreshToken, 
      gmailAccountId,
      cvId,
      coverLetterId 
    } = req.body;

    console.log('📥 Bulk-send received request:');
    console.log('- Job IDs:', jobIds);
    console.log('- Email:', email);
    console.log('- Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
    console.log('- Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'MISSING');
    console.log('- Gmail Account ID:', gmailAccountId);
    console.log('- CV ID:', cvId);
    console.log('- Cover Letter ID:', coverLetterId);

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      console.error('❌ Invalid job IDs');
      return res.status(400).json({ error: 'Job IDs are required' });
    }

    if (!email || !accessToken || !refreshToken) {
      console.error('❌ Missing required fields:', { email: !!email, accessToken: !!accessToken, refreshToken: !!refreshToken });
      return res.status(400).json({ error: 'Email and tokens are required' });
    }

    console.log('Sending bulk job applications:', {
      jobCount: jobIds.length,
      email,
      gmailAccountId,
      cvId,
      coverLetterId
    });

    // Fetch CV file from storage
    let cvFile = null;
    if (cvId) {
      console.log('📄 Attempting to fetch CV...');
      console.log('- CV ID/Path received:', cvId);
      console.log('- Bucket: cvs');
      
      try {
        // First, try to get the public URL to see if file exists
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('cvs')
          .getPublicUrl(cvId);
        
        console.log('🔗 Public URL:', publicUrlData.publicUrl);
        
        // Try downloading with the path as-is
        let cvData, cvError;
        
        // Attempt 1: Try as-is
        console.log('🔄 Attempt 1: Downloading as-is...');
        ({ data: cvData, error: cvError } = await supabaseAdmin.storage
          .from('cvs')
          .download(cvId));

        if (cvError) {
          console.error('❌ Attempt 1 failed:', cvError.message);
          
          // Attempt 2: Try with public download
          console.log('🔄 Attempt 2: Fetching from public URL...');
          const fetchResponse = await fetch(publicUrlData.publicUrl);
          
          if (!fetchResponse.ok) {
            console.error('❌ Attempt 2 failed:', fetchResponse.status, fetchResponse.statusText);
            throw new Error(`Failed to fetch CV from both download and public URL. Status: ${fetchResponse.status}`);
          }
          
          cvData = await fetchResponse.blob();
          console.log('✅ CV fetched from public URL');
        } else {
          console.log('✅ CV fetched from download API');
        }

        if (!cvData) {
          throw new Error('No CV data received');
        }
        if (!cvData) {
          throw new Error('No CV data received');
        }

        // Keep as buffer for binary data
        const cvBuffer = Buffer.from(await cvData.arrayBuffer());

        cvFile = {
          name: cvId.split('/').pop(), // Extract filename from path
          buffer: cvBuffer,
          mimeType: cvData.type || 'application/pdf',
          size: cvBuffer.length
        };
        console.log('✅ CV file processed:', cvFile.name, `(${(cvFile.size / 1024).toFixed(2)} KB)`);
      } catch (error) {
        console.error('❌ Error fetching CV:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch CV file',
          details: error.message 
        });
      }
    }

    // Fetch Cover Letter file from storage
    let coverLetterFile = null;
    if (coverLetterId) {
      console.log('📄 Attempting to fetch cover letter...');
      console.log('- Cover Letter ID/Path received:', coverLetterId);
      console.log('- Bucket: cover-letters');
      
      try {
        // First, try to get the public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('cover-letters')
          .getPublicUrl(coverLetterId);
        
        console.log('🔗 Public URL:', publicUrlData.publicUrl);
        
        // Try downloading with the path as-is
        let clData, clError;
        
        // Attempt 1: Try as-is
        console.log('🔄 Attempt 1: Downloading as-is...');
        ({ data: clData, error: clError } = await supabaseAdmin.storage
          .from('cover-letters')
          .download(coverLetterId));

        if (clError) {
          console.error('❌ Attempt 1 failed:', clError.message);
          
          // Attempt 2: Try with public download
          console.log('🔄 Attempt 2: Fetching from public URL...');
          const fetchResponse = await fetch(publicUrlData.publicUrl);
          
          if (!fetchResponse.ok) {
            console.error('❌ Attempt 2 failed:', fetchResponse.status, fetchResponse.statusText);
            throw new Error(`Failed to fetch cover letter from both download and public URL. Status: ${fetchResponse.status}`);
          }
          
          clData = await fetchResponse.blob();
          console.log('✅ Cover letter fetched from public URL');
        } else {
          console.log('✅ Cover letter fetched from download API');
        }

        if (!clData) {
          throw new Error('No cover letter data received');
        }

        // Keep as buffer for binary data
        const clBuffer = Buffer.from(await clData.arrayBuffer());

        coverLetterFile = {
          name: coverLetterId.split('/').pop(), // Extract filename from path
          buffer: clBuffer,
          mimeType: clData.type || 'application/pdf',
          size: clBuffer.length
        };
        console.log('✅ Cover letter file processed:', coverLetterFile.name, `(${(coverLetterFile.size / 1024).toFixed(2)} KB)`);
      } catch (error) {
        console.error('❌ Error fetching cover letter:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch cover letter file',
          details: error.message 
        });
      }
    }

    // Prepare multipart form data for webhook
    const formData = new FormData();

    // Add text fields
    formData.append('job_ids', JSON.stringify(jobIds));
    formData.append('user_email', email);
    formData.append('gmail_account_id', gmailAccountId);
    formData.append('access_token', accessToken);
    formData.append('refresh_token', refreshToken);
    formData.append('timestamp', new Date().toISOString());

    // Add binary file attachments
    if (cvFile) {
      formData.append('cv', cvFile.buffer, {
        filename: cvFile.name,
        contentType: cvFile.mimeType
      });
    }

    if (coverLetterFile) {
      formData.append('cover_letter', coverLetterFile.buffer, {
        filename: coverLetterFile.name,
        contentType: coverLetterFile.mimeType
      });
    }

    console.log('📦 Webhook payload prepared (multipart/form-data):');
    console.log('📋 Text Fields:');
    console.log('  - job_ids:', JSON.stringify(jobIds));
    console.log('  - user_email:', email);
    console.log('  - gmail_account_id:', gmailAccountId);
    console.log('  - access_token:', accessToken ? `${accessToken.substring(0, 30)}...` : 'MISSING');
    console.log('  - refresh_token:', refreshToken ? `${refreshToken.substring(0, 30)}...` : 'MISSING');
    console.log('  - timestamp:', new Date().toISOString());
    console.log('📎 Binary Files:');
    console.log('  - Has CV:', !!cvFile);
    console.log('  - Has Cover Letter:', !!coverLetterFile);
    if (cvFile) {
      console.log(`  - CV: ${cvFile.name} (${(cvFile.size / 1024).toFixed(2)} KB, ${cvFile.mimeType})`);
    }
    if (coverLetterFile) {
      console.log(`  - Cover Letter: ${coverLetterFile.name} (${(coverLetterFile.size / 1024).toFixed(2)} KB, ${coverLetterFile.mimeType})`);
    }

    // Send to webhook with multipart/form-data
    // We need to get the buffer from formData since fetch expects a different format
    const formDataBuffer = formData.getBuffer();
    const formDataHeaders = formData.getHeaders();

    const response = await fetch('https://etgstkql.rcld.app/webhook/0da32b08-c8b9-492e-9805-628d6a23d972', {
      method: 'POST',
      headers: formDataHeaders,
      body: formDataBuffer
    });

    const responseText = await response.text();
    console.log('Webhook response status:', response.status);
    console.log('Webhook response:', responseText);

    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.log('Response is not JSON');
      data = { message: responseText };
    }

    if (!response.ok) {
      console.error('Webhook error:', data);
      throw new Error(`Webhook returned ${response.status}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Applications sent successfully',
      data 
    });

  } catch (error) {
    console.error('Bulk send error:', error);
    return res.status(500).json({ 
      error: 'Failed to send applications',
      details: error.message 
    });
  }
}
