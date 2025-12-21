import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, user_id, platform, status, limit = 50, offset = 0 } = req.query;

    // Build query
    let query = supabase
      .from('job_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by email or user_id
    if (email) {
      query = query.eq('user_email', email);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    } else {
      return res.status(400).json({
        error: 'Either email or user_id parameter is required'
      });
    }

    // Optional filters
    if (platform) {
      query = query.eq('platform', platform);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Failed to fetch campaigns',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      campaigns,
      count: campaigns.length,
      total: count
    });

  } catch (error) {
    console.error('=== Error in campaigns API ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      error: 'Failed to fetch campaigns',
      details: error.message
    });
  }
}
