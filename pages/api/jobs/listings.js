import { supabase } from '../../../lib/supabase';

/**
 * API Route: Get job listings from Supabase
 * GET /api/jobs/listings?location=&jobTitle=&limit=20&offset=0
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      location,
      jobTitle,
      companyName,
      limit = 20,
      offset = 0,
      status = 'active'
    } = req.query;

    // Build query
    let query = supabase
      .from('Job-Leads')
      .select('*', { count: 'exact' })
      .order('postedAt', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('Status', status);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (jobTitle) {
      query = query.ilike('jobTitle', `%${jobTitle}%`);
    }

    if (companyName) {
      query = query.ilike('companyName', `%${companyName}%`);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    return res.status(200).json({
      success: true,
      jobs,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Exception in jobs API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
