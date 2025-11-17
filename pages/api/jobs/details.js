import { supabaseAdmin } from '../../../lib/supabase-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    console.log('Fetching job lead details for ID:', id);

    if (!id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('Job-Leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch job details',
        details: error.message 
      });
    }

    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('Job lead details fetched successfully');

    return res.status(200).json({ 
      success: true, 
      job: data
    });

  } catch (error) {
    console.error('Error in job details API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch job details',
      details: error.message 
    });
  }
}
