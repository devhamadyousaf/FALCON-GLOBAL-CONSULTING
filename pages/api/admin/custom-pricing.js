import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Verify admin authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Create Supabase client with user token
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  // Verify user is admin
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  // Use service role key for actual operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Handle different methods
  if (req.method === 'GET') {
    // Get custom pricing for a user
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('custom_pricing')
        .select(`
          *,
          created_by_profile:profiles!custom_pricing_created_by_fkey(full_name, email)
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json({ success: true, data: data || null });
    } catch (error) {
      console.error('Error fetching custom pricing:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    // Create or update custom pricing
    const { userId, silverPrice, goldPrice, diamondPrice, diamondPlusPrice, currency, notes } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    try {
      // Check if custom pricing already exists
      const { data: existing } = await supabaseAdmin
        .from('custom_pricing')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;

      if (existing) {
        // Update existing pricing
        const updateData = {
          currency: currency || 'USD',
          notes: notes || null,
          updated_at: new Date().toISOString()
        };

        // Only update prices that are provided
        if (silverPrice !== undefined && silverPrice !== null) updateData.silver_price = silverPrice;
        if (goldPrice !== undefined && goldPrice !== null) updateData.gold_price = goldPrice;
        if (diamondPrice !== undefined && diamondPrice !== null) updateData.diamond_price = diamondPrice;
        if (diamondPlusPrice !== undefined && diamondPlusPrice !== null) updateData.diamond_plus_price = diamondPlusPrice;

        const { data, error } = await supabaseAdmin
          .from('custom_pricing')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new pricing with all 4 plan prices
        const { data, error } = await supabaseAdmin
          .from('custom_pricing')
          .insert({
            user_id: userId,
            silver_price: silverPrice || 299,
            gold_price: goldPrice || 699,
            diamond_price: diamondPrice || 1600,
            diamond_plus_price: diamondPlusPrice || 1,
            currency: currency || 'USD',
            notes: notes || null,
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: existing ? 'Custom pricing updated successfully' : 'Custom pricing created successfully'
      });
    } catch (error) {
      console.error('Error saving custom pricing:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Delete custom pricing for a user
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    try {
      const { error } = await supabaseAdmin
        .from('custom_pricing')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Custom pricing deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting custom pricing:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
