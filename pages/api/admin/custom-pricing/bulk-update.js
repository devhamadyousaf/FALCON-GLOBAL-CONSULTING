import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

  // Get request data
  const { planName, newPrice } = req.body;

  if (!planName || newPrice === undefined) {
    return res.status(400).json({
      success: false,
      error: 'planName and newPrice are required'
    });
  }

  // Map plan name to column name
  const priceColumn = `${planName.replace('-', '_')}_price`;
  const validColumns = ['silver_price', 'gold_price', 'diamond_price', 'diamond_plus_price'];

  if (!validColumns.includes(priceColumn)) {
    return res.status(400).json({
      success: false,
      error: `Invalid plan name. Must be one of: silver, gold, diamond, diamond-plus`
    });
  }

  // Use service role key for actual operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Step 1: Get all users (excluding admins)
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .neq('role', 'admin');

    if (usersError) throw usersError;

    if (!allUsers || allUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No users found to update`,
        updatedCount: 0,
        createdCount: 0
      });
    }

    // Step 2: Get all existing custom pricing records
    const { data: existingPricing, error: fetchError } = await supabaseAdmin
      .from('custom_pricing')
      .select('user_id');

    if (fetchError) throw fetchError;

    const existingUserIds = new Set(existingPricing?.map(p => p.user_id) || []);

    // Step 3: Update all existing custom pricing with the new price for this plan
    let updatedCount = 0;
    if (existingPricing && existingPricing.length > 0) {
      const updateData = {
        [priceColumn]: newPrice,
        updated_at: new Date().toISOString()
      };

      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('custom_pricing')
        .update(updateData)
        .neq('user_id', '00000000-0000-0000-0000-000000000000') // Update all rows
        .select();

      if (updateError) throw updateError;
      updatedCount = updatedData?.length || 0;
    }

    // Step 4: Create custom pricing for users who don't have it yet
    const usersWithoutPricing = allUsers.filter(u => !existingUserIds.has(u.id));
    let createdCount = 0;

    if (usersWithoutPricing.length > 0) {
      const newPricingRecords = usersWithoutPricing.map(u => ({
        user_id: u.id,
        silver_price: planName === 'silver' ? newPrice : 299,
        gold_price: planName === 'gold' ? newPrice : 699,
        diamond_price: planName === 'diamond' ? newPrice : 1600,
        diamond_plus_price: planName === 'diamond-plus' ? newPrice : 1,
        currency: 'USD',
        notes: `Bulk update for ${planName} plan`,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: createdData, error: insertError } = await supabaseAdmin
        .from('custom_pricing')
        .insert(newPricingRecords)
        .select();

      if (insertError) throw insertError;
      createdCount = createdData?.length || 0;
    }

    const totalAffected = updatedCount + createdCount;

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${planName} pricing for ${totalAffected} user(s) (${updatedCount} updated, ${createdCount} created)`,
      updatedCount,
      createdCount,
      totalAffected
    });
  } catch (error) {
    console.error('Error bulk updating custom pricing:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
