import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Job Request API Called ===');
    console.log('Request body:', req.body);

    const { 
      email, 
      user_id, 
      keywords, 
      limit, 
      location, 
      remote, 
      sort, 
      platform, 
      cities, 
      experience, 
      freshness,
      cv_id,
      cover_letter_id
    } = req.body;

    // Validate required fields based on platform
    if (!email || !keywords) {
      console.error('Validation failed:', { email, keywords });
      return res.status(400).json({
        error: 'Missing required fields: email and keywords are required'
      });
    }

    // For non-Naukri platforms, location is required
    if (platform !== 'naukri' && !location) {
      console.error('Validation failed: location required for', platform);
      return res.status(400).json({
        error: 'Missing required field: location is required for this platform'
      });
    }

    // For Naukri, cities array is required
    if (platform === 'naukri' && (!cities || !Array.isArray(cities) || cities.length === 0)) {
      console.error('Validation failed: cities array required for Naukri');
      return res.status(400).json({
        error: 'Missing required field: cities array is required for Naukri platform'
      });
    }

    // Check for active campaigns (only 1 allowed at a time)
    const { data: activeCampaigns, error: checkError } = await supabase
      .from('job_campaigns')
      .select('id, title, status')
      .eq('user_email', email)
      .in('status', ['pending', 'processing']);

    if (checkError) {
      console.error('Error checking active campaigns:', checkError);
      return res.status(500).json({
        error: 'Failed to check active campaigns',
        details: checkError.message
      });
    }

    if (activeCampaigns && activeCampaigns.length > 0) {
      return res.status(400).json({
        error: 'You already have an active campaign running. Please wait for it to complete.',
        activeCampaign: activeCampaigns[0]
      });
    }

    // Prepare campaign data
    const selectedPlatform = platform || 'indeed';
    const campaignTitle = `${keywords} - ${location || cities?.join(', ') || 'Multiple locations'}`;
    
    const campaignData = {
      user_email: email,
      user_id: user_id || null,
      title: campaignTitle,
      keywords: keywords,
      job_limit: parseInt(limit) || 10,
      platform: selectedPlatform,
      status: 'pending',
      cv_id: cv_id || null,
      cover_letter_id: cover_letter_id || null
    };

    // Add platform-specific fields
    if (selectedPlatform === 'naukri') {
      campaignData.location = cities?.join(', ') || '';
      campaignData.cities = cities;
      campaignData.experience = experience || 'all';
      campaignData.freshness = freshness || 'all';
    } else {
      campaignData.location = location;
      campaignData.remote = remote || 'remote';
      campaignData.sort = sort || 'relevant';
    }

    console.log('💾 Saving campaign to database:', campaignData);

    // Save campaign to database
    const { data: campaign, error: insertError } = await supabase
      .from('job_campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({
        error: 'Failed to save campaign',
        details: insertError.message
      });
    }

    console.log('✅ Campaign saved successfully:', campaign);

    return res.status(200).json({ 
      success: true, 
      message: 'Campaign created successfully',
      campaign: campaign
    });

  } catch (error) {
    console.error('=== Error in job request API ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to submit job request',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
