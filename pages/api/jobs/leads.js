import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, status } = req.query;

    console.log('Fetching job leads for:', { email, status });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Attempting to query table: Job-Leads');

    // Build query using admin client to bypass RLS
    let query = supabaseAdmin
      .from('Job-Leads')
      .select('*')
      .eq('email', email);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Order by created date (newest first)
    query = query.order('created_at', { ascending: false });

    console.log('Executing query...');
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      return res.status(500).json({ 
        error: 'Failed to fetch job leads',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    console.log(`Found ${data?.length || 0} job leads`);

    return res.status(200).json({ 
      success: true, 
      jobs: data || []
    });

  } catch (error) {
    console.error('Error in job leads API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch job leads',
      details: error.message 
    });
  }
}
