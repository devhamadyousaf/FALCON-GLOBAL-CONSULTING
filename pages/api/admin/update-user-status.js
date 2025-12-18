import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('=== Update User Status API Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      console.log('No auth header');
      return res.status(401).json({ error: 'Unauthorized - No auth header' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth user:', user?.id, 'Error:', authError);

    if (authError || !user) {
      console.log('Auth failed:', authError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('Profile:', profile, 'Error:', profileError);

    if (!profile || profile.role !== 'admin') {
      console.log('Not admin:', profile);
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Get request data
    const { userId, onboardingComplete } = req.body;
    console.log('Request params - userId:', userId, 'onboardingComplete:', onboardingComplete);

    if (!userId || onboardingComplete === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId and onboardingComplete are required'
      });
    }

    // Update user profile
    console.log('Updating profile for user:', userId);
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_complete: onboardingComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    console.log('Update result:', updatedProfile, 'Error:', updateError);

    if (updateError) {
      console.error('Error updating user status:', updateError);
      return res.status(500).json({
        error: 'Failed to update user status',
        details: updateError.message
      });
    }

    // If marking as complete, ensure onboarding_data exists and is updated
    if (onboardingComplete) {
      // Check if onboarding_data exists
      const { data: existingOnboarding } = await supabase
        .from('onboarding_data')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingOnboarding) {
        // Create onboarding_data record if it doesn't exist
        await supabase
          .from('onboarding_data')
          .insert({
            user_id: userId,
            current_step: 4,
            completed_steps: [0, 1, 2, 3, 4],
            relocation_type: 'europe',
            personal_details: {},
            visa_check: {},
            payment_completed: true,
            call_scheduled: true,
            documents_uploaded: true
          });
      } else {
        // Update existing onboarding_data
        await supabase
          .from('onboarding_data')
          .update({
            current_step: 4,
            completed_steps: [0, 1, 2, 3, 4],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }

    console.log('Successfully updated user status');
    return res.status(200).json({
      success: true,
      message: `User onboarding status updated to ${onboardingComplete ? 'complete' : 'incomplete'}`,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error in update-user-status API:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
