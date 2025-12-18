import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Verify admin access
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (req.method === 'GET') {
      const { status, platform, email, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('Job-Leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (platform) {
        query = query.eq('platform', platform);
      }
      if (email) {
        query = query.eq('email', email);
      }

      // Apply pagination
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      const { data: jobLeads, error, count } = await query;

      if (error) {
        console.error('Error fetching job leads:', error);
        return res.status(500).json({ error: 'Failed to fetch job leads' });
      }

      return res.status(200).json({
        success: true,
        jobLeads: jobLeads || [],
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }

    if (req.method === 'POST') {
      // Apply for a job on behalf of user or trigger job scraping
      const { action, userId, jobId, ...jobRequestData } = req.body;

      if (action === 'apply') {
        // Apply for a specific job
        if (!userId || !jobId) {
          return res.status(400).json({ error: 'userId and jobId are required for apply action' });
        }

        // Check if already applied
        const { data: existing } = await supabase
          .from('job_applications')
          .select('id')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .single();

        if (existing) {
          return res.status(400).json({ error: 'User has already applied for this job' });
        }

        // Create application
        const { data: application, error: applyError } = await supabase
          .from('job_applications')
          .insert({
            user_id: userId,
            job_id: jobId,
            status: 'submitted',
            applied_at: new Date().toISOString()
          })
          .select()
          .single();

        if (applyError) {
          console.error('Error creating application:', applyError);
          return res.status(500).json({ error: 'Failed to create application' });
        }

        // Update job lead status to APPLIED
        await supabase
          .from('Job-Leads')
          .update({ status: 'APPLIED' })
          .eq('id', jobId);

        return res.status(200).json({
          success: true,
          message: 'Job application created successfully',
          application
        });
      }

      if (action === 'request_jobs') {
        // Trigger job scraping for user
        const response = await fetch(`${req.headers.host}/api/jobs/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobRequestData)
        });

        const result = await response.json();
        return res.status(response.status).json(result);
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in job-leads API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
