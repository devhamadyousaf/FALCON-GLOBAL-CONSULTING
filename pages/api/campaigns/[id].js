import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Campaign ID is required' });
  }

  try {
    if (req.method === 'PATCH') {
      // Update campaign
      const updateData = req.body;
      
      console.log('📝 Updating campaign:', id);
      console.log('Update data:', updateData);

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.user_email;
      delete updateData.user_id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const { data: campaign, error } = await supabase
        .from('job_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        return res.status(500).json({
          error: 'Failed to update campaign',
          details: error.message
        });
      }

      console.log('✅ Campaign updated successfully:', campaign);

      return res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        campaign
      });

    } else if (req.method === 'DELETE') {
      // Delete campaign
      console.log('🗑️ Deleting campaign:', id);

      const { error } = await supabase
        .from('job_campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database delete error:', error);
        return res.status(500).json({
          error: 'Failed to delete campaign',
          details: error.message
        });
      }

      console.log('✅ Campaign deleted successfully');

      return res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully'
      });

    } else if (req.method === 'GET') {
      // Get single campaign
      const { data: campaign, error } = await supabase
        .from('job_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          error: 'Failed to fetch campaign',
          details: error.message
        });
      }

      if (!campaign) {
        return res.status(404).json({
          error: 'Campaign not found'
        });
      }

      return res.status(200).json({
        success: true,
        campaign
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('=== Error in campaign [id] API ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
