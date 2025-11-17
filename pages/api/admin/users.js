import { supabaseAdmin } from '../../../lib/supabase-server';

/**
 * API Route: Get all users (Admin only)
 * GET /api/admin/users
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all profiles from database
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Return sanitized user data (remove sensitive info if any)
    const users = profiles.map(profile => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      country: profile.country,
      role: profile.role,
      onboardingComplete: profile.onboarding_complete,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }));

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Exception in users API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
