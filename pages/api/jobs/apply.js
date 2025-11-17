import { supabase } from '../../../lib/supabase';

/**
 * API Route: Apply to a job
 * POST /api/jobs/apply
 * Body: { jobId, userId, cvUrl, coverLetterUrl }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobId, userId, cvUrl, coverLetterUrl, notes } = req.body;

    // Validate required fields
    if (!jobId || !userId) {
      return res.status(400).json({ error: 'Job ID and User ID are required' });
    }

    // Check if user already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    // Create application
    const { data: application, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: userId,
        job_id: jobId,
        cv_url: cvUrl,
        cover_letter_url: coverLetterUrl,
        notes,
        status: 'pending',
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return res.status(500).json({ error: 'Failed to create application' });
    }

    // TODO: Trigger email sending via n8n webhook
    // This would send the CV and cover letter to the company's HR email

    return res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Exception in apply API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
